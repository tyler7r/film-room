import { Box, Divider } from "@mui/material";
import { useRouter } from "next/router";
import { useIsDarkContext } from "~/pages/_app";
import type { TeamType } from "~/utils/types";
import PageTitle from "../../utils/page-title";
import TeamLogo from "../team-logo";

type TeamProps = {
  team: TeamType;
  small?: boolean;
  onVideo?: boolean;
};

const Team = ({ team, small, onVideo }: TeamProps) => {
  const { hoverBorder, backgroundStyle, hoverText } = useIsDarkContext();
  const router = useRouter();

  const handleTeamClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    void router.push(`/team-hub/${team.id}`);
  };

  return (
    <Box
      className={`flex items-center ${small ? "gap-1" : "gap-4"} ${
        onVideo ? hoverText : hoverBorder
      } p-2`}
      key={team.id}
      style={small ? {} : backgroundStyle}
      onClick={handleTeamClick}
    >
      <TeamLogo tm={team} size={small ? 25 : 35} />
      <Divider variant="middle" orientation="vertical" flexItem />
      <Box className="flex flex-col items-center justify-center">
        <PageTitle
          title={team.full_name}
          size={small ? "xxx-small" : onVideo ? "xxx-small" : "x-small"}
          sx={{ textAlign: "start" }}
        />
      </Box>
    </Box>
  );
};

export default Team;
