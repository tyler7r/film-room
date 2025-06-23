// components/requests/index.tsx (UPDATED)

import { Box, Button, Typography } from "@mui/material"; // Import Box and Typography for MUI styling
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import type { PlayerType, TeamType } from "~/utils/types";
import EmptyMessage from "../utils/empty-msg";

type RequestsProps = {
  team: TeamType;
  setRequestCount: (count: number) => void;
};

const Requests = ({ team, setRequestCount }: RequestsProps) => {
  const { setAffReload } = useAuthContext();
  const [requests, setRequests] = useState<PlayerType[] | null>(null);

  const fetchRequests = async () => {
    const { data, count } = await supabase
      .from("user_view")
      .select("*", { count: "exact" })
      .match({ "team->>id": team.id, "affiliation->>verified": false });

    if (data && data.length > 0) {
      setRequests(data);
    } else {
      setRequests(null); // Set to null if no data or empty array
    }

    if (count && count > 0) {
      setRequestCount(count);
    } else {
      setRequestCount(0); // Set count to 0 if no requests
    }
  };

  const handleAccept = async (id: string) => {
    const { data, error } = await supabase
      .from("affiliations")
      .update({
        verified: true,
      })
      .eq("id", id)
      .select();
    if (error) {
      console.error("Error accepting request:", error.message);
      // Handle error (e.g., show a toast message)
      return;
    }
    if (data) {
      void fetchRequests(); // Re-fetch requests after update
      setAffReload(true); // Trigger affiliation reload
    }
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase.from("affiliations").delete().eq("id", id);
    if (error) {
      console.error("Error rejecting request:", error.message);
      // Handle error
      return;
    }
    void fetchRequests(); // Re-fetch requests after deletion
    setAffReload(true); // Trigger affiliation reload
  };

  useEffect(() => {
    void fetchRequests(); // Initial fetch when component mounts
    // Consider adding a realtime listener here if requests can change externally frequently
  }, [team.id]); // Add team.id as a dependency to refetch if team changes

  // Always render the content, as visibility is now controlled by TeamAdmin
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: "100%", // Take full width of parent
        alignItems: "center", // Center items
        p: { xs: 1, sm: 2 }, // Add some padding
        borderRadius: "8px",
        // Removed fixed backgroundStyle for better theming with MUI Box
        // If specific background is needed, use bgcolor prop
        bgcolor: "background.paper", // Example background color
        boxShadow: 1, // Example shadow
      }}
    >
      {/* PageTitle is now handled by the TeamAdmin component itself,
          or it can be kept here if each section needs its own sub-title within TeamAdmin.
          For consistency with TeamAdmin's `PageTitle` for "Join Requests", I'll remove it here.
      */}
      {/* <PageTitle title="Join Requests" size="small" /> */}

      {!requests && <EmptyMessage message="requests" />}
      {requests?.map((req) => (
        <Box
          key={req.affiliation.id}
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" }, // Stack on mobile, row on desktop
            alignItems: "center",
            justifyContent: { xs: "center", sm: "space-between" },
            gap: { xs: 1, sm: 2 }, // Responsive gap
            width: "100%",
            p: { xs: 2, sm: 1 },
            borderRadius: "4px",
            // Use MUI theme colors/props instead of `backgroundStyle`
            bgcolor: "action.hover", // Light background for each request item
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "center", sm: "flex-start" },
              justifyContent: "center",
              textAlign: { xs: "center", sm: "left" },
              flexGrow: 1, // Allow text content to grow
            }}
          >
            <Typography
              variant="body1"
              sx={{ fontWeight: "bold", letterSpacing: "-0.025em" }}
            >
              {req.profile.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {req.profile.email}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ({req.affiliation.role})
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: 1, // Gap between buttons
              flexShrink: 0, // Prevent buttons from shrinking
            }}
          >
            <Button
              variant="outlined" // Outlined for less prominence than contained
              color="success"
              onClick={() => handleAccept(req.affiliation.id)}
              size="small"
            >
              Accept
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleReject(req.affiliation.id)}
              size="small"
            >
              Reject
            </Button>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default Requests;
