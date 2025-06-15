import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import { Box, CircularProgress, Fab, Typography } from "@mui/material"; // Import Box for layout
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component"; // Import InfiniteScroll
import { supabase } from "utils/supabase/component";
import { Logo } from "~/components/navbar/logo/logo";
import PlayPreview from "~/components/plays/play_preview";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import type { PlayPreviewType } from "~/utils/types";
import { useIsDarkContext } from "./_app"; // Assuming this import path is correct

const Home = () => {
  const { affIds } = useAuthContext();
  const { hoverText } = useIsDarkContext();
  const { isMobile, screenWidth } = useMobileContext();

  const router = useRouter();
  // Items per load will dynamically adjust based on mobile/desktop
  const itemsPerLoad = isMobile ? 5 : 10;

  const [plays, setPlays] = useState<PlayPreviewType[]>([]); // Initialize as empty array
  const [loading, setLoading] = useState<boolean>(true); // Initial loading state
  const [offset, setOffset] = useState<number>(0); // Tracks how many items have been loaded
  const [hasMore, setHasMore] = useState<boolean>(true); // Indicates if more data is available

  // bottomRef is no longer needed with react-infinite-scroll-component

  // Memoized fetchPlays function to prevent unnecessary re-creation
  const fetchPlays = useCallback(
    async (currentOffset: number, append = true) => {
      if (!supabase) {
        console.warn("Supabase client is not initialized.");
        if (!append) {
          // Only set loading to false if it's an initial fetch failing
          setLoading(false);
        }
        setHasMore(false); // No more data if Supabase isn't ready
        return;
      }

      if (!append) {
        setLoading(true); // Indicate initial loading
        setPlays([]); // Clear plays on initial fetch/reset
        setOffset(0); // Reset offset
        setHasMore(true); // Assume has more for initial fetch
      }

      try {
        const playsQuery = supabase
          .from("play_preview")
          .select("*", { count: "exact" })
          .eq("play->>post_to_feed", true)
          .order("play->>created_at", { ascending: false })
          .range(currentOffset, currentOffset + itemsPerLoad - 1); // Fetch range based on offset and itemsPerLoad

        if (affIds && affIds.length > 0) {
          // Apply visibility logic based on `affIds`
          void playsQuery.or(
            `play->>private.eq.false, play->>exclusive_to.in.(${affIds.join(
              ",",
            )})`,
          );
        } else {
          void playsQuery.eq("play->>private", false);
        }

        const { data, error } = await playsQuery;

        if (error) {
          console.error("Error fetching plays:", error);
          setHasMore(false);
          return;
        }

        if (data) {
          setPlays((prevPlays) => (append ? [...prevPlays, ...data] : data)); // Append or replace data
          setOffset((prevOffset) => prevOffset + data.length); // Increase offset by number of items fetched
          setHasMore(data.length === itemsPerLoad); // If fewer items than itemsPerLoad, no more data
        } else {
          setHasMore(false); // No data means no more plays
        }
      } catch (error) {
        console.error("Unexpected error in fetchPlays:", error);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [itemsPerLoad, affIds],
  ); // Dependencies for useCallback: itemsPerLoad and affIds

  // Effect for initial data load and resetting when filters change
  useEffect(() => {
    // When affIds or isMobile change, reset the feed and fetch from scratch
    void fetchPlays(0, false); // Pass 0 for offset and false for append to reset
  }, [affIds, isMobile, fetchPlays]); // Add fetchPlays as a dependency

  const loadMorePlays = () => {
    void fetchPlays(offset, true);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box className="flex flex-col items-center justify-center gap-4">
      {loading && plays.length === 0 ? ( // Show initial loading spinner if no plays are loaded yet
        <Box className="flex h-full w-full items-center justify-center p-4">
          <CircularProgress size={128} />
        </Box>
      ) : (
        <Box
          sx={{
            width: "100%",
            p: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            alignItems: "center",
          }}
        >
          {screenWidth > 525 ? <Logo size="large" /> : <Logo size="medium" />}
          <Box className="items-center justify-center text-xl">
            <Box className="text-center">
              The film can't analyze itself.{" "}
              <strong
                onClick={() => void router.push("/film-room")}
                className={`${hoverText} cursor-pointer tracking-tight`}
              >
                Get started!
              </strong>
            </Box>
          </Box>
          <Box
            className="flex items-center justify-center gap-4 text-center"
            // topRef is still used for scrolling to top if you re-introduce that feature
          >
            <KeyboardDoubleArrowDownIcon fontSize="large" color="primary" />
            <Box className="text-2xl font-bold tracking-tight">
              OR GET INSPIRED!
            </Box>
            <KeyboardDoubleArrowDownIcon fontSize="large" color="primary" />
          </Box>

          <Box
            sx={{
              width: `${isMobile ? "100%" : "80%"}`,
              px: 1,
            }}
          >
            <InfiniteScroll
              dataLength={plays.length} // This is important field to render the amount of data
              next={loadMorePlays}
              hasMore={hasMore}
              loader={
                // Loader component shown while fetching more data
                <Box className="my-4 flex justify-center">
                  <CircularProgress />
                </Box>
              }
              endMessage={
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    textAlign: "center",
                    color: "text.disabled",
                    my: 2,
                  }}
                >
                  — End of the Plays —
                </Typography>
              } // Message when no more data is available
              scrollThreshold={0.9}
              scrollableTarget="scrollableDiv" // Ensure your main scroll container has this ID
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

          {/* If no plays at all */}
          {!loading && plays.length === 0 && (
            <Box className="py-4 text-center text-gray-500">
              No plays available yet. Be the first to create one!
            </Box>
          )}

          {/* bottomRef is no longer needed */}
        </Box>
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

export default Home;
