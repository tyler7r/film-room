import { Divider } from "@mui/material";
import { useRouter } from "next/router";
import { useAffiliatedContext } from "~/contexts/affiliations";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import type { TeamType } from "~/utils/types";
import TeamLogo from "../team-logo";

type TeamProps = {
  team: TeamType;
};

const Team = ({ team }: TeamProps) => {
  const { hoverBorder, backgroundStyle } = useIsDarkContext();
  const { user, setUser } = useAuthContext();
  const { affiliations } = useAffiliatedContext();
  const router = useRouter();

  const handleTeamClick = (
    e: React.MouseEvent<HTMLDivElement>,
    teamId: string,
  ) => {
    e.stopPropagation();
    const isAffiliatedTeam = affiliations?.find(
      (aff) => aff.team.id === teamId,
    );
    if (isAffiliatedTeam && user.currentAffiliation) {
      setUser({ ...user, currentAffiliation: isAffiliatedTeam });
    }
    void router.push(`/team-hub/${teamId}`);
  };

  return (
    <div
      className={`flex items-center justify-center gap-4 ${hoverBorder}`}
      key={team.id}
      style={backgroundStyle}
      onClick={(e) => handleTeamClick(e, team.id)}
    >
      <TeamLogo tm={team} size={55} />
      <Divider variant="middle" orientation="vertical" flexItem />
      <div className="flex flex-col items-center justify-center">
        <div className="text-center text-2xl font-bold">{team.full_name}</div>
        {team.id === user.currentAffiliation?.team.id && (
          <div className="text-sm">ACTIVE</div>
        )}
      </div>
    </div>
  );
};

export default Team;
