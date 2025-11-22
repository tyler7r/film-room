import ClearIcon from "@mui/icons-material/Clear";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Card,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import Collection from "~/components/collections/collection";
import EmptyMessage from "~/components/utils/empty-msg";
import PageTitle from "~/components/utils/page-title";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import useDebounce from "~/utils/debounce";
import { supabase } from "~/utils/supabase";
import type { CollectionViewType } from "~/utils/types";

type ProfileCollectionsProps = {
  profileId: string;
};

const ProfileCollections = ({ profileId }: ProfileCollectionsProps) => {
  const { affIds } = useAuthContext();
  const { isDark } = useIsDarkContext();
  const theme = useTheme();

  const [collections, setCollections] = useState<CollectionViewType[]>([]); // Initialize as empty array
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true); // State for initial/new search loading
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
  const [showScrollDownIndicator, setShowScrollDownIndicator] = useState(false);

  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const itemsPerPage = !isDesktop ? 8 : 10;

  const checkScrollPosition = useCallback(() => {
    if (scrollableContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        scrollableContainerRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50;
      const isScrollable = scrollHeight > clientHeight;
      const isAtTop = scrollTop === 0;

      setShowScrollDownIndicator(isScrollable && !isAtBottom && isAtTop);
    }
  }, [hasMore]);

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

  const fetchCollections = useCallback(
    async (offsetToFetch: number, append = true, currentSearchTerm: string) => {
      if (!profileId) {
        if (!append) {
          setLoadingInitial(false);
        }
        setHasMore(false);
        return;
      }
      if (!append) {
        setLoadingInitial(true);
        setCollections([]);
        setOffset(0);
        setHasMore(true);
      }

      try {
        let collectionsData = supabase
          .from("collection_view")
          .select("*", { count: "exact" })
          .eq("collection->>author_id", profileId)
          .order("collection->>created_at", { ascending: false })
          .range(offsetToFetch, offsetToFetch + itemsPerPage - 1);

        if (affIds && affIds.length > 0) {
          void collectionsData.or(
            `collection->>private.eq.false, collection->>exclusive_to.in.(${affIds.join(
              ",",
            )})`,
          );
        } else {
          void collectionsData.eq("collection->>private", false);
        }

        if (currentSearchTerm) {
          collectionsData = collectionsData.ilike(
            "collection->>title",
            `%${currentSearchTerm}%`,
          );
        }

        const { data, count, error } = await collectionsData;

        if (error) {
          console.error("Error fetching collections:", error);
          setHasMore(false);
          return;
        }

        if (data) {
          setCollections((prev) => {
            const newCollections = append ? [...prev, ...data] : data;
            return newCollections;
          });
          setOffset(offsetToFetch + data.length);
          setHasMore(data.length === itemsPerPage);
        } else {
          setHasMore(false);
        }
        if (count) {
          setTotalCollectionCount(count);
        } else setTotalCollectionCount(0);
      } catch (error) {
        console.error("Unexpected error in fetchCollections: ", error);
        setHasMore(false);
      } finally {
        setLoadingInitial(false);
      }
    },
    [profileId, itemsPerPage],
  );

  const debouncedFetchCollections = useDebounce(fetchCollections, 300);

  // --- useEffect hooks for data fetching ---

  // Effect to trigger initial data fetch when component mounts or teamId changes
  useEffect(() => {
    void fetchCollections(0, false, searchTerm);
  }, [profileId, fetchCollections]); // 'fetchCollections' is a dependency because it's a useCallback

  // Effect to trigger a new fetch when the search term changes (debounced)
  useEffect(() => {
    debouncedFetchCollections(0, false, searchTerm);
  }, [searchTerm, debouncedFetchCollections]);

  // Function called by InfiniteScroll to load more data
  const loadMoreCollections = () => {
    // Only load more if not already loading and there's potentially more data
    if (hasMore) {
      void fetchCollections(offset, true, searchTerm);
    }
  };

  useEffect(() => {
    const currentRef = scrollableContainerRef.current;
    if (currentRef) {
      currentRef.addEventListener("scroll", checkScrollPosition);
    }

    setTimeout(() => {
      checkScrollPosition();
    }, 150);

    return () => {
      if (currentRef) {
        currentRef.removeEventListener("scroll", checkScrollPosition);
      }
    };
  }, [checkScrollPosition, collections.length, hasMore]);

  return (
    <Card
      elevation={4}
      sx={{
        display: "flex",
        width: "100%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        // gap: 1,
        p: 1,
        position: "relative",
      }}
    >
      <Box
        sx={{
          display: "flex",
          width: "100%",
          gap: 1,
          justifyContent: "center",
          alignItems: "center",
          mb: 1,
        }}
      >
        <PageTitle size="small" title={`User Collections`} />
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          ({totalCollectionCount})
        </Typography>
        <IconButton
          onClick={handleToggleFilterBox}
          size="small"
          aria-label="toggle filter menu"
        >
          <FilterListIcon color={showFilterBox ? "primary" : "inherit"} />
        </IconButton>
      </Box>

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
            mx: "auto",
            mb: 2,
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

      <Box
        id="collectionsScrollableContainer"
        ref={scrollableContainerRef}
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          maxHeight: { xs: "400px", md: "600px" },
          p: 0.5,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          width: "100%",
        }}
      >
        {loadingInitial && collections.length === 0 ? (
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
          <InfiniteScroll
            dataLength={collections.length}
            next={loadMoreCollections}
            hasMore={hasMore}
            loader={
              <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                <CircularProgress />
              </Box>
            }
            endMessage={
              collections.length > 0 &&
              !loadingInitial && (
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    color: "text.disabled",
                    textAlign: "center",
                    my: 1,
                    mx: 1,
                  }}
                >
                  — End of Collections —
                </Typography>
              )
            }
            scrollableTarget="collectionsScrollableContainer"
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
              {collections.map((collection) => (
                <Collection
                  key={collection.collection.id}
                  collection={collection}
                  small={true}
                />
              ))}
            </Box>
          </InfiniteScroll>
        )}

        {collections.length === 0 && !loadingInitial && (
          <Box
            sx={{
              display: "flex",
              width: "100%",
              justifyContent: "center",
            }}
          >
            <EmptyMessage message="collections" />
          </Box>
        )}

        {showScrollDownIndicator && (
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              zIndex: 1,
              background: !isDark ? "black" : "white",
              py: 1,
              pointerEvents: "none",
              transition: "opacity 0.3s ease-in-out",
              opacity: 1,
            }}
          >
            <Typography
              sx={{
                pointerEvents: "auto",
                fontWeight: "bold",
                fontSize: "12px",
              }}
              variant="button"
              color={!isDark ? "white" : "black"}
            >
              Scroll for more
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default ProfileCollections;
