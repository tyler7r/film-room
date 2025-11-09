import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockIcon from "@mui/icons-material/Lock";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import TeamAdmin from "~/components/teams/team-admin";
import PageTitle from "~/components/utils/page-title";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import type { TeamAffiliationType, TeamType } from "~/utils/types";

/**
 * Component to display when a user is not authorized to view the admin page.
 */
const AccessDenied = ({ teamName }: { teamName: string }) => {
  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        p: 4,
        textAlign: "center",
      }}
    >
      <LockIcon sx={{ fontSize: "96px", color: "error.main" }} />
      <Typography
        variant="h5"
        sx={{ fontWeight: "bold", color: "text.primary" }}
      >
        Access Restricted for {teamName}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        You must be an **Owner** or **Coach** to access these administration
        tools.
      </Typography>
    </Box>
  );
};

/**
 * Main component for the /team-hub/[teamId]/admin route.
 * Handles fetching team data, user role, and access control.
 */
const TeamAdminRoute = () => {
  const router = useRouter();
  const { user, affiliations } = useAuthContext();

  const teamId = router.query.team as string;

  const [team, setTeam] = useState<TeamType | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [requestCount, setRequestCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // --- Data Fetching and Role Calculation ---

  const fetchTeamAndRole = useCallback(async () => {
    if (!teamId || !user?.userId) {
      setLoading(false);
      return;
    }

    // 1. Fetch Team
    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .select()
      .eq("id", teamId)
      .single();

    if (teamError) {
      console.error("Error fetching team:", teamError);
      setTeam(null);
    } else if (teamData) {
      setTeam(teamData as TeamType);

      // 2. Determine Role
      let determinedRole = "guest";
      const affiliation: TeamAffiliationType | undefined = affiliations?.find(
        (aff) => aff.team.id === teamData.id,
      );

      if (teamData.owner === user.userId) {
        determinedRole = "owner";
      } else if (affiliation?.role) {
        determinedRole = affiliation.role;
      }
      setRole(determinedRole);
    }

    setLoading(false);
  }, [teamId, user?.userId, affiliations]);

  useEffect(() => {
    setLoading(true);
    void fetchTeamAndRole();
  }, [fetchTeamAndRole]);

  // --- Rendering Logic ---

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
          flexDirection: "column",
          width: "100%",
        }}
      >
        <CircularProgress size={80} />
        <PageTitle size="small" title="Checking Admin Privileges..." />
      </Box>
    );
  }

  const isAuthorized = role === "owner" || role === "coach";

  if (!team || !isAuthorized) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "calc(100vh - 64px)",
          width: "100%",
          p: 2,
        }}
      >
        <AccessDenied teamName={team?.full_name ?? "Team"} />
      </Box>
    );
  }

  // User is authorized and team data is loaded
  return (
    <Box
      sx={{
        width: "100%",
        p: { xs: 1, md: 4 },
      }}
    >
      {/* Back Button for easy navigation */}
      <Box sx={{ textAlign: "left" }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push(`/team-hub/${teamId}`)}
          variant="text"
        >
          Back to Team Hub
        </Button>
      </Box>

      <PageTitle
        size="large"
        title={`${team.full_name} Admin`}
        fullWidth={false}
      />
      <TeamAdmin
        team={team}
        role={role ? role : "guest"}
        requestCount={requestCount}
        setRequestCount={setRequestCount}
        setRole={setRole}
      />
    </Box>
  );
};

export default TeamAdminRoute;
