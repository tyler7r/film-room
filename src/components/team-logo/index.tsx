import Image from "next/image";
import { useIsDarkContext } from "~/pages/_app";
import type { TeamType } from "~/utils/types";

type TeamLogoProps = {
  tm: TeamType;
  size?: number;
};

const TeamLogo = ({ tm, size }: TeamLogoProps) => {
  const { colorBackground } = useIsDarkContext();

  return tm.logo ? (
    <Image
      alt="team-logo"
      src={tm.logo}
      height={size ? size : 45}
      width={size ? size : 45}
      className="rounded-full"
    />
  ) : (
    <div
      className="rounded-full p-3 text-3xl font-bold text-white"
      style={colorBackground}
    >{`${tm.city.slice(0, 1)}${tm.name.slice(0, 1)}`}</div>
  );
};

export default TeamLogo;
