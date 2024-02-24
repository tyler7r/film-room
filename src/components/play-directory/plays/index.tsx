import StarIcon from "@mui/icons-material/Star";
import { Typography } from "@mui/material";
import type { YouTubePlayer } from "react-youtube";
import { useIsDarkContext } from "~/pages/_app";
import { PlayDirectoryType } from "~/utils/types";

type PlaysProps = {
  plays: PlayDirectoryType | null;
  player: YouTubePlayer | null;
};

const Plays = ({ plays, player }: PlaysProps) => {
  const { backgroundStyle } = useIsDarkContext();
  return plays && plays.length > 0 ? (
    plays.map((play) => (
      <div
        key={play.id}
        style={backgroundStyle}
        className="flex cursor-pointer items-center gap-2 rounded-md p-2 text-center"
        onClick={() => player?.seekTo(play.start_time, true)}
      >
        <Typography className="" variant="button">
          {play.author_name}
        </Typography>
        <Typography fontSize={20} variant="body1">
          |
        </Typography>
        {play.highlight && <StarIcon color="secondary" />}
        <div>{play.note}</div>
        <div>
          {play.start_time < 3600
            ? new Date(play.start_time * 1000).toISOString().substring(14, 19)
            : new Date(play.start_time * 1000).toISOString().substring(11, 19)}
        </div>
      </div>
    ))
  ) : (
    <Typography variant="caption" className="text-center" fontSize={18}>
      Play directory is empty!
    </Typography>
  );
};

export default Plays;
