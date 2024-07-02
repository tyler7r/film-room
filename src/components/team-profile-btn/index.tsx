import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Button, Menu, MenuItem, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAffiliatedContext } from "~/contexts/affiliations";
import TeamAffiliation from "../team-affiliation";

const TeamPageButton = () => {
  const { affiliations } = useAffiliatedContext();
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
        variant="text"
        onClick={handleClick}
        endIcon={<ExpandMoreIcon fontSize="large" />}
        sx={{
          fontSize: "18px",
          fontWeight: "bold",
        }}
      >
        Team Hub
      </Button>
      <Menu open={open} anchorEl={anchorEl} onClose={handleClose}>
        {affiliations?.map((aff) => (
          <TeamAffiliation
            aff={aff}
            key={aff.affId}
            handleClose={handleClose}
          />
        ))}
        <MenuItem
          className="flex items-center justify-center gap-2"
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
