import { Typography } from "@mui/material";
import type { YouTubePlayer } from "react-youtube";
import { PlayDirectoryType } from "~/utils/types";
import Play from "../play";

type PlaysProps = {
  plays: PlayDirectoryType | null;
  player: YouTubePlayer | null;
};

const Plays = ({ plays, player }: PlaysProps) => {
  return plays && plays.length > 0 ? (
    plays.map((play) => <Play play={play} player={player} />)
  ) : (
    <Typography variant="caption" className="text-center" fontSize={18}>
      Play directory is empty!
    </Typography>
  );
};

export default Plays;
