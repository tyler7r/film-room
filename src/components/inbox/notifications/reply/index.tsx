import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { Box, Divider } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import PageTitle from "~/components/utils/page-title";
import StandardPopover from "~/components/utils/standard-popover";
import { useInboxContext } from "~/contexts/inbox";
import { useIsDarkContext } from "~/pages/_app";
import { getTimeSinceNotified } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { ReplyNotificationType } from "~/utils/types";

type InboxReplyProps = {
  reply: ReplyNotificationType;
};

const InboxReply = ({ reply }: InboxReplyProps) => {
  const { hoverText, backgroundStyle, hoverBorder } = useIsDarkContext();
  const { setIsOpen } = useInboxContext();

  const router = useRouter();
  const [isUnread, setIsUnread] = useState<boolean>(true);

  const fetchIfUnread = async () => {
    const { data } = await supabase
      .from("replies")
      .select("viewed")
      .eq("id", reply.reply.id)
      .single();
    if (data) {
      setIsUnread(data.viewed ? false : true);
    }
  };

  const updateReply = async () => {
    await supabase
      .from("replies")
      .update({ viewed: true })
      .eq("id", reply.reply.id);
    void fetchIfUnread();
  };

  const markUnread = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase
      .from("replies")
      .update({ viewed: false })
      .eq("id", reply.reply.id);
    void fetchIfUnread();
  };

  const handleClick = async () => {
    const { reply: rep, play } = reply;
    if (!rep.viewed) void updateReply();
    void router.push(`/play/${play.id}?comment=${rep.comment_id}`);
    setIsOpen(false);
  };

  useEffect(() => {
    void fetchIfUnread();
  }, []);

  return (
    <div key={reply.play.id + reply.reply.created_at}>
      <div className="flex items-center justify-end gap-1 text-right text-xs font-light italic leading-4">
        {getTimeSinceNotified(reply.reply.created_at)}
      </div>
      <div className="flex items-center justify-center gap-1">
        {isUnread && <FiberManualRecordIcon fontSize="small" color="primary" />}
        {!isUnread && (
          <StandardPopover
            content="Mark unread"
            children={
              <Box onClick={(e) => markUnread(e)} sx={{ cursor: "pointer" }}>
                <FiberManualRecordIcon fontSize="small" color="action" />
              </Box>
            }
          />
        )}
        <div
          onClick={() => handleClick()}
          className={`flex w-full flex-col gap-1 ${hoverBorder}`}
          style={backgroundStyle}
        >
          <PageTitle size="xx-small" title={reply.video.title} />
          <Divider variant="middle" flexItem />
          <div className="text-sm">
            <strong
              className={`${hoverText} tracking-tight`}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                void router.push(`/profile/${reply.author.id}`);
              }}
            >
              {reply.author.name}
            </strong>{" "}
            replied:{" "}
            {reply.reply.reply.length > 50
              ? `${reply.reply.reply.slice(0, 50)}...`
              : reply.reply.reply}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InboxReply;
