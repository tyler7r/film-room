import CommentIcon from "@mui/icons-material/Comment";
import { IconButton } from "@mui/material";
import React, { useEffect, useState } from "react";
import StandardPopover from "~/components/utils/standard-popover";
import { supabase } from "~/utils/supabase";

type ReplyBtnProps = {
  commentId: string;
  replyCount: number;
  setReplyCount: (commentCount: number) => void;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
};

const ReplyBtn = ({
  commentId,
  isOpen,
  setIsOpen,
  replyCount,
  setReplyCount,
}: ReplyBtnProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handlePopoverOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const handleReplyClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (setIsOpen) {
      setIsOpen(!isOpen);
    }
  };

  const fetchReplyNumber = async () => {
    const { count } = await supabase
      .from("replies")
      .select("*", { count: "exact" })
      .eq("comment_id", commentId);
    if (count) setReplyCount(count);
    else setReplyCount(0);
  };

  useEffect(() => {
    const channel = supabase
      .channel("reply_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "replies" },
        () => {
          void fetchReplyNumber();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    void fetchReplyNumber();
  }, [commentId]);

  return (
    <div className="flex items-center">
      <IconButton
        size="small"
        onClick={handleReplyClick}
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
      >
        <CommentIcon color="primary" fontSize="small" />
        <StandardPopover
          content="Replies"
          open={open}
          handlePopoverClose={handlePopoverClose}
          anchorEl={anchorEl}
        />
      </IconButton>
      <div className="font-bold tracking-tight">{replyCount}</div>
    </div>
  );
};

export default ReplyBtn;
