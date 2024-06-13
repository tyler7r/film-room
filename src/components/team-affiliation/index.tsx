import { Divider } from "@mui/material";
import { useRouter } from "next/router";
import { useAffiliatedContext } from "~/contexts/affiliations";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import type { TeamAffiliationType } from "~/utils/types";
import TeamLogo from "../team-logo";

type TeamAffiliationProps = {
  aff: TeamAffiliationType;
  handleClose?: () => void;
};

const TeamAffiliation = ({ aff, handleClose }: TeamAffiliationProps) => {
  const { hoverBorder } = useIsDarkContext();
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
    if (isAffiliatedTeam) {
      setUser({ ...user, currentAffiliation: isAffiliatedTeam });
    }
    if (handleClose) handleClose();
    void router.push(`/team-hub/${teamId}`);
  };

  return (
    <div
      className={`flex items-center justify-center gap-2 ${hoverBorder}`}
      key={aff.team.id}
      onClick={(e) => handleTeamClick(e, aff.team.id)}
    >
      <TeamLogo tm={aff.team} size={35} />
      <Divider flexItem orientation="vertical" variant="middle" />
      <div className="flex items-center justify-center gap-2">
        <div className="text-lg font-bold">{aff.team.full_name}</div>
        {aff.number && <div className="leading-3">#{aff.number}</div>}
      </div>
    </div>
  );
};

export default TeamAffiliation;
