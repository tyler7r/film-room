import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Button, Menu, MenuItem, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAffiliatedContext } from "~/contexts/affiliations";

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
      <Button variant="text" onClick={handleClick} endIcon={<ExpandMoreIcon />}>
        Team Hub
      </Button>
      {affiliations && (
        <Menu open={open} anchorEl={anchorEl} onClose={handleClose}>
          {affiliations.map((aff) => (
            <MenuItem
              key={aff.id}
              className="flex items-center justify-center gap-2"
            >
              {aff.logo ? (
                <img
                  src={aff.logo}
                  height={35}
                  width={35}
                  className="rounded-full"
                />
              ) : (
                <Typography
                  variant="caption"
                  fontSize="medium"
                  fontWeight="bold"
                  className="rounded-full bg-fuchsia-500 p-1 text-white"
                >{`${aff.city.slice(0, 1)}${aff.name.slice(0, 1)}`}</Typography>
              )}
              <Typography
                variant="overline"
                fontWeight="bold"
                fontSize="small"
              >{`${aff.city} ${aff.name}`}</Typography>
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
      )}
    </div>
  );
};

export default TeamPageButton;
