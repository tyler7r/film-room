import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { Divider } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import PageTitle from "~/components/utils/page-title";
import StandardPopover from "~/components/utils/standard-popover";
import { useInboxContext } from "~/contexts/inbox";
import { useIsDarkContext } from "~/pages/_app";
import { getTimeSinceNotified } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { CommentNotificationType } from "~/utils/types";

type InboxCommentProps = {
  comment: CommentNotificationType;
};

const InboxComment = ({ comment }: InboxCommentProps) => {
  const { hoverText, backgroundStyle, hoverBorder } = useIsDarkContext();
  const { setIsOpen } = useInboxContext();

  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isUnread, setIsUnread] = useState<boolean>(true);

  const handlePopoverOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const fetchIfUnread = async () => {
    const { data } = await supabase
      .from("comments")
      .select("viewed")
      .eq("id", comment.comment.id)
      .single();
    if (data) {
      setIsUnread(data.viewed ? false : true);
    }
  };

  const updateComment = async () => {
    await supabase
      .from("comments")
      .update({ viewed: true })
      .eq("id", comment.comment.id);
    void fetchIfUnread();
  };

  const markUnread = async (e: React.MouseEvent) => {
    e.stopPropagation();
    handlePopoverClose();
    await supabase
      .from("comments")
      .update({ viewed: false })
      .eq("id", comment.comment.id);
    void fetchIfUnread();
  };

  const handleClick = async () => {
    const { comment: cmt, play } = comment;
    if (!cmt.viewed) void updateComment();
    void router.push(`/play/${play.id}`);
    setIsOpen(false);
  };

  useEffect(() => {
    void fetchIfUnread();
  }, []);

  return (
    <div key={comment.play.id + comment.comment.created_at}>
      <div className="flex items-center justify-end gap-1 text-right text-xs font-light italic leading-4">
        {getTimeSinceNotified(comment.comment.created_at)}
      </div>
      <div className="flex items-center justify-center gap-1">
        {isUnread && <FiberManualRecordIcon fontSize="small" color="primary" />}
        {!isUnread && (
          <div
            onMouseEnter={handlePopoverOpen}
            onMouseLeave={handlePopoverClose}
            onClick={(e) => markUnread(e)}
            className="cursor-pointer"
          >
            <StandardPopover
              content="Mark unread"
              open={open}
              anchorEl={anchorEl}
              handlePopoverClose={handlePopoverClose}
            />
            <FiberManualRecordIcon fontSize="small" color="action" />
          </div>
        )}
        <div
          onClick={() => handleClick()}
          className={`flex w-full flex-col gap-1 ${hoverBorder}`}
          style={backgroundStyle}
        >
          <PageTitle size="xx-small" title={comment.video.title} />
          <Divider variant="middle" flexItem></Divider>
          <div className="text-sm">
            <strong
              className={`${hoverText} tracking-tight`}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                void router.push(`/profile/${comment.comment.comment_author}`);
              }}
            >
              {comment.comment.author_name}
            </strong>{" "}
            commented:{" "}
            {comment.comment.comment.length > 50
              ? `${comment.comment.comment.slice(0, 50)}...`
              : comment.comment.comment}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InboxComment;
