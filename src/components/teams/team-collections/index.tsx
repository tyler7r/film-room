import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"; // For scroll to top
import ClearIcon from "@mui/icons-material/Clear";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";

import {
  Box, // For MUI layout
  Button, // For Load More button
  CircularProgress, // For loading spinners
  Fab, // For scroll to top button
  IconButton,
  InputAdornment, // For search input
  TextField, // For search input
  Typography, // For end message
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component"; // For infinite scroll
import Collection from "~/components/collections/collection";
import EmptyMessage from "~/components/utils/empty-msg";
import PageTitle from "~/components/utils/page-title";
import { useMobileContext } from "~/contexts/mobile";
import useDebounce from "~/utils/debounce"; // For debounced search
import { supabase } from "~/utils/supabase";
import type { CollectionViewType } from "~/utils/types";

type TeamCollectionsProps = {
  teamId: string;
};

const TeamCollections = ({ teamId }: TeamCollectionsProps) => {
  const { isMobile } = useMobileContext();

  // Infinite scroll states
  const itemsPerLoad = isMobile ? 10 : 18; // Increased items per load for desktop to potentially fill container
  const [collections, setCollections] = useState<CollectionViewType[]>([]); // Initialize as empty array
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true); // State for initial/new search loading
  const [loadingMore, setLoadingMore] = useState<boolean>(false); // State for infinite scroll loading
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalCollectionCount, setTotalCollectionCount] = useState<
    number | null
  >(null);

  // Search/Filter states
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showFilterBox, setShowFilterBox] = useState<boolean>(false); // For filter box visibility

  // Ref for the scrollable container
  const scrollableContainerRef = useRef<HTMLDivElement>(null);

  // Event handlers for search/filter UI
  const handleToggleFilterBox = () => {
    setShowFilterBox((prev) => !prev);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Function to scroll to the top of the container
  const scrollToTop = () => {
    if (scrollableContainerRef.current) {
      scrollableContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const fetchCollections = useCallback(
    async (
      currentOffset: number,
      append: boolean,
      currentSearchTerm: string,
    ) => {
      // Warn if Supabase client isn't initialized
      if (!supabase) {
        console.warn("Supabase client is not initialized.");
        if (!append) setLoadingInitial(false);
        setHasMore(false);
        return;
      }
      // If no teamId, clear collections and stop loading
      if (!teamId) {
        if (!append) setLoadingInitial(false);
        setCollections([]);
        setHasMore(false);
        setTotalCollectionCount(0);
        return;
      }

      // Set loading states based on whether it's an initial/new fetch or appending
      if (!append) {
        setLoadingInitial(true); // Indicate initial load for new search/filter
        setCollections([]); // Clear collections immediately for a new search/filter
        setOffset(0); // Reset offset for a new fetch
        setHasMore(true); // Assume more data until proven otherwise
        setTotalCollectionCount(null); // Set to null to show "..."
      } else {
        setLoadingMore(true); // Indicate loading more for infinite scroll
      }

      try {
        let collectionsQuery = supabase
          .from("collection_view")
          .select("*", { count: "exact" }) // Request exact count for total items
          .eq("collection->>exclusive_to", teamId) // Filter by teamId
          .order("collection->>created_at", { ascending: false }); // Order by creation date

        // Apply search term filter if present
        if (currentSearchTerm) {
          collectionsQuery = collectionsQuery.ilike(
            "collection->>title",
            `%${currentSearchTerm}%`,
          );
        }

        // Calculate range for pagination
        const rangeEnd = currentOffset + itemsPerLoad - 1;
        collectionsQuery = collectionsQuery.range(currentOffset, rangeEnd);

        const { data, count, error } = await collectionsQuery;

        if (error) {
          console.error("Error fetching team collections:", error);
          // Handle specific PostgREST range error
          if (error.code === "PGRST103") {
            setHasMore(false); // No more data available
          } else {
            setHasMore(false);
            setTotalCollectionCount(0); // General error, set count to 0
          }
          return;
        }

        if (data) {
          // Append or replace collections based on 'append' flag
          setCollections((prevCollections) =>
            append ? [...prevCollections, ...data] : data,
          );
          // Calculate the new offset based on the actual number of items received
          const newOffset = currentOffset + data.length;
          setOffset(newOffset);

          // Update total count and 'hasMore' status
          if (count !== null) {
            setTotalCollectionCount(count);
            // hasMore is true if the new offset is less than the total available count
            setHasMore(newOffset < count);
          } else {
            // Fallback if count is null, assume no more data for safety
            setHasMore(false);
            setTotalCollectionCount(data.length);
          }

          // Important: If fewer items than 'itemsPerLoad' are received, it's the last page
          if (data.length < itemsPerLoad) {
            setHasMore(false);
          }
        } else {
          setHasMore(false);
          setTotalCollectionCount(0);
        }
      } catch (error) {
        console.error("Unexpected error in fetchCollections:", error);
        setHasMore(false);
        setTotalCollectionCount(0);
      } finally {
        // Reset loading states
        if (!append) {
          setLoadingInitial(false);
        } else {
          setLoadingMore(false);
        }
      }
    },
    [itemsPerLoad, teamId], // Dependencies for useCallback
  );

  const debouncedFetchCollections = useDebounce(fetchCollections, 300);

  // --- useEffect hooks for data fetching ---

  // Effect to trigger initial data fetch when component mounts or teamId changes
  useEffect(() => {
    void fetchCollections(0, false, searchTerm);
  }, [teamId, fetchCollections]); // 'fetchCollections' is a dependency because it's a useCallback

  // Effect to trigger a new fetch when the search term changes (debounced)
  useEffect(() => {
    debouncedFetchCollections(0, false, searchTerm);
  }, [searchTerm, debouncedFetchCollections]);

  // Function called by InfiniteScroll to load more data
  const loadMoreCollections = () => {
    // Only load more if not already loading and there's potentially more data
    if (!loadingMore && hasMore) {
      void fetchCollections(offset, true, searchTerm);
    }
  };

  return (
    <Box
      id="team-collections-scrollable-container" // Unique ID for scrollable target
      ref={scrollableContainerRef} // Ref for scrolling to top
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        // Critical for desktop scrolling: ensure this container takes a defined height and scrolls
        height: "100vh", // Or 'calc(100vh - Xpx)' if you have fixed headers/footers
        maxHeight: "100vh", // Ensures it doesn't grow beyond viewport
        overflowY: "auto", // Enables vertical scrolling for this Box
        boxSizing: "border-box", // Include padding in height calculation
        pr: { xs: 0, sm: "8px" }, // Add right padding to prevent scrollbar overlap on desktop
      }}
    >
      {/* Title with number of results and Filter Icon */}
      <Box
        sx={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          flexShrink: 0,
          my: 1,
          mb: 2,
        }}
      >
        <PageTitle
          size="small"
          title={`Team Collections (${totalCollectionCount ?? 0})`}
          fullWidth={false}
        />
        <IconButton
          onClick={handleToggleFilterBox}
          size="small"
          aria-label="toggle filter menu"
        >
          <FilterListIcon color={showFilterBox ? "primary" : "inherit"} />
        </IconButton>
      </Box>

      {/* Filter Box (conditionally rendered) */}
      {showFilterBox && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            width: { xs: "100%", sm: "80%", md: "60%" },
            p: 2,
            borderRadius: "8px",
            boxShadow: 3,
            bgcolor: "background.paper",
            alignItems: "center",
            flexShrink: 0,
            mb: 2,
            mx: "auto",
          }}
        >
          <TextField
            label="Search Collections"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm ? (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClearSearch}
                    size="small"
                    edge="end"
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        </Box>
      )}

      {/* Collections List or Loading/Empty State */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          flexGrow: 1, // This Box will take up the remaining space and host the scrollable content
          alignItems: "center", // Center the grid items horizontally
        }}
      >
        {loadingInitial ? ( // Show initial loading spinner
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "150px", // Give some height for the spinner
              width: "100%",
              flexGrow: 1,
            }}
          >
            <CircularProgress size={40} />
          </Box>
        ) : !collections || collections.length === 0 ? (
          <EmptyMessage message="collections matching your criteria" />
        ) : (
          <InfiniteScroll
            dataLength={collections.length}
            next={loadMoreCollections}
            hasMore={hasMore}
            loader={
              loadingMore ? ( // Show loader only when actively loading more
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
              // Show end message if no more data and not currently loading more
              !hasMore &&
              collections.length > 0 &&
              !loadingMore && (
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    textAlign: "center",
                    color: "text.disabled",
                    my: 2,
                  }}
                >
                  — End of collections —
                </Typography>
              )
            }
            scrollableTarget="team-collections-scrollable-container" // Point to the scrollable container's ID
          >
            <Box
              sx={{
                display: "grid",
                width: "100%",
                gridTemplateColumns: {
                  xs: "repeat(1, minmax(370px, 1fr))",
                  sm: "repeat(2, minmax(280px, 1fr))",
                  md: "repeat(3, minmax(280px, 1fr))", // Assuming collections also fit well in 3 columns
                },
                gap: { xs: 2, md: 3 },
                justifyContent: "center", // Center the grid itself
              }}
            >
              {collections?.map((collection) => (
                <Collection
                  key={collection.collection.id}
                  collection={collection}
                />
              ))}
            </Box>
          </InfiniteScroll>
        )}

        {/* Manual "Load More" Button */}
        {/* Shows if not initial loading, not currently loading more, there IS more data, and some data is already displayed */}
        {!loadingInitial &&
          !loadingMore &&
          hasMore &&
          collections.length > 0 && (
            <Box
              sx={{
                my: 2, // Margin top and bottom for spacing
                display: "flex",
                justifyContent: "center",
                width: "100%", // Take full width
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
      </Box>

      {/* Scroll to Top Floating Action Button */}
      <Fab
        color="primary"
        onClick={scrollToTop}
        size="small"
        sx={{
          position: "fixed", // Fixed position relative to viewport
          bottom: "16px",
          right: "16px",
          zIndex: 1000, // Ensure it's above other content
        }}
        aria-label="Scroll to top"
      >
        <ArrowUpwardIcon />
      </Fab>
    </Box>
  );
};

export default TeamCollections;
