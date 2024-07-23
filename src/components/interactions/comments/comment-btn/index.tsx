import ModeCommentIcon from "@mui/icons-material/ModeComment";
import { IconButton } from "@mui/material";
import React, { useEffect } from "react";
import { supabase } from "~/utils/supabase";
import type { PlayType } from "~/utils/types";

type CommentBtnProps = {
  playId: string;
  commentCount: number;
  setCommentCount: (commentCount: number) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  activePlay: PlayType | null | undefined;
};

const CommentBtn = ({
  playId,
  isOpen,
  setIsOpen,
  commentCount,
  setCommentCount,
}: CommentBtnProps) => {
  const handleCommentClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const fetchCommentNumber = async () => {
    const { count } = await supabase
      .from("comments")
      .select("*", { count: "exact" })
      .eq("play_id", playId);
    if (count) setCommentCount(count);
    else setCommentCount(0);
  };

  useEffect(() => {
    const channel = supabase
      .channel("comment_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        () => {
          void fetchCommentNumber();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    void fetchCommentNumber();
  }, [playId]);

  return (
    <div className="flex items-center">
      <IconButton size="small" onClick={handleCommentClick}>
        <ModeCommentIcon color="primary" fontSize="medium" />
      </IconButton>
      <div className="text-lg font-bold">{commentCount}</div>
    </div>
  );
};

export default CommentBtn;
