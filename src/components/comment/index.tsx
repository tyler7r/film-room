import DeleteIcon from "@mui/icons-material/Delete";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { Button, IconButton } from "@mui/material";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import type { LikeListType } from "~/utils/types";
import LikePopover from "../like-popover";

type CommentType = {
  author_name: string;
  comment: string;
  comment_author: string;
  created_at: string;
  id: string;
  play_id: string;
  team_id: string | null;
};

type CommentProps = {
  comment: CommentType;
};

const Comment = ({ comment }: CommentProps) => {
  const { user } = useAuthContext();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);

  const [likeList, setLikeList] = useState<LikeListType | null>(null);
  const [isDeleteMenuOpen, setIsDeleteMenuOpen] = useState<boolean>(false);

  const handlePopoverOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const fetchLikeCount = async () => {
    const { data, count } = await supabase
      .from("comment_likes")
      .select("user_name", { count: "exact" })
      .eq("comment_id", comment.id);
    if (data && data.length > 0) setLikeList(data);
    if (count) setLikeCount(count);
    else {
      setLikeCount(0);
      setLikeList(null);
    }
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

  const handleDelete = async () => {
    await supabase.from("comments").delete().eq("id", comment.id);
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
            onMouseEnter={handlePopoverOpen}
            onMouseLeave={handlePopoverClose}
            size="small"
            onClick={(e) => void handleUnlike(e)}
          >
            <FavoriteIcon color="primary" />
          </IconButton>
        ) : (
          <IconButton
            onMouseEnter={handlePopoverOpen}
            onMouseLeave={handlePopoverClose}
            size="small"
            onClick={(e) => void handleLike(e)}
          >
            <FavoriteBorderIcon color="primary" />
          </IconButton>
        )}
        <div className="text-lg font-bold">{likeCount}</div>
      </div>
      {comment.comment_author === user.currentAffiliation?.affId &&
        (isDeleteMenuOpen ? (
          <div className="ml-4 flex gap-1">
            <Button
              size="small"
              variant="contained"
              onClick={() => void handleDelete()}
            >
              Delete
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setIsDeleteMenuOpen(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <IconButton onClick={() => setIsDeleteMenuOpen(true)}>
            <DeleteIcon color="error" />
          </IconButton>
        ))}
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

export default Comment;