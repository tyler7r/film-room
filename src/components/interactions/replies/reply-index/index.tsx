import { CircularProgress, Pagination } from "@mui/material";
import { useEffect, useState } from "react";
import { useMobileContext } from "~/contexts/mobile";
import { getNumberOfPages, getToAndFrom } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type {
  CommentNotificationType,
  ReplyNotificationType,
} from "~/utils/types";
import AddReply from "../add-reply";
import Reply from "../reply";

type ReplyIndexProps = {
  comment: CommentNotificationType;
  replyCount: number;
  setReplyCount: (count: number) => void;
};

const ReplyIndex = ({
  comment,
  replyCount,
  setReplyCount,
}: ReplyIndexProps) => {
  const { isMobile } = useMobileContext();
  const [index, setIndex] = useState<ReplyNotificationType[] | null>(null);
  const [page, setPage] = useState<number>(1);
  const itemsPerPage = isMobile ? 3 : 5;
  const [reload, setReload] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchReplies = async () => {
    const { from, to } = getToAndFrom(itemsPerPage, page);
    const { data, count } = await supabase
      .from("reply_notification")
      .select("*", { count: "exact" })
      .eq("comment->>id", comment.comment.id)
      .order("reply->>created_at")
      .range(from, to);
    if (data && data.length > 0) setIndex(data);
    else setIndex(null);
    if (count) setReplyCount(count);
    else setReplyCount(0);
    setLoading(false);
  };

  const handlePageChange = (e: React.ChangeEvent<unknown>, value: number) => {
    e.preventDefault();
    setPage(value);
  };

  useEffect(() => {
    const channel = supabase
      .channel("reply_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "replies" },
        () => {
          void fetchReplies();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (page === 1) void fetchReplies();
    else setPage(1);
  }, [isMobile, comment.comment.id]);

  useEffect(() => {
    if (reload) {
      void fetchReplies();
      setReload(false);
    } else return;
  }, [reload]);

  useEffect(() => {
    void fetchReplies();
  }, [page]);

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full flex-col gap-2 px-6">
        <AddReply
          comment={comment}
          comment_author={comment.author}
          setReload={setReload}
        />
        {loading ? (
          <CircularProgress size="small" />
        ) : (
          <div className="flex w-full flex-col gap-2">
            {index?.map((reply) => (
              <Reply key={reply.reply.id} reply={reply} setReload={setReload} />
            ))}
            <div className="flex w-full flex-col items-center justify-center">
              {index && replyCount && (
                <Pagination
                  siblingCount={1}
                  boundaryCount={0}
                  sx={{ marginTop: "8px" }}
                  size="small"
                  variant="text"
                  count={getNumberOfPages(itemsPerPage, replyCount)}
                  page={page}
                  onChange={handlePageChange}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReplyIndex;
