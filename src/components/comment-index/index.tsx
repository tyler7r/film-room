import { Button, Divider, Typography } from "@mui/material";
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
  const [page, setPage] = useState<number>(0);
  const [isLoadMoreDisabled, setIsLoadMoreDisabled] = useState<boolean>(false);

  const fetchComments = async () => {
    const { from, to } = getFromAndTo();
    const { data, count } = await supabase
      .from("comments")
      .select("*", { count: "exact" })
      .match({
        play_id: playId,
      })
      .order("created_at", { ascending: false })
      .range(from, to);
    setPage(page + 1);
    if (count) {
      setCommentCount(count);
      if (to >= count - 1) setIsLoadMoreDisabled(true);
      else setIsLoadMoreDisabled(false);
    }
    if (data) setIndex(index ? [...index, ...data] : data);
    if (data?.length === 0) setIsLoadMoreDisabled(true);
  };

  const getFromAndTo = () => {
    const itemPerPage = 4;
    let from = page * itemPerPage;
    const to = from + itemPerPage;

    if (page > 0) {
      from += 1;
    }

    return { from, to };
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
        {index ? (
          <Button
            disabled={isLoadMoreDisabled}
            onClick={() => void fetchComments()}
            className="self-center"
          >
            Load More
          </Button>
        ) : (
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
