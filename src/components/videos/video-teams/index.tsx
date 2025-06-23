import CloseIcon from "@mui/icons-material/Close";
import GroupsIcon from "@mui/icons-material/Groups";
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import React, { useState } from "react";
import TeamLogo from "~/components/teams/team-logo";
import type { TeamType } from "~/utils/types";

type VideoAffiliatedTeamsChipProps = {
  affiliatedTeams: TeamType[] | null;
};

const VideoAffiliatedTeamsChip = ({
  affiliatedTeams,
}: VideoAffiliatedTeamsChipProps) => {
  const router = useRouter();
  const [showTeamsDialog, setShowTeamsDialog] = useState<boolean>(false);

  const handleTeamChipClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent any parent click handlers
    setShowTeamsDialog(true);
  };

  const handleCloseTeamsDialog = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTeamsDialog(false);
  };

  const handleTeamClickInDialog = (e: React.MouseEvent, teamId: string) => {
    e.stopPropagation();
    void router.push(`/team-hub/${teamId}`);
    setShowTeamsDialog(false); // Close dialog after navigating
  };

  if (!affiliatedTeams || affiliatedTeams.length === 0) {
    return null; // Don't render anything if no affiliated teams
  }

  return (
    <Box sx={{ flexShrink: 0 }}>
      <Chip
        icon={<GroupsIcon fontSize="small" />}
        label={`Team Mentions (${affiliatedTeams.length})`}
        onClick={handleTeamChipClick}
        variant="outlined"
        sx={{
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "0.75rem",
          height: "24px",
          flexShrink: 0,
        }}
      />

      <Dialog
        open={showTeamsDialog}
        onClose={handleCloseTeamsDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ m: 0, p: 1, px: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Team Mentions
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleCloseTeamsDialog}
            sx={{
              position: "absolute",
              right: 4,
              top: 4,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0.5 }}>
          <List dense>
            {affiliatedTeams.map((team) => (
              <ListItem
                key={team.id}
                onClick={(e) => handleTeamClickInDialog(e, team.id)}
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                  borderRadius: 2,
                  mb: 0.5,
                  px: 1.5,
                  py: 0.5,
                  display: "flex",
                  gap: 1,
                }}
              >
                <TeamLogo tm={team} size={30} inactive={true} />
                <ListItemText
                  primary={
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                      {team.full_name}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default VideoAffiliatedTeamsChip;
