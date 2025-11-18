import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import {
  IconButton,
  Menu,
  MenuItem,
  Typography,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import TeamAffiliation from "~/components/teams/team-affiliation";
import { useAuthContext } from "~/contexts/auth";

const TeamProfileBtn = () => {
  const { affiliations } = useAuthContext();
  const router = useRouter();
  const theme = useTheme(); // Added theme access for subtle separation styling

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton
        onClick={(e) => handleClick(e)}
        sx={{
          fontWeight: "bold",
          padding: 0.5,
        }}
        // Removed size="large" to allow sx padding to control the size
      >
        <GroupsOutlinedIcon />
        <ExpandMoreIcon />
      </IconButton>
      <Menu
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "8px",
              boxShadow: 3,
              py: 0,
            },
          },
        }}
      >
        {affiliations?.map((aff) => (
          <MenuItem
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              // 🎯 FIX: Compressed menu item padding
              p: 0,
              minHeight: "auto",
            }}
            key={aff.affId}
          >
            <TeamAffiliation
              aff={aff}
              key={aff.affId}
              handleClose={handleClose}
              listItem={true}
            />
          </MenuItem>
        ))}
        <MenuItem
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            // 🎯 FIX: Compressed menu item padding
            px: 1,
            py: 0.5,
            minHeight: "auto",
            // Add a subtle border to separate from the list of teams
            borderTop: affiliations?.length
              ? `1px solid ${theme.palette.divider}`
              : "",
            marginTop: theme.spacing(0),
          }}
          onClick={() => {
            handleClose();
            void router.push(`/team-select`);
          }}
        >
          <AddIcon fontSize="small" />
          <Typography variant="body2" fontWeight="bold">
            Join a New Team
          </Typography>
        </MenuItem>
      </Menu>
    </div>
  );
};

export default TeamProfileBtn;
