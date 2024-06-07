import DeleteIcon from "@mui/icons-material/Delete";
import { Button, IconButton } from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import LikeBtn from "../../likes/like-btn";

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
  const { isDark } = useIsDarkContext();
  const router = useRouter();

  const [isDeleteMenuOpen, setIsDeleteMenuOpen] = useState<boolean>(false);

  const handleAuthorClick = (id: string) => {
    void router.push(`/profile/${id}`);
  };

  const handleDelete = async () => {
    await supabase.from("comments").delete().eq("id", comment.id);
  };

  return (
    <div className="flex items-center gap-2 text-lg">
      <div>
        <strong
          className={`cursor-pointer tracking-tight ${
            isDark ? "hover:text-purple-400" : "hover:text-purple-A400"
          } hover:delay-100`}
          onClick={() => handleAuthorClick(comment.comment_author)}
        >{`${comment.author_name}: `}</strong>
        {comment.comment}
      </div>
      <LikeBtn
        playId={comment.id}
        commentLike={true}
        includePopover={true}
        small={true}
      />
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
            <DeleteIcon color="action" />
          </IconButton>
        ))}
    </div>
  );
};

export default Comment;
