import { Typography } from "@mui/material";
import Image from "next/image";
import { useIsDarkContext } from "~/pages/_app";
import { type TeamAffiliationType } from "~/utils/types";

type TeamLogoProps = {
  tm: TeamAffiliationType;
  size?: number;
};

const TeamLogo = ({ tm, size }: TeamLogoProps) => {
  const { team } = tm;
  const { colorBackground } = useIsDarkContext();

  return team.logo ? (
    <Image
      alt="team-logo"
      src={team.logo}
      height={size ? size : 45}
      width={size ? size : 45}
      className="rounded-full"
    />
  ) : (
    <Typography
      variant="caption"
      fontSize="large"
      fontWeight="bold"
      sx={{ borderRadius: "9999px", padding: "8px", color: "white" }}
      style={colorBackground}
    >{`${team.city.slice(0, 1)}${team.name.slice(0, 1)}`}</Typography>
  );
};

export default TeamLogo;
