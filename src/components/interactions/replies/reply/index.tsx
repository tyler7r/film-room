import { Typography } from "@mui/material";
import { formatDistanceToNowStrict } from "date-fns";
import { useRouter } from "next/router";
import { useState } from "react";
import DeleteMenu from "~/components/utils/delete-menu";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { getDisplayName } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { ReplyNotificationType } from "~/utils/types";
import LikeBtn from "../../likes/like-btn";

type ReplyProps = {
  reply: ReplyNotificationType;
  setReload: (reload: boolean) => void;
};

const Reply = ({ reply, setReload }: ReplyProps) => {
  const rep = reply.reply;
  const { user } = useAuthContext();
  const { hoverText } = useIsDarkContext();
  const router = useRouter();

  const [isDeleteMenuOpen, setIsDeleteMenuOpen] = useState<boolean>(false);

  const handleAuthorClick = (id: string) => {
    void router.push(`/profile/${id}`);
  };

  const handleDelete = async () => {
    const { data } = await supabase
      .from("replies")
      .delete()
      .eq("id", rep.id)
      .select();
    if (data) setReload(true);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex w-full flex-col">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`${hoverText} text-sm font-bold tracking-tight`}
              onClick={() => handleAuthorClick(reply.author.id)}
            >{`${getDisplayName(reply.author)} `}</div>
            <Typography
              variant="caption"
              color="text.secondary"
              fontStyle="italic"
              fontSize={10}
            >
              {formatDistanceToNowStrict(new Date(reply.reply.created_at), {
                addSuffix: true,
              })}
            </Typography>
          </div>
          <div className="flex items-center">
            <LikeBtn playId={rep.id} replyLike={true} small={true} />
            {reply.author.id === user.userId && (
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
        <div className="cursor-pointer text-sm">{rep.reply}</div>
      </div>
    </div>
  );
};

export default Reply;
