import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { Box, CircularProgress, Fab, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { supabase } from "utils/supabase/component";
import PlayPreview from "~/components/plays/play_preview";
import { useAuthContext } from "~/contexts/auth"; // Assuming this context exists
import { useMobileContext } from "~/contexts/mobile"; // Assuming this context exists
import type { PlayPreviewType } from "~/utils/types"; // Assuming this type exists

export type FeedProps = {
  profileId: string; // The ID of the user whose created plays are being displayed
  // Any other props needed for filtering/context
};

const CreatedPlaysFeed = ({ profileId }: FeedProps) => {
  const { affIds } = useAuthContext();
  const { isMobile } = useMobileContext();

  const itemsPerLoad = isMobile ? 5 : 10; // Adjust items per load dynamically

  const [plays, setPlays] = useState<PlayPreviewType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Memoized fetch function for created plays
  const fetchCreatedPlays = useCallback(
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
          .from("play_preview")
          .select("*", { count: "exact" })
          .eq("play->>author_id", profileId) // Filter by author_id
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
          // If no affiliations, only show truly public plays from this author
          void playsQuery.eq("play->>private", false);
        }

        const { data, error } = await playsQuery;

        if (error) {
          console.error("Error fetching created plays:", error);
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
        console.error("Unexpected error in fetchCreatedPlays:", error);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [itemsPerLoad, profileId, affIds],
  ); // Dependencies for useCallback

  // Effect for initial data load and resetting when filters change
  useEffect(() => {
    void fetchCreatedPlays(0, false);
  }, [fetchCreatedPlays]); // Dependency on memoized fetch function

  const loadMorePlays = () => {
    void fetchCreatedPlays(offset, true);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box className="flex w-full flex-col items-center justify-center">
      {loading && plays.length === 0 ? (
        <Box className="flex h-full w-full items-center justify-center p-4">
          <CircularProgress size={128} />
        </Box>
      ) : (
        <>
          <Box
            sx={{
              width: `${isMobile ? "100%" : "80%"}`,
              px: 1,
            }}
          >
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
                    — End of this user's plays —
                  </Typography>
                )
              }
              // For full page scroll, remove scrollableTarget or set to window
              // For contained scroll, ensure parent has id="scrollableDiv" and overflow-y: auto
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                {plays.map((play) => (
                  <PlayPreview preview={play} key={play.play.id} />
                ))}
              </Box>
            </InfiniteScroll>
          </Box>

          {!loading && plays.length === 0 && (
            <Box className="py-4 text-center text-gray-500">
              No plays created by this user yet.
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

export default CreatedPlaysFeed;
