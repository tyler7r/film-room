import Image from "next/image";
import { useRouter } from "next/router";
import { useInboxContext } from "~/contexts/inbox";
import { useIsDarkContext } from "~/pages/_app";
import type { TeamType } from "~/utils/types";

type TeamLogoProps = {
  tm: TeamType;
  size?: number;
  inactive?: boolean;
};

const TeamLogo = ({ tm, size, inactive }: TeamLogoProps) => {
  const { colorBackground } = useIsDarkContext();
  const { setIsOpen } = useInboxContext();
  const router = useRouter();

  const handleClick = () => {
    setIsOpen(false);
    if (inactive) return;
    else void router.push(`/team-hub/${tm.id}`);
  };

  return tm.logo ? (
    <Image
      alt="team-logo"
      src={tm.logo}
      height={size ? size : 45}
      width={size ? size : 45}
      className="cursor-pointer rounded-full"
      onClick={() => handleClick()}
    />
  ) : size && size > 60 ? (
    <div
      className="cursor-pointer rounded-full p-4 py-7 text-5xl font-bold text-white"
      style={colorBackground}
      onClick={() => handleClick()}
    >{`${tm.city.slice(0, 1)}${tm.name.slice(0, 1)}`}</div>
  ) : size && size > 45 && size < 60 ? (
    <div
      className="cursor-pointer rounded-full p-3 py-4 text-3xl font-bold text-white"
      style={colorBackground}
      onClick={() => handleClick()}
    >{`${tm.city.slice(0, 1)}${tm.name.slice(0, 1)}`}</div>
  ) : (
    <div
      className="cursor-pointer rounded-full p-2 text-lg font-bold text-white"
      style={colorBackground}
      onClick={() => handleClick()}
    >{`${tm.city.slice(0, 1)}${tm.name.slice(0, 1)}`}</div>
  );
};

export default TeamLogo;
