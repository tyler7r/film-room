import { Typography } from "@mui/material";
import type { YouTubePlayer } from "react-youtube";
import type { PlayIndexType } from "~/utils/types";
import Play from "../play";

type PlaysProps = {
  plays: PlayIndexType | null;
  player: YouTubePlayer | null;
  scrollToPlayer: () => void;
};

const Plays = ({ plays, player, scrollToPlayer }: PlaysProps) => {
  return plays && plays.length > 0 ? (
    <div className="flex flex-col justify-center gap-4">
      {plays.map((play) => (
        <Play
          key={play.id}
          scrollToPlayer={scrollToPlayer}
          play={play}
          player={player}
        />
      ))}
    </div>
  ) : (
    <Typography variant="caption" className="text-center" fontSize={18}>
      Play directory is empty!
    </Typography>
  );
};

export default Plays;
