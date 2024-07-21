import { useRouter } from "next/router";
import { useIsDarkContext } from "~/pages/_app";
import type { PlayerType } from "~/utils/types";

type PlayerProps = {
  player: PlayerType;
};

const Player = ({ player }: PlayerProps) => {
  const { backgroundStyle, hoverText } = useIsDarkContext();
  const router = useRouter();
  return (
    <div
      style={backgroundStyle}
      className={`flex items-center justify-around gap-2 rounded-lg p-2 font-bold`}
    >
      <div
        onClick={() => void router.push(`/profile/${player.profile.id}`)}
        className={`${hoverText} text-lg`}
      >
        {player.profile.name}
      </div>
      {player.affiliation.number && <div>#{player.affiliation.number}</div>}
    </div>
  );
};

export default Player;
