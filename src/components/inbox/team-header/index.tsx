import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Button } from "@mui/material";
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
          <TeamLogo tm={user.currentAffiliation.team} size={55}></TeamLogo>
          <div className="text-xl font-bold md:text-2xl lg:text-4xl">
            {user.currentAffiliation.team.full_name}
          </div>
        </div>
        <Button
          endIcon={<ArrowForwardIcon />}
          onClick={() => {
            void router.push(`/team-hub/${user.currentAffiliation?.team.id}`);
            setIsOpen(false);
          }}
          sx={{ fontSize: { lg: "20px" }, lineHeight: { lg: "28px" } }}
        >
          Go to Team Hub
        </Button>
      </div>
    )
  );
};

export default TeamHeader;
