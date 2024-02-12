import { Typography } from "@mui/material";
import Image from "next/image";
import { useIsDarkContext } from "~/pages/_app";
import { type TeamAffiliationType } from "~/utils/types";

type TeamLogoProps = {
  tm: TeamAffiliationType;
};

const TeamLogo = ({ tm }: TeamLogoProps) => {
  const { team } = tm;
  const { colorBackground } = useIsDarkContext();

  return team.logo ? (
    <Image
      alt="team-logo"
      src={team.logo}
      height={35}
      width={35}
      className="rounded-full"
    />
  ) : (
    <Typography
      variant="caption"
      fontSize="large"
      fontWeight="bold"
      className="rounded-full p-2 text-white"
      style={colorBackground}
    >{`${team.city.slice(0, 1)}${team.name.slice(0, 1)}`}</Typography>
  );
};

export default TeamLogo;
