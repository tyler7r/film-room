import CommentIcon from "@mui/icons-material/Comment";
import { IconButton } from "@mui/material";
import React, { useEffect } from "react";
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
      <IconButton size="small" onClick={handleReplyClick}>
        <CommentIcon color="primary" fontSize="medium" />
      </IconButton>
      <div className="text-lg font-bold tracking-tight">{replyCount}</div>
    </div>
  );
};

export default ReplyBtn;
