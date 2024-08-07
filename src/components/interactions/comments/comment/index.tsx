import { useRouter } from "next/router";
import { useState } from "react";
import DeleteMenu from "~/components/utils/delete-menu";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { CommentType } from "~/utils/types";
import LikeBtn from "../../likes/like-btn";

type CommentProps = {
  comment: CommentType;
};

const Comment = ({ comment }: CommentProps) => {
  const { user } = useAuthContext();
  const { hoverText } = useIsDarkContext();
  const router = useRouter();

  const [isDeleteMenuOpen, setIsDeleteMenuOpen] = useState<boolean>(false);

  const handleAuthorClick = (id: string) => {
    void router.push(`/profile/${id}`);
  };

  const handleDelete = async () => {
    await supabase.from("comments").delete().eq("id", comment.id);
  };

  return (
    <div className="flex items-center gap-2">
      <div>
        <strong
          className={hoverText}
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
      {comment.comment_author === user.userId && (
        <DeleteMenu
          isOpen={isDeleteMenuOpen}
          setIsOpen={setIsDeleteMenuOpen}
          handleDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default Comment;
