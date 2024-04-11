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
  ) : size && size > 60 ? (
    <div
      className="rounded-full p-4 py-7 text-5xl font-bold text-white"
      style={colorBackground}
    >{`${tm.city.slice(0, 1)}${tm.name.slice(0, 1)}`}</div>
  ) : size && size > 45 && size < 60 ? (
    <div
      className="rounded-full p-3 py-4 text-3xl font-bold text-white"
      style={colorBackground}
    >{`${tm.city.slice(0, 1)}${tm.name.slice(0, 1)}`}</div>
  ) : (
    <div
      className="rounded-full p-2 text-lg font-bold text-white"
      style={colorBackground}
    >{`${tm.city.slice(0, 1)}${tm.name.slice(0, 1)}`}</div>
  );
};

export default TeamLogo;
