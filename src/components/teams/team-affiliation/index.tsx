import { Divider } from "@mui/material";
import { useRouter } from "next/router";
import { useIsDarkContext } from "~/pages/_app";
import type { TeamAffiliationType } from "~/utils/types";
import TeamLogo from "../team-logo";

type TeamAffiliationProps = {
  aff: TeamAffiliationType;
  handleClose?: () => void;
  small?: boolean;
  listItem?: boolean;
};

const TeamAffiliation = ({
  aff,
  handleClose,
  small,
  listItem,
}: TeamAffiliationProps) => {
  const { hoverBorder } = useIsDarkContext();
  const router = useRouter();

  const handleTeamClick = (
    e: React.MouseEvent<HTMLDivElement>,
    teamId: string,
  ) => {
    e.stopPropagation();
    if (handleClose) handleClose();
    void router.push(`/team-hub/${teamId}`);
  };

  return (
    <div
      className={`flex items-center justify-center gap-2 ${
        !listItem && hoverBorder
      }`}
      key={aff.team.id}
      onClick={(e) => handleTeamClick(e, aff.team.id)}
    >
      <TeamLogo tm={aff.team} size={25} />
      <Divider flexItem orientation="vertical" variant="middle" />
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center justify-center gap-1">
          <div
            className={`${
              small ? "text-sm" : "text-lg"
            } font-bold leading-5 tracking-tight`}
          >
            {aff.team.full_name}
          </div>
          {aff.number && (
            <div className={`${small ? "text-xs" : "text-sm"} leading-3`}>
              #{aff.number}
            </div>
          )}
        </div>
        <div className={`${small ? "text-xs" : "text-sm"} italic leading-3`}>
          {aff.role}
        </div>
      </div>
    </div>
  );
};

export default TeamAffiliation;
