import { Box, CircularProgress, Typography, useTheme } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import EmptyMessage from "~/components/utils/empty-msg";
import { useMobileContext } from "~/contexts/mobile";
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

const ReplyIndex = ({ comment, setReplyCount }: ReplyIndexProps) => {
  const { isMobile } = useMobileContext();
  const theme = useTheme();

  const [replies, setReplies] = useState<ReplyNotificationType[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [currentOffset, setCurrentOffset] = useState<number>(0);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);

  const scrollableContainerRef = useRef<HTMLDivElement>(null);

  const itemsPerLoad = isMobile ? 5 : 10;

  const fetchReplies = useCallback(
    async (offsetToFetch: number, append = true) => {
      if (!append) {
        setLoadingInitial(true);
        setReplies([]);
        setCurrentOffset(0);
        setHasMore(true);
      }

      try {
        const { data, count, error } = await supabase
          .from("reply_notification")
          .select("*", { count: "exact" })
          .eq("comment->>id", comment.comment.id)
          .order("reply->>created_at")
          .range(offsetToFetch, offsetToFetch + itemsPerLoad - 1);

        if (error) {
          console.error("Error fetching replies:", error);
          setHasMore(false);
          return;
        }

        if (data) {
          setReplies((prev) => (append ? [...prev, ...data] : data));
          setCurrentOffset(offsetToFetch + data.length);
          setHasMore(data.length === itemsPerLoad);

          if (count !== null) {
            setReplyCount(count);
          } else {
            setReplyCount(data.length);
          }
        } else {
          setHasMore(false);
          setReplyCount(0);
        }
      } catch (error) {
        console.error("Unexpected error in fetchReplies:", error);
        setHasMore(false);
      } finally {
        setLoadingInitial(false);
      }
    },
    [comment.comment.id, itemsPerLoad, setReplyCount],
  );

  useEffect(() => {
    void fetchReplies(0, false);
  }, [comment.comment.id, isMobile, fetchReplies]);

  // useEffect(() => {
  //   if (!supabase) {
  //     console.warn("Supabase client is not initialized for real-time.");
  //     return;
  //   }

  //   const channel = supabase
  //     .channel(`replies_for_comment_${comment.comment.id}_changes`)
  //     .on(
  //       "postgres_changes",
  //       {
  //         event: "*",
  //         schema: "public",
  //         table: "replies",
  //         filter: `comment_id=eq.${comment.comment.id}`,
  //       },
  //       () => {
  //         void fetchReplies(0, false);
  //       },
  //     )
  //     .subscribe();

  //   return () => {
  //     void supabase.removeChannel(channel);
  //   };
  // }, [comment.comment.id, fetchReplies]);

  const loadMoreReplies = () => {
    if (!loadingInitial && hasMore) {
      void fetchReplies(currentOffset, true);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        flexDirection: "column",
        gap: 2,
        px: { xs: 0, sm: 2, md: 3 },
      }}
    >
      <AddReply
        comment={comment}
        comment_author={comment.author}
        setReload={() => void fetchReplies(0, false)}
      />
      {replies.length === 0 && !loadingInitial && (
        <EmptyMessage message="replies" />
      )}
      <Box
        id="repliesScrollableContainer"
        ref={scrollableContainerRef}
        sx={{
          flexGrow: 1,
          position: "relative",
          overflowY: "auto",
          maxHeight: { xs: "250px", md: "350px" },
          px: 1,
          py: 0.5,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          width: "100%",
          borderRadius: "8px",
          border:
            replies.length > 0 ? `1px solid ${theme.palette.divider}` : ``,
        }}
      >
        {loadingInitial && replies.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "100px",
            }}
          >
            <CircularProgress size={40} />
          </Box>
        ) : (
          <InfiniteScroll
            dataLength={replies.length}
            next={loadMoreReplies}
            hasMore={hasMore}
            loader={
              <Box sx={{ display: "flex", justifyContent: "center", my: 1 }}>
                <CircularProgress size={20} />
              </Box>
            }
            endMessage={
              replies.length > 0 &&
              !loadingInitial && (
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    color: "text.disabled",
                    my: 0.5,
                  }}
                >
                  — End of Replies —
                </Typography>
              )
            }
            scrollableTarget="repliesScrollableContainer"
            scrollThreshold={0.9}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                gap: 1,
              }}
            >
              {replies.map((reply) => (
                <Reply
                  key={reply.reply.id}
                  reply={reply}
                  setReload={() => void fetchReplies(0, false)}
                />
              ))}
            </Box>
          </InfiniteScroll>
        )}
      </Box>
    </Box>
  );
};

export default ReplyIndex;
