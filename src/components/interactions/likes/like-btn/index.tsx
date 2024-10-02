import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { IconButton } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";

type LikeBtnProps = {
  playId: string;
  commentLike?: boolean;
  replyLike?: boolean;
  small?: boolean;
};

const LikeBtn = ({ playId, commentLike, replyLike, small }: LikeBtnProps) => {
  const { user } = useAuthContext();
  const router = useRouter();

  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);

  const fetchLikeCount = async () => {
    const plays = supabase
      .from("play_likes")
      .select("*", { count: "exact" })
      .eq("play_id", playId);
    const comments = supabase
      .from("comment_likes")
      .select("*", { count: "exact" })
      .eq("comment_id", playId);
    const replies = supabase
      .from("reply_likes")
      .select("*", { count: "exact" })
      .eq("reply_id", playId);
    const { count } = commentLike
      ? await comments
      : replyLike
        ? await replies
        : await plays;
    if (count) setLikeCount(count);
    else {
      setLikeCount(0);
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
        })
        .select();
      const comments = supabase
        .from("comment_likes")
        .insert({
          comment_id: playId,
          user_id: user.userId,
        })
        .select();
      const replies = supabase
        .from("reply_likes")
        .insert({
          reply_id: playId,
          user_id: user.userId,
        })
        .select();
      const { data } = commentLike
        ? await comments
        : replyLike
          ? await replies
          : await plays;
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
      const replies = supabase
        .from("reply_likes")
        .delete()
        .match({ reply_id: playId, user_id: user.userId })
        .select();
      const { data } = commentLike
        ? await comments
        : replyLike
          ? await replies
          : await plays;
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
    const replies = supabase
      .from("reply_likes")
      .select("*", { count: "exact" })
      .match({ reply_id: playId, user_id: user.userId });
    const { count } = commentLike
      ? await comments
      : replyLike
        ? await replies
        : await plays;
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
          <IconButton size="small" onClick={(e) => void handleUnlike(e)}>
            <FavoriteIcon
              color="primary"
              fontSize={small ? "small" : "medium"}
            />
          </IconButton>
        ) : (
          <IconButton size="small" onClick={(e) => void handleLike(e)}>
            <FavoriteBorderIcon
              color="primary"
              fontSize={small ? "small" : "medium"}
            />
          </IconButton>
        )}
        <div className="text-lg font-bold tracking-tight">{likeCount}</div>
      </div>
    </div>
  );
};

export default LikeBtn;
