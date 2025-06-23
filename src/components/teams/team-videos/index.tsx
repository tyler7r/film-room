import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Fab,
  FormControlLabel,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import EmptyMessage from "~/components/utils/empty-msg";
import PageTitle from "~/components/utils/page-title";
import Video from "~/components/videos/video";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import useDebounce from "~/utils/debounce";
import { supabase } from "~/utils/supabase";
import type { TeamVideoType } from "~/utils/types";

type TeamVideosProps = {
  teamId: string;
};

const TeamVideos = ({ teamId }: TeamVideosProps) => {
  const { isMobile } = useMobileContext();
  const { affIds } = useAuthContext();

  const itemsPerLoad = isMobile ? 10 : 20;

  const [videos, setVideos] = useState<TeamVideoType[]>([]);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalVideoCount, setTotalVideoCount] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterCoachVideos, setFilterCoachVideos] = useState<boolean>(false);
  const [showFilterBox, setShowFilterBox] = useState<boolean>(false);
  const scrollableContainerRef = useRef<HTMLDivElement>(null);

  const handleToggleFilterBox = () => {
    setShowFilterBox((prev) => !prev);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const fetchVideos = useCallback(
    async (
      currentOffset: number,
      append: boolean,
      currentSearchTerm: string,
      currentFilterCoachVideos: boolean,
    ) => {
      if (!supabase) {
        console.warn("Supabase client is not initialized.");
        if (!append) {
          setLoadingInitial(false);
        }
        setHasMore(false);
        return;
      }

      if (!append) {
        setLoadingInitial(true);
        setVideos([]);
        setOffset(0); // Ensure offset is reset to 0 for a new search/filter
        setHasMore(true);
        setTotalVideoCount(null);
      } else {
        setLoadingMore(true);
      }

      try {
        let videosQuery = supabase
          .from("team_video_view")
          .select("*", { count: "exact" })
          .eq("team->>id", teamId)
          .order("video->>uploaded_at", { ascending: false });

        if (currentSearchTerm) {
          videosQuery = videosQuery.ilike(
            "video->>title",
            `%${currentSearchTerm}%`,
          );
        }

        if (currentFilterCoachVideos) {
          videosQuery = videosQuery.eq("video->>coach_video", true);
        }

        if (affIds && affIds.length > 0) {
          videosQuery = videosQuery.or(
            `video->>private.eq.false, video->>exclusive_to.in.(${affIds.join(
              ",",
            )})`,
          );
        } else {
          videosQuery = videosQuery.eq("video->>private", false);
        }

        // Calculate the end range correctly
        const rangeEnd = currentOffset + itemsPerLoad - 1;

        videosQuery = videosQuery.range(currentOffset, rangeEnd);

        const { data, count, error } = await videosQuery;

        if (error) {
          console.error("Error fetching team videos:", error);
          // If the error is a range error, specifically handle it as no more data
          if (error.code === "PGRST103") {
            setHasMore(false);
            // Don't reset totalVideoCount if it's just a range error at the end
          } else {
            setHasMore(false);
            setTotalVideoCount(0); // General error, set count to 0
          }
          return;
        }

        if (data) {
          setVideos((prevVideos) => (append ? [...prevVideos, ...data] : data));
          const newOffset = currentOffset + data.length; // Calculate new offset based on actual data length
          setOffset(newOffset);

          // Determine if there's more data based on total count and new offset
          if (count !== null) {
            setTotalVideoCount(count);
            // hasMore is true if the new offset is less than the total count
            setHasMore(newOffset < count);
          } else {
            // If count is null, assume no more data or an issue
            setHasMore(false);
            setTotalVideoCount(data.length); // Fallback: total is currently loaded data
          }

          // Also, if the data length is less than itemsPerLoad, it means we got all remaining items
          if (data.length < itemsPerLoad) {
            setHasMore(false);
          }
        } else {
          setHasMore(false);
          setTotalVideoCount(0);
        }
      } catch (error) {
        console.error("Unexpected error in fetchVideos:", error);
        setHasMore(false);
        setTotalVideoCount(0);
      } finally {
        if (!append) {
          setLoadingInitial(false);
        } else {
          setLoadingMore(false);
        }
      }
    },
    [itemsPerLoad, teamId, affIds],
  );

  useEffect(() => {
    void fetchVideos(0, false, searchTerm, filterCoachVideos);
  }, [affIds, fetchVideos]);

  const debouncedFetchVideos = useDebounce(fetchVideos, 300);

  useEffect(() => {
    debouncedFetchVideos(0, false, searchTerm, filterCoachVideos);
  }, [searchTerm, filterCoachVideos, debouncedFetchVideos]);

  const loadMoreVideos = () => {
    // Only attempt to load more if we are not already loading and there's potentially more data
    if (!loadingMore && hasMore) {
      void fetchVideos(offset, true, searchTerm, filterCoachVideos);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterCoachVideosChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setFilterCoachVideos(event.target.checked);
  };

  const scrollToTop = () => {
    if (scrollableContainerRef.current) {
      scrollableContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <Box
      id="team-videos-scrollable-container"
      ref={scrollableContainerRef}
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        // Critical for desktop scrolling: ensure this container takes a defined height and scrolls
        height: "100vh", // Or 'calc(100vh - Xpx)' if you have fixed headers/footers
        maxHeight: "100vh", // Ensures it doesn't grow beyond viewport
        overflowY: "auto", // Enables vertical scrolling for this Box
        boxSizing: "border-box", // Include padding in height calculation
        pr: { xs: 0, sm: "8px" },
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
          title={`Team Film (${totalVideoCount ?? 0})`}
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
            label="Search Videos"
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
          <FormControlLabel
            control={
              <Checkbox
                checked={filterCoachVideos}
                onChange={handleFilterCoachVideosChange}
                color="primary"
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                Only Coach Uploaded Videos
              </Typography>
            }
            labelPlacement="end"
            sx={{
              justifyContent: "center",
              ml: 0,
              mr: 0,
              width: "100%",
            }}
          />
        </Box>
      )}

      {/* Video List or Loading/Empty State */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          flexWrap: "wrap",
          flexGrow: 1,
        }}
      >
        {loadingInitial ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "150px",
              width: "100%",
              flexGrow: 1,
            }}
          >
            <CircularProgress size={40} />
          </Box>
        ) : !videos || videos.length === 0 ? (
          <EmptyMessage message="team videos matching your criteria" />
        ) : (
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
                    textAlign: "center",
                    color: "text.disabled",
                    my: 2,
                  }}
                >
                  — End of videos —
                </Typography>
              )
            }
            scrollableTarget="team-videos-scrollable-container"
          >
            <Box
              sx={{
                display: "grid",
                width: "100%",
                gridTemplateColumns: {
                  xs: "repeat(1, minmax(370px, 1fr))",
                  sm: "repeat(2, minmax(280px, 1fr))",
                  md: "repeat(3, minmax(280px, 1fr))",
                },
                gap: { xs: 2, md: 3 },
                justifyContent: "center",
              }}
            >
              {videos.map((video) => (
                <Video video={video.video} key={video.video.id} />
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
              Load More Film
            </Button>
          </Box>
        )}
      </Box>
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

export default TeamVideos;
