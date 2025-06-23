// components/teams/team-admin/index.tsx
import { Box, Button, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useCallback, useState } from "react"; // Add useState and useCallback
import Requests from "~/components/requests";
import PageTitle from "~/components/utils/page-title";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import type { TeamType } from "~/utils/types";
import TransferTeamOwnershipModal from "../transfer-team-ownership"; // Adjust import path as needed

type TeamAdminProps = {
  team: TeamType;
  role: string;
  requestCount: number;
  setRequestCount: (count: number) => void;
  setRole: (role: string) => void; // Prop to update role in TeamHub after ownership transfer
};

const TeamAdmin = ({
  team,
  role,
  requestCount,
  setRequestCount,
  setRole,
}: TeamAdminProps) => {
  const router = useRouter();
  const { setAffReload } = useAuthContext(); // To trigger affiliation reload after delete

  // State for controlling modal visibility
  const [isTransferOwnerModalOpen, setIsTransferOwnerModalOpen] =
    useState(false);
  const [isDeleteMenuOpen, setIsDeleteMenuOpen] = useState(false); // State for DeleteMenu

  const openTransferTeamModal = useCallback((isOpen: boolean) => {
    setIsTransferOwnerModalOpen(isOpen);
  }, []);

  const handleDeleteTeam = useCallback(async () => {
    const { data, error } = await supabase
      .from("teams")
      .delete()
      .eq("id", team.id)
      .select();

    if (error) {
      console.error("Error deleting team:", error.message);
      // Optionally show a user-friendly error message
      return;
    }

    if (data) {
      setAffReload(true); // Trigger a reload of user affiliations
      void router.push("/"); // Redirect to home page after deletion
    }
  }, [team.id, router, setAffReload]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: { xs: 2, md: 4 }, // Spacing between sections
        width: "100%",
        maxWidth: "800px", // Optional: limit width for better readability on large screens
        mx: "auto", // Center the content
        p: { xs: 1, md: 2 }, // Padding inside the admin section
      }}
    >
      {/* Join Requests Section */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <PageTitle
          size="small"
          title={`Join Requests (${requestCount})`}
          fullWidth={false}
        />
        <Requests team={team} setRequestCount={setRequestCount} />
      </Box>

      {/* Admin Actions Section */}
      {(role === "owner" || role === "coach") && (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            mt: { xs: 2, md: 4 }, // Margin top to separate from requests
          }}
        >
          {/* Coach/Owner actions */}
          {role === "owner" && (
            <>
              <PageTitle size="small" title="Owner Tools" fullWidth={false} />
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => openTransferTeamModal(true)}
                  sx={{ flexGrow: 1, maxWidth: { xs: "100%", sm: "250px" } }}
                >
                  Transfer Ownership
                </Button>
                <Button
                  variant="contained"
                  onClick={() => router.push(`/team-settings/${team.id}`)}
                  sx={{ flexGrow: 1, maxWidth: { xs: "100%", sm: "250px" } }}
                >
                  Team Settings
                </Button>
                {/* Delete Team Button */}
                {!isDeleteMenuOpen ? (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => setIsDeleteMenuOpen(true)}
                    sx={{ flexGrow: 1, maxWidth: { xs: "100%", sm: "250px" } }}
                  >
                    Delete Team
                  </Button>
                ) : (
                  <Box
                    sx={{
                      display: "flex",

                      gap: 2,
                      justifyContent: "center",
                    }}
                  >
                    <Button
                      variant="contained"
                      color="error"
                      onClick={handleDeleteTeam}
                    >
                      Confirm Delete
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setIsDeleteMenuOpen(false)}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </Box>
            </>
          )}

          {/* Transfer Ownership Modal */}
          {role === "owner" && (
            <TransferTeamOwnershipModal
              setIsOpen={openTransferTeamModal}
              team={team}
              isOpen={isTransferOwnerModalOpen}
              setRole={setRole} // Pass setRole to update TeamHub's role state
            />
          )}
        </Box>
      )}
      {!(role === "owner" || role === "coach") && (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ textAlign: "center", mt: 4 }}
        >
          You do not have administrative privileges for this team.
        </Typography>
      )}
    </Box>
  );
};

export default TeamAdmin;
