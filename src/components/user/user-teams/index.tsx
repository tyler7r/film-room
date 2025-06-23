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
import React, { useEffect, useState } from "react";
import TeamLogo from "~/components/teams/team-logo";
import { supabase } from "~/utils/supabase";
import type { TeamAffiliationType, UserType } from "~/utils/types";

type UserAffiliationsChipProps = {
  user: UserType; // The user whose affiliations are to be displayed
};

const UserAffiliationsChip = ({ user }: UserAffiliationsChipProps) => {
  const router = useRouter();
  const [userAffiliations, setUserAffiliations] = useState<
    TeamAffiliationType[] | null
  >(null);
  const [showTeamsDialog, setShowTeamsDialog] = useState<boolean>(false);

  const fetchUserTeams = async () => {
    const { data } = await supabase.from("user_view").select("*").match({
      "profile->>id": user.id,
      "affiliation->>verified": true,
    });
    if (data && data.length > 0) {
      const formattedAffs: TeamAffiliationType[] = data.map((data) => ({
        team: data.team,
        affId: data.affiliation.id,
        number: data.affiliation.number,
        role: data.affiliation.role,
      }));
      setUserAffiliations(formattedAffs);
    } else setUserAffiliations(null);
  };

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

  useEffect(() => {
    void fetchUserTeams();
  }, [fetchUserTeams]);

  if (!userAffiliations || userAffiliations.length === 0) {
    return null; // Don't render anything if no affiliations
  }

  return (
    <Box sx={{ flexShrink: 0 }}>
      <Chip
        label={`Teams (${userAffiliations.length})`}
        icon={<GroupsIcon fontSize="small" />}
        onClick={handleTeamChipClick}
        variant="outlined"
        sx={{
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "0.65rem",
          height: "20px",
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
            {user.name || user.email}'s Teams
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleCloseTeamsDialog}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0.5 }}>
          <List dense>
            {userAffiliations.map((aff) => (
              <ListItem
                key={aff.affId}
                onClick={(e) => handleTeamClickInDialog(e, aff.team.id)}
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
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <TeamLogo tm={aff.team} size={30} inactive={true} />
                <ListItemText
                  primary={
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                      {aff.team.full_name} (
                      {aff.role === "coach"
                        ? aff.role
                        : aff.number
                          ? `#${aff.number}`
                          : aff.role}
                      )
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

export default UserAffiliationsChip;
