import { Divider } from "@mui/material";
import { useRouter } from "next/router";
import { useIsDarkContext } from "~/pages/_app";
import type { TeamType } from "~/utils/types";
import PageTitle from "../../utils/page-title";
import TeamLogo from "../team-logo";

type TeamProps = {
  team: TeamType;
  small?: boolean;
};

const Team = ({ team, small }: TeamProps) => {
  const { hoverBorder, backgroundStyle } = useIsDarkContext();
  const router = useRouter();

  const handleTeamClick = () => {
    void router.push(`/team-hub/${team.id}`);
  };

  return (
    <div
      className={`flex items-center justify-center ${
        small ? "gap-1" : "gap-4"
      } ${hoverBorder} p-2`}
      key={team.id}
      style={small ? {} : backgroundStyle}
      onClick={handleTeamClick}
    >
      <TeamLogo tm={team} size={small ? 25 : 60} />
      <Divider variant="middle" orientation="vertical" flexItem />
      <div className="flex flex-col items-center justify-center">
        <PageTitle title={team.full_name} size={small ? "x-small" : "small"} />
      </div>
    </div>
  );
};

export default Team;
