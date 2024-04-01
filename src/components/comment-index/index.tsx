import { Divider, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { supabase } from "~/utils/supabase";
import Comment from "../comment";

type CommentIndexProps = {
  playId: string;
  setCommentCount: (count: number) => void;
};

type CommentIndexType = {
  author_name: string;
  comment: string;
  comment_author: string;
  created_at: string;
  id: string;
  play_id: string;
  team_id: string | null;
}[];

const CommentIndex = ({ playId, setCommentCount }: CommentIndexProps) => {
  const [index, setIndex] = useState<CommentIndexType | null>(null);

  const fetchComments = async () => {
    const { data, count } = await supabase
      .from("comments")
      .select("*", { count: "exact" })
      .match({
        play_id: playId,
      });
    if (data && data.length > 0) setIndex(data);
    if (count) setCommentCount(count);
  };

  useEffect(() => {
    const channel = supabase
      .channel("comment_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        () => {
          void fetchComments();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    void fetchComments();
  }, []);

  return (
    <div className="flex w-full flex-col gap-2 px-6">
      <div className="text-4xl font-bold tracking-tighter">Comments</div>
      <div className="flex flex-col gap-2 px-2">
        {index?.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
        {!index && (
          <Typography className="text-xl font-bold tracking-tight">
            No comments!
          </Typography>
        )}
      </div>
      <Divider flexItem className="my-2" variant="middle"></Divider>
    </div>
  );
};

export default CommentIndex;
