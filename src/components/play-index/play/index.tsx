import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import StarIcon from "@mui/icons-material/Star";
import { Divider, Typography } from "@mui/material";
import { useState } from "react";
import type { YouTubePlayer } from "react-youtube";
import { useIsDarkContext } from "~/pages/_app";
import type { PlayType } from "~/utils/types";

type PlayProps = {
  player: YouTubePlayer | null;
  play: PlayType;
  scrollToPlayer: () => void;
};

const Play = ({ player, play, scrollToPlayer }: PlayProps) => {
  const { backgroundStyle } = useIsDarkContext();

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const handleClick = (playTime: number) => {
    scrollToPlayer();
    void player?.seekTo(playTime, true);
  };

  return (
    <div>
      <div
        style={backgroundStyle}
        className="flex cursor-pointer items-center gap-2 rounded-md px-4 py-2"
        onClick={() => handleClick(play.start_time)}
      >
        <Typography variant="button" className="w-min" fontSize={16}>
          {play.author_name}
        </Typography>
        <Divider orientation="vertical" flexItem className="ml-2 mr-2" />
        {play.highlight && <StarIcon color="secondary" />}
        <div className="grow text-lg tracking-wide">{play.title}</div>
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? (
            <ExpandLessIcon fontSize="large" color="primary" />
          ) : (
            <ExpandMoreIcon fontSize="large" color="primary" />
          )}
        </div>
        <div className="flex flex-col items-center justify-center">
          <Typography variant="body2" fontWeight="bold">
            {play.start_time < 3600
              ? new Date(play.start_time * 1000).toISOString().substring(14, 19)
              : new Date(play.start_time * 1000)
                  .toISOString()
                  .substring(11, 19)}
          </Typography>
          <Typography variant="caption">
            {play.end_time - play.start_time}s
          </Typography>
        </div>
      </div>
      {isExpanded && <div className="p-2 pl-4 pr-4">{play.note}</div>}
    </div>
  );
};

export default Play;
