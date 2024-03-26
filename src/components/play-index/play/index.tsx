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
  setActivePlay: (play: PlayType) => void;
};

const Play = ({ player, play, scrollToPlayer, setActivePlay }: PlayProps) => {
  const { backgroundStyle } = useIsDarkContext();

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const handleClick = (playTime: number, play: PlayType) => {
    scrollToPlayer();
    void player?.seekTo(playTime, true);
    setActivePlay(play);
  };

  return (
    <div>
      <div
        style={backgroundStyle}
        className="flex cursor-pointer items-center gap-2 rounded-md p-4"
        onClick={() => handleClick(play.start_time, play)}
      >
        <Typography className="w-min text-center text-xl font-bold tracking-tight">
          {play.author_name}
        </Typography>
        <Divider orientation="vertical" flexItem className="mx-2" />
        {play.highlight && (
          <StarIcon color="secondary" fontSize="large" className="mr-4" />
        )}
        <div className="flex grow flex-col items-center">
          <div className="text-center text-xl tracking-wide md:text-2xl">
            {play.title}
          </div>
          {play.mentions.length > 0 && (
            <div className="flex w-full flex-col">
              <Divider flexItem className="my-1" />
              <div className="flex flex-wrap items-center justify-center gap-3">
                {play.mentions.map((m) => (
                  <div
                    className="text-center text-sm font-bold even:text-slate-500 md:text-base"
                    key={m.receiver_name}
                  >
                    {m.receiver_name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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
