import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { Box, CircularProgress, Fab, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { supabase } from "utils/supabase/component";
import PlayPreview from "~/components/plays/play_preview";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import type { PlayPreviewType } from "~/utils/types";

type HighlightedPlaysFeedProps = {
  profileId: string; // The ID of the user whose highlights are being displayed
};

const HighlightedPlaysFeed = ({ profileId }: HighlightedPlaysFeedProps) => {
  const { affIds } = useAuthContext();
  const { isMobile } = useMobileContext();

  const itemsPerLoad = isMobile ? 5 : 10;

  const [plays, setPlays] = useState<PlayPreviewType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Memoized fetch function for highlighted plays
  const fetchHighlightedPlays = useCallback(
    async (currentOffset: number, append = true) => {
      if (!supabase) {
        console.warn("Supabase client is not initialized.");
        if (!append) {
          setLoading(false);
        }
        setHasMore(false);
        return;
      }

      if (!append) {
        setLoading(true);
        setPlays([]);
        setOffset(0);
        setHasMore(true);
      }

      try {
        const playsQuery = supabase
          .from("plays_via_user_mention")
          .select("*", { count: "exact" })
          .eq("play->>highlight", true) // Filter for highlights
          .eq("mention->>receiver_id", profileId)
          .eq("play->>post_to_feed", true) // Only show plays meant for feed
          .order("play->>created_at", { ascending: false })
          .range(currentOffset, currentOffset + itemsPerLoad - 1);

        // Apply visibility logic similar to Home feed
        if (affIds && affIds.length > 0) {
          void playsQuery.or(
            `play->>private.eq.false, play->>exclusive_to.in.(${affIds.join(
              ",",
            )})`,
          );
        } else {
          // If no affiliations, only show truly public highlights from this author
          void playsQuery.eq("play->>private", false);
        }

        const { data, error } = await playsQuery;

        if (error) {
          console.error("Error fetching highlighted plays:", error);
          setHasMore(false);
          return;
        }

        if (data) {
          setPlays((prevPlays) => (append ? [...prevPlays, ...data] : data));
          setOffset((prevOffset) => prevOffset + data.length);
          setHasMore(data.length === itemsPerLoad);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Unexpected error in fetchHighlightedPlays:", error);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [itemsPerLoad, profileId, affIds],
  ); // Dependencies for useCallback

  // Effect for initial data load and resetting when filters change
  useEffect(() => {
    void fetchHighlightedPlays(0, false);
  }, [fetchHighlightedPlays]);

  const loadMorePlays = () => {
    void fetchHighlightedPlays(offset, true);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box className="flex flex-col items-center justify-center gap-4 p-4">
      {loading && plays.length === 0 ? (
        <Box className="flex h-full w-full items-center justify-center p-4">
          <CircularProgress size={128} />
        </Box>
      ) : (
        <>
          <Box className="grid grid-cols-1 items-center justify-center gap-6">
            <InfiniteScroll
              dataLength={plays.length}
              next={loadMorePlays}
              hasMore={hasMore}
              loader={
                <Box className="my-4 flex justify-center">
                  <CircularProgress />
                </Box>
              }
              endMessage={
                plays.length > 0 && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      textAlign: "center",
                      color: "text.disabled",
                      my: 2,
                    }}
                  >
                    — End of highlighted plays —
                  </Typography>
                )
              }
            >
              {plays.map((play) => (
                <PlayPreview preview={play} key={play.play.id} />
              ))}
            </InfiniteScroll>
          </Box>

          {!loading && plays.length === 0 && (
            <Box className="py-4 text-center text-gray-500">
              No highlighted plays by this user yet.
            </Box>
          )}
        </>
      )}
      <Fab
        color="primary"
        onClick={scrollToTop}
        size="small"
        sx={{
          position: "fixed",
          bottom: "16px",
          right: "16px",
          zIndex: 1000,
        }}
        aria-label="Scroll to top"
      >
        <ArrowUpwardIcon />
      </Fab>
    </Box>
  );
};

export default HighlightedPlaysFeed;
