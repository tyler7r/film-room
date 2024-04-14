import { useIsDarkContext } from "~/pages/_app";
import type { PlayerType } from "~/utils/types";

type PlayerProps = {
  player: PlayerType;
};

const Player = ({ player }: PlayerProps) => {
  const { backgroundStyle } = useIsDarkContext();
  return (
    <div
      style={backgroundStyle}
      className="flex items-center justify-around gap-2 rounded-lg p-2 font-bold"
    >
      <div className="text-lg">{player.name}</div>
      {player.number && <div>#{player.number}</div>}
    </div>
  );
};

export default Player;
