import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Button, Menu, MenuItem, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import TeamAffiliation from "~/components/teams/team-affiliation";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";

const TeamPageButton = () => {
  const { affiliations } = useAuthContext();
  const { screenWidth } = useMobileContext();
  const router = useRouter();

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
      <Button
        onClick={handleClick}
        endIcon={
          <ExpandMoreIcon fontSize={screenWidth < 750 ? "small" : "large"} />
        }
        sx={{
          fontWeight: "bold",
          wordSpacing: "-1px",
        }}
        size="large"
      >
        Team Hub
      </Button>
      <Menu open={open} anchorEl={anchorEl} onClose={handleClose}>
        {affiliations?.map((aff) => (
          <MenuItem
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
          }}
          onClick={() => {
            handleClose();
            void router.push(`/team-select`);
          }}
        >
          <AddIcon />
          <Typography variant="overline" fontWeight="bold" fontSize="small">
            Join a New Team
          </Typography>
        </MenuItem>
      </Menu>
    </div>
  );
};

export default TeamPageButton;
