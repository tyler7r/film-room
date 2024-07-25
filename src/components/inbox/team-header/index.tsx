import AddIcon from "@mui/icons-material/Add";
import { MenuItem, Typography } from "@mui/material";
import { useRouter } from "next/router";
import TeamAffiliation from "~/components/team-affiliation";
import { useAuthContext } from "~/contexts/auth";
import { useInboxContext } from "~/contexts/inbox";

const TeamHeader = () => {
  const { affiliations } = useAuthContext();
  const { setIsOpen } = useInboxContext();
  const router = useRouter();

  const handleClose = () => {
    setIsOpen(false);
  };

  return affiliations ? (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {affiliations.map((aff) => (
        <TeamAffiliation
          aff={aff}
          key={aff.affId}
          handleClose={handleClose}
          small={true}
        />
      ))}
    </div>
  ) : (
    <MenuItem
      className="flex items-center justify-center gap-2"
      onClick={() => {
        setIsOpen(false);
        void router.push(`/team-select`);
      }}
    >
      <AddIcon />
      <Typography variant="overline" fontWeight="bold" fontSize="small">
        Join a New Team
      </Typography>
    </MenuItem>
  );
};

export default TeamHeader;
