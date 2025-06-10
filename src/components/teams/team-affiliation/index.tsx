import { Box, Divider, Typography } from "@mui/material"; // Import Box, Divider, Typography
import { useRouter } from "next/router";
import { useIsDarkContext } from "~/pages/_app";
import type { TeamAffiliationType } from "~/utils/types";
import TeamLogo from "../team-logo";

type TeamAffiliationProps = {
  aff: TeamAffiliationType;
  handleClose?: () => void;
  small?: boolean;
  listItem?: boolean;
};

const TeamAffiliation = ({
  aff,
  handleClose,
  small,
  listItem,
}: TeamAffiliationProps) => {
  const { hoverBorder } = useIsDarkContext(); // Use the hoverBorder from context
  const router = useRouter();

  const handleTeamClick = (
    e: React.MouseEvent<HTMLDivElement>, // Keep as HTMLDivElement as Box renders a div
    teamId: string,
  ) => {
    e.stopPropagation();
    if (handleClose) handleClose();
    void router.push(`/team-hub/${teamId}`);
  };

  return (
    <Box
      key={aff.team.id}
      onClick={(e) => handleTeamClick(e, aff.team.id)}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 1, // Slightly increased gap for better spacing
        // Conditional styling for hover effect, only if not in listItem mode
        cursor: "pointer",
        borderRadius: "8px", // Apply some border radius
        p: 1, // Add padding for visual comfort
        transition:
          "background-color 0.3s ease-in-out, border-color 0.3s ease-in-out", // Smooth transition
        ...(listItem
          ? {} // No special hover for listItem
          : {
              border: `1px solid transparent`, // Initial transparent border
              "&:hover": {
                borderColor: hoverBorder, // Apply hover border color
                backgroundColor: "action.hover", // Subtle background on hover
              },
            }),
      }}
    >
      <TeamLogo tm={aff.team} size={25} />
      <Divider flexItem orientation="vertical" variant="middle" />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start", // Align text to start
          justifyContent: "center",
          lineHeight: 1.2, // Tighter line height for compactness
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography
            variant={small ? "body2" : "body1"} // Use body2 for smaller text
            sx={{
              fontWeight: "bold",
              letterSpacing: "-0.025em", // Converted from tracking-tight
              lineHeight: "inherit", // Inherit from parent Box
            }}
          >
            {aff.team.full_name}
          </Typography>
          {aff.number && (
            <Typography
              variant={small ? "caption" : "body2"} // Use caption for smaller numbers
              sx={{ lineHeight: "inherit" }}
            >
              #{aff.number}
            </Typography>
          )}
        </Box>
        <Typography
          variant={small ? "caption" : "body2"} // Use caption for smaller role text
          sx={{ fontStyle: "italic", lineHeight: "inherit" }}
        >
          {aff.role}
        </Typography>
      </Box>
    </Box>
  );
};

export default TeamAffiliation;
