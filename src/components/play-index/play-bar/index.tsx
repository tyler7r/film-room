import type { YouTubePlayer } from "react-youtube";
import { useMobileContext } from "~/contexts/mobile";
import type { PlayIndexType } from "~/utils/types";

type PlayBarProps = {
  plays: PlayIndexType | null;
  player: YouTubePlayer | null;
  scrollToPlayer: () => void;
  duration: number;
};

const PlayBar = ({ plays, duration }: PlayBarProps) => {
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
