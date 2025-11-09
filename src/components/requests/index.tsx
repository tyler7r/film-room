import { Box, Button, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import type { PlayerType, TeamType } from "~/utils/types";
import EmptyMessage from "../utils/empty-msg";

type RequestsProps = {
  team: TeamType;
  setRequestCount: (count: number) => void;
};

// --- HELPER FUNCTION TO SEND DECISION EMAIL ---
const sendDecisionEmail = async (
  team: TeamType,
  player: PlayerType,
  isAccepted: boolean,
) => {
  const type = isAccepted ? "acceptance" : "rejection";
  const subject = isAccepted
    ? `✅ Request Accepted for ${team.full_name}`
    : `❌ Request Rejected for ${team.full_name}`;

  try {
    const response = await fetch("/api/team-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: type,
        title: subject,
        team: {
          id: team.id,
          full_name: team.full_name,
        },
        player: {
          id: player.profile.id,
          name: player.profile.name,
        },
        recipient: {
          id: player.profile.id,
          email: player.profile.email,
        },
      }),
    });
    if (!response.ok) {
      console.error("Team decision email API failed:", await response.json());
    }
  } catch (error) {
    console.error("Failed to send team decision email:", error);
  }
};
// --- END HELPER FUNCTION ---

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

  const handleAccept = async (req: PlayerType) => {
    const { data, error } = await supabase
      .from("affiliations")
      .update({
        verified: true,
      })
      .eq("id", req.affiliation.id)
      .select();

    if (error) {
      console.error("Error accepting request:", error.message);
      return;
    }

    if (data) {
      // 1. Send acceptance notification to the player
      void sendDecisionEmail(team, req, true);

      // 2. Re-fetch and trigger reload
      void fetchRequests();
      setAffReload(true);
    }
  };

  const handleReject = async (req: PlayerType) => {
    const { error } = await supabase
      .from("affiliations")
      .delete()
      .eq("id", req.affiliation.id);

    if (error) {
      console.error("Error rejecting request:", error.message);
      return;
    }

    // 1. Send rejection notification to the player
    void sendDecisionEmail(team, req, false);

    // 2. Re-fetch and trigger reload
    void fetchRequests();
    setAffReload(true);
  };

  useEffect(() => {
    void fetchRequests();
  }, [team.id]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: "100%",
        alignItems: "center",
        p: { xs: 1, sm: 2 },
        borderRadius: "8px",
        bgcolor: "background.paper",
        boxShadow: 1,
      }}
    >
      {!requests && <EmptyMessage message="requests" />}
      {requests?.map((req) => (
        <Box
          key={req.affiliation.id}
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            justifyContent: { xs: "center", sm: "space-between" },
            gap: { xs: 1, sm: 2 },
            width: "100%",
            p: { xs: 2, sm: 1 },
            borderRadius: "4px",
            bgcolor: "action.hover",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "center", sm: "flex-start" },
              justifyContent: "center",
              textAlign: { xs: "center", sm: "left" },
              flexGrow: 1,
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
              gap: 1,
              flexShrink: 0,
            }}
          >
            <Button
              variant="outlined"
              color="success"
              onClick={() => handleAccept(req)}
              size="small"
            >
              Accept
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleReject(req)}
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
