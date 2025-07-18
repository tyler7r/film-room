import { Box, CircularProgress, Typography } from "@mui/material"; // Import Box, CircularProgress, Typography, IconButton
import { useCallback, useEffect, useRef, useState } from "react"; // Added useCallback, useRef
import InfiniteScroll from "react-infinite-scroll-component"; // Import InfiniteScroll
import EmptyMessage from "~/components/utils/empty-msg";
import { useMobileContext } from "~/contexts/mobile";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { CommentNotificationType } from "~/utils/types";
import Comment from "../comment";

type CommentIndexProps = {
  playId: string;
  setCommentCount: (count: number) => void;
  activeComment?: string | undefined;
};

const CommentIndex = ({
  playId,
  setCommentCount,
  activeComment,
}: CommentIndexProps) => {
  const { isMobile } = useMobileContext();
  const { backgroundStyle } = useIsDarkContext();

  const [index, setIndex] = useState<CommentNotificationType[]>([]); // Initialize as empty array
  const [activeCom, setActiveCom] = useState<CommentNotificationType | null>(
    null,
  );

  // Infinite Scroll States
  const itemsPerLoad = isMobile ? 10 : 20;
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true); // For initial load indicator

  // Ref for the scrollable container
  const scrollableContainerRef = useRef<HTMLDivElement>(null);

  const fetchComments = useCallback(
    async (currentOffset: number, append = true) => {
      if (!supabase) {
        console.warn("Supabase client is not initialized.");
        if (!append) {
          // Only set loading to false if it's an initial fetch failing
          setLoadingInitial(false);
        }
        setHasMore(false); // No more data if Supabase isn't ready
        return;
      }

      if (!append) {
        setLoadingInitial(true); // Indicate initial loading
        setIndex([]); // Clear comments on initial fetch/reset
        setOffset(0); // Reset offset
        setHasMore(true); // Assume has more for initial fetch
      }

      try {
        const commentsQuery = supabase
          .from("comment_notification")
          .select("*", { count: "exact" })
          .eq("play->>id", playId)
          .order("comment->>created_at")
          .range(currentOffset, currentOffset + itemsPerLoad - 1);

        if (activeComment) {
          void commentsQuery.neq("comment->>id", activeComment);
        }

        const { data, count, error } = await commentsQuery;

        if (error) {
          console.error("Error fetching comments:", error);
          setHasMore(false);
          return;
        }

        if (data) {
          setIndex((prevIndex) => {
            const newIndex = append ? [...prevIndex, ...data] : data;
            // REMOVED: setTimeout for handleScroll here.
            // The useEffect below (which depends on index.length) will trigger handleScroll.
            return newIndex;
          });
          setOffset((prevOffset) => prevOffset + data.length);
          setHasMore(data.length === itemsPerLoad); // If fewer items than itemsPerLoad, no more data

          // Update comment count for external display if needed
          if (count !== null) {
            if (activeComment) setCommentCount(count + 1);
            else setCommentCount(count);
          } else {
            // If count is null (e.g., no matching comments found), set count based on fetched data
            setCommentCount(data.length + (activeComment ? 1 : 0));
          }
        } else {
          setHasMore(false); // No data means no more comments
          setCommentCount(activeComment ? 1 : 0); // Only active comment if no other data
        }
      } catch (error) {
        console.error("Unexpected error in fetchComments:", error);
        setHasMore(false);
      } finally {
        setLoadingInitial(false);
      }
    },
    [itemsPerLoad, playId, activeComment, setCommentCount],
  ); // Removed handleScroll from dependencies

  const refetchComments = () => {
    void fetchComments(offset);
  };

  const fetchActiveComm = useCallback(async () => {
    if (activeComment) {
      const { data, error } = await supabase
        .from("comment_notification")
        .select("*")
        .eq("comment->>id", activeComment)
        .single();
      if (error) {
        console.error("Error fetching active comment:", error);
        setActiveCom(null);
        return;
      }
      if (data) setActiveCom(data);
      else setActiveCom(null);
    } else setActiveCom(null);
  }, [activeComment]);

  // Initial data load and reset on playId or isMobile changes
  useEffect(() => {
    void fetchComments(0, false);
    void fetchActiveComm();
  }, [playId, isMobile, fetchComments, fetchActiveComm]);

  // Realtime subscription
  // useEffect(() => {
  //   if (!supabase) {
  //     console.warn("Supabase client is not initialized for real-time.");
  //     return;
  //   }

  //   const channel = supabase
  //     .channel(`comments_for_play_${playId}_changes`) // Unique channel name for specific play's comments
  //     .on(
  //       "postgres_changes",
  //       {
  //         event: "*",
  //         schema: "public",
  //         table: "comments",
  //         filter: `play_id=eq.${playId}`,
  //       }, // Filter for relevant plays
  //       () => {
  //         void fetchComments(0, false); // Re-fetch all comments from start on change
  //       },
  //     )
  //     .subscribe();

  //   return () => {
  //     void supabase.removeChannel(channel);
  //   };
  // }, [playId, fetchComments]); // Dependencies for the effect

  const loadMoreComments = () => {
    void fetchComments(offset, true);
  };

  return (
    <Box sx={{ display: "flex", width: "100%", flexDirection: "column" }}>
      {/* Active Comment display */}
      {activeCom && (
        <Box
          sx={{
            ...backgroundStyle, // Apply background style
            mb: 4, // margin-bottom
            display: "flex",
            width: { xs: "100%", sm: "90%", md: "calc(100% - 48px)" }, // Adjusted width from w-11/12
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "8px", // rounded-md
            p: 2, // padding from p-4 to p-2 for slightly less space
            mx: "auto", // Center the box if width is less than 100%
          }}
        >
          <Typography
            variant="h6" // text-lg md:text-xl
            sx={{ fontWeight: "bold", letterSpacing: "-0.025em", mb: 1 }} // tracking-tight, margin-bottom
          >
            Active Comment
          </Typography>
          <Comment
            key={activeCom.comment.id}
            cmt={activeCom}
            autoOpen={true}
            refetchComments={refetchComments}
          />
        </Box>
      )}
      {!loadingInitial && index.length === 0 && !activeCom && (
        <EmptyMessage message="comments" />
      )}
      {/* Scrollable Container for Infinite Scroll */}
      <Box
        id="commentsScrollableContainer" // Crucial ID for scrollableTarget
        ref={scrollableContainerRef}
        sx={{
          flexGrow: 1, // Allow it to take available height
          position: "relative", // IMPORTANT: for absolute positioning of the indicator
          overflowY: "auto", // Enable vertical scrolling
          maxHeight: "400px", // Example max height, adjust as needed
          p: 0.5, // Adjusted padding for comments area
          display: "flex",
          flexDirection: "column",
          gap: 2, // gap-2
          alignItems: "center",
          width: "100%",
        }}
      >
        {loadingInitial && index.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "150px",
            }}
          >
            <CircularProgress size={60} />
          </Box>
        ) : (
          <Box sx={{ width: "100%", p: 0.25 }}>
            <InfiniteScroll
              dataLength={index.length}
              next={loadMoreComments}
              hasMore={hasMore}
              loader={
                <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                  <CircularProgress />
                </Box>
              }
              endMessage={
                index.length > 0 &&
                !loadingInitial && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      color: "text.disabled",
                      my: 1,
                    }}
                  >
                    — End of Comments —
                  </Typography>
                )
              }
              scrollableTarget="commentsScrollableContainer" // Reference the ID of the Box above
              scrollThreshold={0.9}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                }}
              >
                {index.map((comment) => (
                  <Comment
                    key={comment.comment.id}
                    cmt={comment}
                    refetchComments={refetchComments}
                  />
                ))}
              </Box>
            </InfiniteScroll>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CommentIndex;
