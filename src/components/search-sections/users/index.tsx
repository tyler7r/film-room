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
import User from "~/components/user";
import EmptyMessage from "~/components/utils/empty-msg";
import { useMobileContext } from "~/contexts/mobile";
import useDebounce from "~/utils/debounce"; // Assuming this is your custom debounce hook
import { supabase } from "~/utils/supabase";
import type { UserType } from "~/utils/types";

type SearchUsersProps = {
  topic: string;
};

const SearchUsers = ({ topic }: SearchUsersProps) => {
  const { isMobile } = useMobileContext();

  // Infinite Scroll State
  const [users, setUsers] = useState<UserType[]>([]); // Array to accumulate users
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(0); // Current offset for fetching
  const [hasMore, setHasMore] = useState<boolean>(true); // Whether there's more data to load
  const [userCount, setUserCount] = useState<number | null>(null); // Total count of users

  const itemsPerLoad = isMobile ? 15 : 21; // Number of items to load per batch

  const scrollableContainerRef = useRef<HTMLDivElement>(null); // Ref for the scrollable container

  // useCallback to memoize fetchUsers to prevent re-creation
  const fetchUsers = useCallback(
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
        setUsers([]);
        setOffset(0);
        setHasMore(true);
        setUserCount(null);
      } else {
        setLoadingMore(true);
      }

      try {
        let query = supabase
          .from("profiles")
          .select("*", { count: "exact" })
          .neq("name", "") // Ensure name is not empty
          .order("name", { ascending: true }); // Order by name

        // Apply topic filter if it exists
        if (currentTopic) {
          query = query.ilike("name", `%${currentTopic}%`);
        }

        const rangeEnd = currentOffset + itemsPerLoad - 1;
        query = query.range(currentOffset, rangeEnd);

        const { data, count, error } = await query;

        if (error) {
          console.error("Error fetching users:", error);
          setHasMore(false);
          setUserCount(0);
          return;
        }

        if (data) {
          setUsers((prevUsers) => (append ? [...prevUsers, ...data] : data));
          const newOffset = currentOffset + data.length;
          setOffset(newOffset);

          if (count !== null) {
            setUserCount(count);
            setHasMore(newOffset < count); // More data if newOffset is less than total count
          } else {
            // If count is null, assume no more data if fetched less than itemsPerLoad
            setHasMore(data.length === itemsPerLoad); // If count not available, check if we filled the batch
            setUserCount(0);
          }

          // Fallback check: if we got less data than requested, there's no more
          if (data.length < itemsPerLoad) {
            setHasMore(false);
          }
        } else {
          setHasMore(false);
          setUserCount(0);
        }
      } catch (error) {
        console.error("Unexpected error in fetchUsers:", error);
        setHasMore(false);
        setUserCount(0);
      } finally {
        if (!append) {
          setLoadingInitial(false);
        } else {
          setLoadingMore(false);
        }
      }
    },
    [itemsPerLoad], // Dependencies for useCallback
  );

  // Debounce the fetchUsers function
  const debouncedFetchUsers = useDebounce(fetchUsers, 300);

  // Effect to trigger initial fetch or reset when 'topic' changes
  useEffect(() => {
    // Reset Infinite Scroll state and trigger initial fetch for new topic
    setLoadingInitial(true); // Indicate initial loading
    setUsers([]); // Clear previous results
    setOffset(0); // Reset offset
    setHasMore(true); // Assume more data initially
    setUserCount(null); // Reset count

    // Call the debounced fetcher with initial parameters
    debouncedFetchUsers(0, false, topic);
  }, [topic, debouncedFetchUsers]); // Depend on topic and the memoized debounced function

  // Function to load more users for InfiniteScroll
  const loadMoreUsers = () => {
    if (!loadingMore && hasMore && !loadingInitial) {
      // Ensure we're not already loading or doing initial load
      void debouncedFetchUsers(offset, true, topic);
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
      id="search-users-scrollable-container" // ID for InfiniteScroll scrollableTarget
      ref={scrollableContainerRef}
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%", // Use 100% width instead of 4/5 from Tailwind, adjust if needed
        height: "100vh", // Or a specific max-height if this component is part of a larger layout
        maxHeight: "calc(100vh - 200px)", // Adjust as needed to fit your header/footer
        overflowY: "auto", // Enable scrolling
        boxSizing: "border-box", // Include padding in width/height
        pr: { xs: 0, sm: "8px" }, // Padding right for scrollbar on desktop
        pb: "40px", // Padding bottom to allow space for FAB
        alignItems: "center", // Center content horizontally if not full width
      }}
    >
      {/* Search results count display */}
      {userCount !== null && ( // Only show if count is available
        <Typography variant="body1" sx={{ fontWeight: "bold", mb: 2 }}>
          {userCount} results found
        </Typography>
      )}

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
      ) : users.length === 0 ? ( // Check users.length for empty
        <EmptyMessage message="users matching your criteria" />
      ) : (
        // Infinite Scroll Container
        <InfiniteScroll
          dataLength={users.length}
          next={loadMoreUsers}
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
            users.length > 0 &&
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
          scrollableTarget="search-users-scrollable-container" // Must match the ID of the scrollable Box
        >
          <Box
            sx={{
              display: "grid",
              width: "100%",
              gridTemplateColumns: {
                xs: "repeat(1, minmax(320px, 1fr))",
                sm: "repeat(2, minmax(280px, 1fr))",
                md: "repeat(3, minmax(280px, 1fr))",
              },
              gap: { xs: 2, md: 3 },
              justifyContent: "center",
            }}
          >
            {users.map((u) => (
              <User user={u} key={u.id} goToProfile={true} />
            ))}
          </Box>
        </InfiniteScroll>
      )}

      {/* Manual Load More Button (Optional, InfiniteScroll handles it automatically) */}
      {/* You can re-add this if you prefer a button over automatic loading */}
      {!loadingInitial && !loadingMore && hasMore && users.length > 0 && (
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
            onClick={loadMoreUsers}
            disabled={loadingMore}
          >
            Load More Users
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

export default SearchUsers;
