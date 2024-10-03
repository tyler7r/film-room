import { Pagination } from "@mui/material";
import { useEffect, useState } from "react";
import EmptyMessage from "~/components/utils/empty-msg";
import { useMobileContext } from "~/contexts/mobile";
import { useIsDarkContext } from "~/pages/_app";
import { getNumberOfPages, getToAndFrom } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { CommentNotificationType } from "~/utils/types";
import Comment from "../comment";

type CommentIndexProps = {
  playId: string;
  commentCount: number;
  setCommentCount: (count: number) => void;
  activeComment?: string | undefined;
};

const CommentIndex = ({
  playId,
  commentCount,
  setCommentCount,
  activeComment,
}: CommentIndexProps) => {
  const { isMobile } = useMobileContext();
  const { backgroundStyle } = useIsDarkContext();
  const [index, setIndex] = useState<CommentNotificationType[] | null>(null);
  const [activeCom, setActiveCom] = useState<CommentNotificationType | null>(
    null,
  );
  const [page, setPage] = useState<number>(1);
  const itemsPerPage = isMobile ? 10 : 20;

  const fetchComments = async () => {
    const { from, to } = getToAndFrom(itemsPerPage, page);
    const comments = supabase
      .from("comment_notification")
      .select("*", { count: "exact" })
      .eq("play->>id", playId)
      .order("comment->>created_at")
      .range(from, to);
    if (activeComment) {
      void comments.neq("comment->>id", activeComment);
    }
    const { data, count } = await comments;
    if (data && data.length > 0) setIndex(data);
    else setIndex(null);
    if (count && activeComment) setCommentCount(count + 1);
    else if (count && !activeComment) setCommentCount(count);
    else if (!count && activeComment) setCommentCount(1);
    else setCommentCount(0);
  };

  const fetchActiveComm = async () => {
    if (activeComment) {
      const comments = supabase
        .from("comment_notification")
        .select("*")
        .eq("comment->>id", activeComment)
        .single();
      const { data } = await comments;
      if (data) setActiveCom(data);
      else setActiveCom(null);
    }
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
    void fetchActiveComm();
  }, [page, activeComment]);

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-col items-center justify-center gap-2 px-6">
        {activeCom && (
          <div
            style={backgroundStyle}
            className={`mb-4 flex w-11/12 flex-col items-center justify-center rounded-md p-4`}
          >
            <div className="text-lg font-bold tracking-tight md:text-xl">
              Active Comment
            </div>
            <Comment
              key={activeCom.comment.id}
              cmt={activeCom}
              autoOpen={true}
            />
          </div>
        )}
        {index?.map((comment) => (
          <Comment key={comment.comment.id} cmt={comment} />
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
            !activeCom && <EmptyMessage size="small" message="comments" />
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentIndex;
