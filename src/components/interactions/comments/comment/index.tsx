import { useRouter } from "next/router";
import { useState } from "react";
import DeleteMenu from "~/components/utils/delete-menu";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { getTimeSinceNotified } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { CommentNotificationType } from "~/utils/types";
import LikeBtn from "../../likes/like-btn";
import ReplyBtn from "../../replies/reply-btn";
import ReplyIndex from "../../replies/reply-index";

type CommentProps = {
  cmt: CommentNotificationType;
  autoOpen?: boolean;
  refetchComments: () => void;
};

const Comment = ({ cmt, autoOpen, refetchComments }: CommentProps) => {
  const comment = cmt.comment;
  const { user } = useAuthContext();
  const { hoverText } = useIsDarkContext();
  const router = useRouter();
  const [replyCount, setReplyCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(autoOpen ? true : false);

  const [isDeleteMenuOpen, setIsDeleteMenuOpen] = useState<boolean>(false);

  const handleAuthorClick = (id: string) => {
    void router.push(`/profile/${id}`);
  };

  const handleDelete = async () => {
    await supabase.from("comments").delete().eq("id", comment.id);
    refetchComments();
  };

  return (
    <div className={`flex w-full flex-col ${isOpen && "gap-3"}`}>
      <div className="flex w-full items-center gap-2">
        <div className="flex w-full flex-col">
          <div className="flex w-full justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`${hoverText} text-sm font-bold tracking-tight`}
                onClick={() => handleAuthorClick(comment.comment_author)}
              >{`${cmt.author.name} `}</div>
              <div className="text-xs font-light">
                {getTimeSinceNotified(comment.created_at)}
              </div>
            </div>
            <div className="flex items-center">
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
                  small={true}
                />
              )}
            </div>
          </div>
          <div
            className="cursor-pointer text-sm"
            onClick={() => setIsOpen(!isOpen)}
          >
            {comment.comment}
          </div>
        </div>
      </div>
      <div className="mt-2 flex w-full flex-col items-center justify-center">
        {isOpen && (
          <ReplyIndex
            comment={cmt}
            replyCount={replyCount}
            setReplyCount={setReplyCount}
          />
        )}
      </div>
    </div>
  );
};

export default Comment;
