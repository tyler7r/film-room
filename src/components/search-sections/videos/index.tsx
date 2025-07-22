import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"; // For scroll to top FAB
import {
  Box,
  Button, // New: Material UI Box for layout
  CircularProgress, // For loading indicators
  Fab, // For scroll to top button
  Typography, // For end message
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react"; // Added useCallback, useRef
import InfiniteScroll from "react-infinite-scroll-component"; // Import InfiniteScroll

import EmptyMessage from "~/components/utils/empty-msg";
import CreateVideo from "~/components/videos/create-video"; // Keep this component
import Video from "~/components/videos/video";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import useDebounce from "~/utils/debounce"; // Assuming this is your custom debounce hook
import { supabase } from "~/utils/supabase";
import type { VideoType } from "~/utils/types";

type SearchVideosProps = {
  topic: string;
};

const SearchVideos = ({ topic }: SearchVideosProps) => {
  const { isMobile } = useMobileContext();
  const { affIds } = useAuthContext(); // Remains relevant for video visibility

  // Infinite Scroll State
  const [videos, setVideos] = useState<VideoType[]>([]); // Array to accumulate videos
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(0); // Current offset for fetching
  const [hasMore, setHasMore] = useState<boolean>(true); // Whether there's more data to load
  const [videoCount, setVideoCount] = useState<number | null>(null); // Total count of videos

  const itemsPerLoad = isMobile ? 10 : 21; // Number of items to load per batch

  const scrollableContainerRef = useRef<HTMLDivElement>(null); // Ref for the scrollable container

  // useCallback to memoize fetchVideos to prevent re-creation
  const fetchVideos = useCallback(
    async (currentOffset: number, append: boolean, currentTopic: string) => {
      if (!supabase) {
        console.warn("Supabase client is not initialized.");
        if (!append) setLoadingInitial(false);
        setHasMore(false);
        return;
      }

      if (!append) {
        // Initial load or topic change: Reset all states
        setLoadingInitial(true);
        setVideos([]);
        setOffset(0);
        setHasMore(true);
        setVideoCount(null);
      } else {
        setLoadingMore(true);
      }

      try {
        let query = supabase
          .from("videos")
          .select("*", { count: "exact" })
          .ilike("title", `%${currentTopic}%`)
          .order("uploaded_at", { ascending: false });

        // Apply privacy/exclusive filters
        if (affIds && affIds.length > 0) {
          // Use .or() with template literals for dynamic array inclusion
          query = query.or(
            `private.eq.false, exclusive_to.in.(${affIds.join(",")})`,
          );
        } else {
          query = query.eq("private", false);
        }

        const rangeEnd = currentOffset + itemsPerLoad - 1;
        query = query.range(currentOffset, rangeEnd);

        const { data, count, error } = await query;

        if (error) {
          console.error("Error fetching videos:", error);
          setHasMore(false);
          setVideoCount(0);
          return;
        }

        if (data) {
          setVideos((prevVideos) => (append ? [...prevVideos, ...data] : data));
          const newOffset = currentOffset + data.length;
          setOffset(newOffset);

          if (count !== null) {
            setVideoCount(count);
            setHasMore(newOffset < count); // More data if newOffset is less than total count
          } else {
            // If count is null, assume no more data if fetched less than itemsPerLoad
            setHasMore(data.length === itemsPerLoad); // If count not available, check if we filled the batch
            setVideoCount(data.length); // Approximate count
          }

          // Fallback check: if we got less data than requested, there's no more
          if (data.length < itemsPerLoad) {
            setHasMore(false);
          }
        } else {
          setHasMore(false);
          setVideoCount(0);
        }
      } catch (error) {
        console.error("Unexpected error in fetchVideos:", error);
        setHasMore(false);
        setVideoCount(0);
      } finally {
        if (!append) {
          setLoadingInitial(false);
        } else {
          setLoadingMore(false);
        }
      }
    },
    [itemsPerLoad, affIds], // Dependencies for useCallback: affIds impacts the query
  );

  // Debounce the fetchVideos function
  const debouncedFetchVideos = useDebounce(fetchVideos, 300);

  // Effect to trigger initial fetch or reset when 'topic', 'isMobile' or 'affIds' changes
  // 'affIds' is crucial here as it affects the privacy filter of the videos
  useEffect(() => {
    // Reset Infinite Scroll state and trigger initial fetch for new topic or affIds change
    setLoadingInitial(true); // Indicate initial loading
    setVideos([]); // Clear previous results
    setOffset(0); // Reset offset
    setHasMore(true); // Assume more data initially
    setVideoCount(null); // Reset count

    // Call the debounced fetcher with initial parameters
    debouncedFetchVideos(0, false, topic);
  }, [topic, isMobile, affIds, debouncedFetchVideos]); // Depend on topic, isMobile, affIds, and the memoized debounced function

  // Function to load more videos for InfiniteScroll
  const loadMoreVideos = () => {
    if (!loadingMore && hasMore && !loadingInitial) {
      // Ensure we're not already loading or doing initial load
      void debouncedFetchVideos(offset, true, topic);
    }
  };

  // Function to scroll to the top of the container
  const scrollToTop = () => {
    if (scrollableContainerRef.current) {
      scrollableContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <Box
      id="search-videos-scrollable-container" // ID for InfiniteScroll scrollableTarget
      ref={scrollableContainerRef}
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%", // Use 100% width
        height: "100vh", // Or a specific max-height to fit your layout
        maxHeight: "calc(100vh - 200px)", // Adjust this value based on header/footer height
        overflowY: "auto", // Enable scrolling
        boxSizing: "border-box", // Include padding in width/height
        pr: { xs: 0, sm: "8px" }, // Padding right for scrollbar on desktop
        pb: "40px", // Padding bottom to allow space for FAB
        alignItems: "center", // Center content horizontally if not full width
        gap: 2,
      }}
    >
      {/* Search results count display */}
      {videoCount !== null && ( // Only show if count is available
        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
          {videoCount} results found
        </Typography>
      )}

      {/* Create Video Button/Component */}
      {!loadingInitial && <CreateVideo standaloneTrigger={true} />}

      {/* Initial Loading or Empty Message */}
      {loadingInitial ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "150px", // Give some height for spinner
            width: "100%",
          }}
        >
          <CircularProgress size={40} />
        </Box>
      ) : videos.length === 0 ? ( // Check videos.length for empty
        <EmptyMessage message="videos matching your criteria" />
      ) : (
        // Infinite Scroll Container
        <InfiniteScroll
          dataLength={videos.length}
          next={loadMoreVideos}
          hasMore={hasMore}
          loader={
            loadingMore ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  my: 2,
                  width: "100%",
                }}
              >
                <CircularProgress />
              </Box>
            ) : null
          }
          endMessage={
            !hasMore &&
            videos.length > 0 &&
            !loadingMore && (
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  textAlign: isMobile ? "start" : "center",
                  color: "text.disabled",
                  my: 2,
                }}
              >
                — End of results —
              </Typography>
            )
          }
          scrollThreshold={0.9}
          scrollableTarget="search-videos-scrollable-container" // Must match the ID of the scrollable Box
        >
          <Box
            sx={{
              display: "grid",
              width: "100%",
              px: 2,
              gridTemplateColumns: {
                xs: "repeat(1, minmax(320px, 1fr))", // Adjust video card width/layout as needed
                sm: "repeat(2, minmax(280px, 1fr))",
                md: "repeat(3, minmax(280px, 1fr))",
              },
              gap: { xs: 2, md: 3 }, // Responsive gap
              justifyContent: "center",
            }}
          >
            {videos.map((v) => (
              <Video video={v} key={v.id} />
            ))}
          </Box>
        </InfiniteScroll>
      )}

      {!loadingInitial && !loadingMore && hasMore && videos.length > 0 && (
        <Box
          sx={{
            my: 2,
            display: "flex",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <Button
            variant="contained"
            onClick={loadMoreVideos}
            disabled={loadingMore}
          >
            Load More Videos
          </Button>
        </Box>
      )}

      {/* Scroll to Top FAB */}
      <Fab
        color="primary"
        onClick={scrollToTop}
        size="small"
        sx={{
          position: "fixed", // Fixed position relative to viewport
          bottom: { xs: "16px", sm: "16px" }, // Adjust bottom for mobile navigation if present
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

export default SearchVideos;
