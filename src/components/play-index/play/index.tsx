import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import StarIcon from "@mui/icons-material/Star";
import { Divider, IconButton, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import type { YouTubePlayer } from "react-youtube";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { PlayType } from "~/utils/types";

type PlayProps = {
  player: YouTubePlayer | null;
  play: PlayType;
  scrollToPlayer: () => void;
  activePlay: PlayType | null;
  setActivePlay: (play: PlayType) => void;
};

const Play = ({
  player,
  play,
  scrollToPlayer,
  setActivePlay,
  activePlay,
}: PlayProps) => {
  const { backgroundStyle } = useIsDarkContext();
  const { user } = useAuthContext();

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);

  const handleClick = async (playTime: number, play: PlayType) => {
    scrollToPlayer();
    void player?.seekTo(playTime, true);
    setActivePlay(play);
  };

  const fetchLikeCount = async () => {
    const { count } = await supabase
      .from("play_likes")
      .select("*", { count: "exact" })
      .eq("play_id", play.id);
    if (count) setLikeCount(count);
    else setLikeCount(0);
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const { data } = await supabase
      .from("play_likes")
      .insert({
        play_id: play.id,
        user_id: `${user.userId}`,
        user_name: `${user.name}`,
      })
      .select();
    if (data) {
      void fetchLikeCount();
      void fetchIfUserLiked();
    }
  };

  const handleUnlike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const { data } = await supabase
      .from("play_likes")
      .delete()
      .match({
        play_id: play.id,
        user_id: `${user.userId}`,
        user_name: `${user.name}`,
      })
      .select();
    if (data) {
      void fetchLikeCount();
      void fetchIfUserLiked();
    }
  };

  const fetchIfUserLiked = async () => {
    const { count } = await supabase
      .from("play_likes")
      .select("*", { count: "exact" })
      .match({ play_id: play.id, user_id: user.userId });
    if (count && count > 0) {
      setIsLiked(true);
    } else {
      setIsLiked(false);
    }
  };

  useEffect(() => {
    void fetchLikeCount();
    void fetchIfUserLiked();
  }, [activePlay]);

  return (
    <div>
      <div
        style={backgroundStyle}
        className="flex cursor-pointer items-center gap-2 rounded-md p-4"
        onClick={() => handleClick(play.start_time, play)}
      >
        <div className="flex flex-col items-center justify-center gap-1">
          <Typography className="w-min text-center text-xl font-bold tracking-tight">
            {play.author_name}
          </Typography>
          <div className="flex items-center justify-center">
            {isLiked ? (
              <IconButton onClick={(e) => void handleUnlike(e)}>
                <FavoriteIcon color="primary" />
              </IconButton>
            ) : (
              <IconButton onClick={(e) => void handleLike(e)}>
                <FavoriteBorderIcon color="primary" />
              </IconButton>
            )}
            <div className="text-lg font-bold">{likeCount}</div>
          </div>
        </div>
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
