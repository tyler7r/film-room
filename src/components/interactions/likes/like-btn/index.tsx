import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { IconButton } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import type { LikeListType } from "~/utils/types";
import LikePopover from "../like-popover";

type LikeBtnProps = {
  includePopover?: boolean;
  playId: string;
  commentLike?: boolean;
  small?: boolean;
};

const LikeBtn = ({ includePopover, playId, commentLike }: LikeBtnProps) => {
  const { user } = useAuthContext();
  const router = useRouter();

  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [likeList, setLikeList] = useState<LikeListType | null>(null);

  const open = Boolean(anchorEl);

  const handlePopoverOpen = (e: React.MouseEvent<HTMLElement>) => {
    if (includePopover) {
      setAnchorEl(e.currentTarget);
    } else return;
  };

  const handlePopoverClose = () => {
    if (includePopover) {
      setAnchorEl(null);
    } else return;
  };

  const fetchLikeCount = async () => {
    const plays = supabase
      .from("play_likes")
      .select("user_name", { count: "exact" })
      .eq("play_id", playId);
    const comments = supabase
      .from("comment_likes")
      .select("user_name", { count: "exact" })
      .eq("comment_id", playId);
    const { data, count } = commentLike ? await comments : await plays;
    if (data && data.length > 0 && includePopover) setLikeList(data);
    if (count) setLikeCount(count);
    else {
      setLikeCount(0);
      setLikeList(null);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user.userId) {
      const plays = supabase
        .from("play_likes")
        .insert({
          play_id: playId,
          user_id: user.userId,
          user_name: `${user.name}`,
        })
        .select();
      const comments = supabase
        .from("comment_likes")
        .insert({
          comment_id: playId,
          user_id: user.userId,
          user_name: `${user.name}`,
        })
        .select();
      const { data } = commentLike ? await comments : await plays;
      if (data) {
        void fetchLikeCount();
        void fetchIfUserLiked();
      }
    } else {
      void router.push("/login");
      return;
    }
  };

  const handleUnlike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user.userId) {
      const plays = supabase
        .from("play_likes")
        .delete()
        .match({
          play_id: playId,
          user_id: user.userId,
        })
        .select();
      const comments = supabase
        .from("comment_likes")
        .delete()
        .match({
          comment_id: playId,
          user_id: user.userId,
        })
        .select();
      const { data } = commentLike ? await comments : await plays;
      if (data) {
        void fetchLikeCount();
        void fetchIfUserLiked();
      }
    }
  };

  const fetchIfUserLiked = async () => {
    const plays = supabase
      .from("play_likes")
      .select("*", { count: "exact" })
      .match({ play_id: playId, user_id: user.userId });
    const comments = supabase
      .from("comment_likes")
      .select("*", { count: "exact" })
      .match({ comment_id: playId, user_id: user.userId });
    const { count } = commentLike ? await comments : await plays;
    if (count && count > 0) {
      setIsLiked(true);
    } else {
      setIsLiked(false);
    }
  };

  useEffect(() => {
    void fetchLikeCount();
    if (user.userId) void fetchIfUserLiked();
  }, [playId]);

  return (
    <div>
      <div className="flex items-center justify-center">
        {isLiked ? (
          <IconButton
            size="small"
            onMouseEnter={handlePopoverOpen}
            onMouseLeave={handlePopoverClose}
            onClick={(e) => void handleUnlike(e)}
          >
            <FavoriteIcon color="primary" fontSize="medium" />
          </IconButton>
        ) : (
          <IconButton
            size="small"
            onMouseEnter={handlePopoverOpen}
            onMouseLeave={handlePopoverClose}
            onClick={(e) => void handleLike(e)}
          >
            <FavoriteBorderIcon color="primary" fontSize="medium" />
          </IconButton>
        )}
        <div className="text-lg font-bold">{likeCount}</div>
      </div>
      {likeList && (
        <LikePopover
          open={open}
          anchorEl={anchorEl}
          handlePopoverClose={handlePopoverClose}
          likeList={likeList}
        />
      )}
    </div>
  );
};

export default LikeBtn;
