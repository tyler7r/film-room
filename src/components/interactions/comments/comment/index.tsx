import { useRouter } from "next/router";
import { useState } from "react";
import DeleteMenu from "~/components/utils/delete-menu";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { CommentNotificationType } from "~/utils/types";
import LikeBtn from "../../likes/like-btn";
import ReplyBtn from "../../replies/reply-btn";

type CommentProps = {
  cmt: CommentNotificationType;
};

const Comment = ({ cmt }: CommentProps) => {
  const comment = cmt.comment;
  const { user } = useAuthContext();
  const { hoverText } = useIsDarkContext();
  const router = useRouter();
  const [replyCount, setReplyCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);

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
          className={`${hoverText} tracking-tight`}
          onClick={() => handleAuthorClick(comment.comment_author)}
        >{`${cmt.author.name}: `}</strong>
        {comment.comment}
      </div>
      <ReplyBtn
        commentId={comment.id}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        replyCount={replyCount}
        setReplyCount={setReplyCount}
      />
      <LikeBtn playId={comment.id} commentLike={true} small={true} />
      {comment.comment_author === user.userId && (
        <DeleteMenu
          isOpen={isDeleteMenuOpen}
          setIsOpen={setIsDeleteMenuOpen}
          handleDelete={handleDelete}
          deleteType="comment"
        />
      )}
    </div>
  );
};

export default Comment;
