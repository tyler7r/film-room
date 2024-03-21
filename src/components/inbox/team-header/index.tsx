import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Button, Typography } from "@mui/material";
import { useRouter } from "next/router";
import TeamLogo from "~/components/team-logo";
import { useAuthContext } from "~/contexts/auth";
import { useInboxContext } from "~/contexts/inbox";

const TeamHeader = () => {
  const { user } = useAuthContext();
  const { setIsOpen } = useInboxContext();
  const router = useRouter();

  return (
    user.currentAffiliation?.team && (
      <div className="flex w-full flex-col items-center justify-center gap-1">
        <div className="flex items-center justify-center gap-3">
          <TeamLogo tm={user.currentAffiliation} size={55}></TeamLogo>
          <Typography
            variant="h5"
            className="text-lg font-bold md:text-2xl lg:text-4xl"
          >
            {user.currentAffiliation.team.full_name}
          </Typography>
        </div>
        <Button
          endIcon={<ArrowForwardIcon />}
          onClick={() => {
            void router.push(`/team-hub/${user.currentAffiliation?.team.id}`);
            setIsOpen(false);
          }}
          className="lg:text-lg"
        >
          Go to Team Hub
        </Button>
      </div>
    )
  );
};

export default TeamHeader;
