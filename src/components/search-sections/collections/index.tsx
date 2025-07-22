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

import Collection from "~/components/collections/collection";
import CreateCollection from "~/components/collections/create-collection"; // Keep this component
import EmptyMessage from "~/components/utils/empty-msg";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import useDebounce from "~/utils/debounce"; // Assuming this is your custom debounce hook
import { supabase } from "~/utils/supabase";
import type { CollectionViewType } from "~/utils/types";

type SearchCollectionsProps = {
  topic: string;
};

const SearchCollections = ({ topic }: SearchCollectionsProps) => {
  const { isMobile } = useMobileContext();
  const { affIds } = useAuthContext(); // Remains relevant for collection visibility

  // Infinite Scroll State
  const [collections, setCollections] = useState<CollectionViewType[]>([]); // Array to accumulate collections
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(0); // Current offset for fetching
  const [hasMore, setHasMore] = useState<boolean>(true); // Whether there's more data to load
  const [collectionCount, setCollectionCount] = useState<number | null>(null); // Total count of collections

  const itemsPerLoad = isMobile ? 10 : 20; // Number of items to load per batch

  const scrollableContainerRef = useRef<HTMLDivElement>(null); // Ref for the scrollable container

  // useCallback to memoize fetchCollections to prevent re-creation
  const fetchCollections = useCallback(
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
        setCollections([]);
        setOffset(0);
        setHasMore(true);
        setCollectionCount(null);
      } else {
        setLoadingMore(true);
      }

      try {
        let query = supabase
          .from("collection_view")
          .select("*", { count: "exact" })
          .ilike("collection->>title", `%${currentTopic}%`)
          .order("collection->>created_at", { ascending: false });

        // Apply privacy/exclusive filters
        if (affIds && affIds.length > 0) {
          // Use .or() with template literals for dynamic array inclusion
          query = query.or(
            `collection->>private.eq.false, collection->>exclusive_to.in.(${affIds.join(
              ",",
            )})`,
          );
        } else {
          query = query.eq("collection->>private", false);
        }

        const rangeEnd = currentOffset + itemsPerLoad - 1;
        query = query.range(currentOffset, rangeEnd);

        const { data, count, error } = await query;

        if (error) {
          console.error("Error fetching collections:", error);
          setHasMore(false);
          setCollectionCount(0);
          return;
        }

        if (data) {
          setCollections((prevCollections) =>
            append ? [...prevCollections, ...data] : data,
          );
          const newOffset = currentOffset + data.length;
          setOffset(newOffset);

          if (count !== null) {
            setCollectionCount(count);
            setHasMore(newOffset < count); // More data if newOffset is less than total count
          } else {
            // If count is null, assume no more data if fetched less than itemsPerLoad
            setHasMore(data.length === itemsPerLoad); // If count not available, check if we filled the batch
            setCollectionCount(data.length); // Approximate count
          }

          // Fallback check: if we got less data than requested, there's no more
          if (data.length < itemsPerLoad) {
            setHasMore(false);
          }
        } else {
          setHasMore(false);
          setCollectionCount(0);
        }
      } catch (error) {
        console.error("Unexpected error in fetchCollections:", error);
        setHasMore(false);
        setCollectionCount(0);
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

  // Debounce the fetchCollections function
  const debouncedFetchCollections = useDebounce(fetchCollections, 300);

  // Effect to trigger initial fetch or reset when 'topic', 'isMobile' or 'affIds' changes
  useEffect(() => {
    // Reset Infinite Scroll state and trigger initial fetch for new topic or affIds change
    setLoadingInitial(true); // Indicate initial loading
    setCollections([]); // Clear previous results
    setOffset(0); // Reset offset
    setHasMore(true); // Assume more data initially
    setCollectionCount(null); // Reset count

    // Call the debounced fetcher with initial parameters
    debouncedFetchCollections(0, false, topic);
  }, [topic, isMobile, affIds, debouncedFetchCollections]); // Depend on topic, isMobile, affIds, and the memoized debounced function

  // Function to load more collections for InfiniteScroll
  const loadMoreCollections = () => {
    if (!loadingMore && hasMore && !loadingInitial) {
      // Ensure we're not already loading or doing initial load
      void debouncedFetchCollections(offset, true, topic);
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
      id="search-collections-scrollable-container" // ID for InfiniteScroll scrollableTarget
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
      {collectionCount !== null && ( // Only show if count is available
        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
          {collectionCount} results found
        </Typography>
      )}

      {/* Create Collection Button/Component */}
      {!loadingInitial && <CreateCollection standaloneTrigger={true} />}

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
      ) : collections.length === 0 ? ( // Check collections.length for empty
        <EmptyMessage message="collections matching your criteria" />
      ) : (
        // Infinite Scroll Container
        <InfiniteScroll
          dataLength={collections.length}
          next={loadMoreCollections}
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
            collections.length > 0 &&
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
          scrollableTarget="search-collections-scrollable-container" // Must match the ID of the scrollable Box
        >
          <Box
            sx={{
              display: "grid",
              width: "100%",
              gridTemplateColumns: {
                xs: "repeat(1, minmax(320px, 1fr))", // Adjust collection card width/layout as needed
                sm: "repeat(2, minmax(280px, 1fr))",
                md: "repeat(3, minmax(280px, 1fr))",
              },
              gap: { xs: 2, md: 3 }, // Responsive gap
              justifyContent: "center",
              px: 2,
            }}
          >
            {collections.map((collection) => (
              // Ensure Collection component accepts collection prop directly
              <Collection
                key={collection.collection.id}
                collection={collection}
              />
            ))}
          </Box>
        </InfiniteScroll>
      )}

      {!loadingInitial && !loadingMore && hasMore && collections.length > 0 && (
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
            onClick={loadMoreCollections}
            disabled={loadingMore}
          >
            Load More Collections
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

export default SearchCollections;
