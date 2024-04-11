import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Button, Menu, MenuItem, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAffiliatedContext } from "~/contexts/affiliations";
import { useAuthContext } from "~/contexts/auth";
import { type TeamAffiliationType } from "~/utils/types";
import TeamLogo from "../team-logo";

const TeamPageButton = () => {
  const { user, setUser } = useAuthContext();
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

  const handleItemClick = (tm: TeamAffiliationType) => {
    handleClose();
    setUser({ ...user, currentAffiliation: tm });
    router.push(`/team-hub/${tm.team.id}`);
  };

  return (
    <div>
      <Button
        variant="text"
        onClick={handleClick}
        endIcon={<ExpandMoreIcon />}
        sx={{ fontSize: { lg: "20px" }, lineHeight: { lg: "28px" } }}
      >
        Team Hub
      </Button>
      <Menu open={open} anchorEl={anchorEl} onClose={handleClose}>
        {affiliations?.map((aff) => (
          <MenuItem
            key={aff.team.id}
            className="flex items-center justify-center gap-2"
            onClick={() => handleItemClick(aff)}
          >
            <TeamLogo tm={aff.team} size={35} />
            <div className="flex flex-col">
              <Typography variant="overline" fontWeight="bold" fontSize="small">
                {aff.team.full_name}
              </Typography>
              {aff.team.id === user.currentAffiliation?.team.id && (
                <div className="text-center text-xs">ACTIVE</div>
              )}
            </div>
          </MenuItem>
        ))}
        <MenuItem
          className="flex items-center justify-center gap-2"
          onClick={() => {
            handleClose();
            router.push(`/team-select`);
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
