import type { YouTubePlayer } from "react-youtube";
import { useMobileContext } from "~/contexts/mobile";
import { PlayIndexType } from "~/utils/types";

type PlayBarProps = {
  plays: PlayIndexType | null;
  player: YouTubePlayer | null;
  scrollToPlayer: () => void;
  duration: number;
};

const PlayBar = ({ player, plays, scrollToPlayer, duration }: PlayBarProps) => {
  const { screenWidth } = useMobileContext();

  return (
    <div style={{ width: screenWidth * 0.8 }} className="relative">
      {plays?.map((play) => (
        <div
          key={play.id}
          className="absolute"
          style={{ left: `${duration / play.start_time}%` }}
        >
          I
        </div>
      ))}
    </div>
  );
};

export default PlayBar;
