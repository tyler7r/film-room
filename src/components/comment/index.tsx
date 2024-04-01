import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { IconButton } from "@mui/material";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";

type CommentType = {
  author_name: string;
  comment: string;
  comment_author: string;
  created_at: string;
  id: string;
  play_id: string;
  team_id: string | null;
};

type LikeListType = {
  user_name: string;
}[];

type CommentProps = {
  comment: CommentType;
};

const Comment = ({ comment }: CommentProps) => {
  const { user } = useAuthContext();

  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);

  const [isLikeListOpen, setIsLikeListOpen] = useState<boolean>(false);
  const [likeList, setLikeList] = useState<LikeListType | null>(null);

  const fetchLikeCount = async () => {
    const { data, count } = await supabase
      .from("comment_likes")
      .select("user_name", { count: "exact" })
      .eq("comment_id", comment.id);
    if (data) setLikeList(data);
    if (count) setLikeCount(count);
    else setLikeCount(0);
  };

  const fetchIfUserLiked = async () => {
    const { count } = await supabase
      .from("comment_likes")
      .select("*", { count: "exact" })
      .match({ comment_id: comment.id, user_id: user.userId });
    if (count && count > 0) {
      setIsLiked(true);
    } else {
      setIsLiked(false);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const { data } = await supabase
      .from("comment_likes")
      .insert({
        comment_id: comment.id,
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
      .from("comment_likes")
      .delete()
      .match({
        comment_id: comment.id,
        user_id: `${user.userId}`,
        user_name: `${user.name}`,
      })
      .select();
    if (data) {
      void fetchLikeCount();
      void fetchIfUserLiked();
    }
  };

  useEffect(() => {
    void fetchLikeCount();
    void fetchIfUserLiked();
  }, []);

  return (
    <div className="flex items-center gap-2 text-lg">
      <div>
        <strong className="tracking-tight">{`${comment.author_name}: `}</strong>
        {comment.comment}
      </div>
      <div className="flex items-center justify-center">
        {isLiked ? (
          <IconButton
            onMouseEnter={() => setIsLikeListOpen(true)}
            onMouseLeave={() => setIsLikeListOpen(false)}
            size="small"
            onClick={(e) => void handleUnlike(e)}
          >
            <FavoriteIcon color="primary" />
          </IconButton>
        ) : (
          <IconButton
            onMouseEnter={() => setIsLikeListOpen(true)}
            onMouseLeave={() => setIsLikeListOpen(false)}
            size="small"
            onClick={(e) => void handleLike(e)}
          >
            <FavoriteBorderIcon color="primary" />
          </IconButton>
        )}
        <div className="text-lg font-bold">{likeCount}</div>
      </div>
      {isLikeListOpen && (
        <div className="bg-slate-200">
          {likeList?.map((like) => (
            <div key={like.user_name}>{like.user_name}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;
