import { Divider } from "@mui/material";
import { useRouter } from "next/router";
import { useIsDarkContext } from "~/pages/_app";
import type { TeamType } from "~/utils/types";
import PageTitle from "../page-title";
import TeamLogo from "../team-logo";

type TeamProps = {
  team: TeamType;
};

const Team = ({ team }: TeamProps) => {
  const { hoverBorder, backgroundStyle } = useIsDarkContext();
  const router = useRouter();

  const handleTeamClick = (
    e: React.MouseEvent<HTMLDivElement>,
    teamId: string,
  ) => {
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
        <PageTitle title={team.full_name} size="small" />
      </div>
    </div>
  );
};

export default Team;
