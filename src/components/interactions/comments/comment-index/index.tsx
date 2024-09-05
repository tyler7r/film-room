import { Pagination } from "@mui/material";
import { useEffect, useState } from "react";
import EmptyMessage from "~/components/utils/empty-msg";
import { useMobileContext } from "~/contexts/mobile";
import { getNumberOfPages, getToAndFrom } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { CommentType } from "~/utils/types";
import Comment from "../comment";

type CommentIndexProps = {
  playId: string;
  commentCount: number;
  setCommentCount: (count: number) => void;
};

const CommentIndex = ({
  playId,
  commentCount,
  setCommentCount,
}: CommentIndexProps) => {
  const { isMobile } = useMobileContext();
  const [index, setIndex] = useState<CommentType[] | null>(null);
  const [page, setPage] = useState<number>(1);
  const itemsPerPage = isMobile ? 5 : 10;

  const fetchComments = async () => {
    const { from, to } = getToAndFrom(itemsPerPage, page);
    const { data, count } = await supabase
      .from("comments")
      .select("*", { count: "exact" })
      .match({
        play_id: playId,
      })
      .order("created_at")
      .range(from, to);
    if (data && data.length > 0) setIndex(data);
    else setIndex(null);
    if (count) setCommentCount(count);
  };

  const handlePageChange = (e: React.ChangeEvent<unknown>, value: number) => {
    e.preventDefault();
    setPage(value);
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
    if (page === 1) void fetchComments();
    else setPage(1);
  }, [isMobile, playId]);

  useEffect(() => {
    void fetchComments();
  }, [page]);

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-col gap-2 px-6">
        {index?.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
        <div className="flex w-full flex-col items-center justify-center">
          {index && commentCount ? (
            <Pagination
              siblingCount={1}
              boundaryCount={0}
              showFirstButton
              showLastButton
              sx={{ marginTop: "8px" }}
              size="small"
              variant="text"
              shape="rounded"
              count={getNumberOfPages(itemsPerPage, commentCount)}
              page={page}
              onChange={handlePageChange}
            />
          ) : (
            <EmptyMessage size="small" message="comments" />
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentIndex;
