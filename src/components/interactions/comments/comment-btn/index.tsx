import ModeCommentIcon from "@mui/icons-material/ModeComment";
import { IconButton } from "@mui/material";
import React, { useEffect } from "react";
import { useMobileContext } from "~/contexts/mobile";
import { supabase } from "~/utils/supabase";

type CommentBtnProps = {
  playId: string;
  commentCount: number;
  setCommentCount: (commentCount: number) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const CommentBtn = ({
  playId,
  isOpen,
  setIsOpen,
  commentCount,
  setCommentCount,
}: CommentBtnProps) => {
  const { isMobile } = useMobileContext();

  const handleCommentClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const fetchInitialCommentNumber = async () => {
    const { count } = await supabase
      .from("comments")
      .select("*", { count: "exact" })
      .eq("play_id", playId);
    if (count) setCommentCount(count);
  };

  useEffect(() => {
    void fetchInitialCommentNumber();
  }, []);
  return (
    <div className="flex items-center">
      <IconButton onClick={handleCommentClick}>
        <ModeCommentIcon
          color="primary"
          fontSize={isMobile ? "medium" : "large"}
        />
      </IconButton>
      <div className="text-lg font-bold md:text-2xl">{commentCount}</div>
    </div>
  );
};

export default CommentBtn;
