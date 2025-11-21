// import AddIcon from "@mui/icons-material/Add";
// import ClearIcon from "@mui/icons-material/Clear";
import FilterListIcon from "@mui/icons-material/FilterList";
import TimelapseIcon from "@mui/icons-material/Timelapse";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// InfiniteScroll is removed per requirement 1
import type { YouTubePlayer } from "react-youtube";
import Play from "~/components/plays/play";
import PlaySearchFilters2 from "~/components/search-filters/play-search-filters";
import StandardPopover from "~/components/utils/standard-popover";
import { useAuthContext } from "~/contexts/auth";
import useDebounce from "~/utils/debounce"; // Assuming useDebounce is correctly implemented
import { convertYouTubeTimestamp } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { UnifiedPlayIndexType } from "~/utils/types";
import PageTitle from "../../utils/page-title";

type VideoPlayIndexProps = {
  player: YouTubePlayer | null;
  videoId: string;
  scrollToPlayer: () => void;
  setActivePlay: (play: UnifiedPlayIndexType | null) => void;
  activePlay: UnifiedPlayIndexType | undefined | null;
  setSeenActivePlay: (seenActivePlay: boolean) => void;
  handlePlayDeleted: () => void;
};

export type PlaySearchOptions = {
  author?: string;
  only_highlights?: boolean;
  topic: string;
  private_only?: string;
  timestamp: string | null;
};

// Define the grace period after a play ends before it rolls off.
const ROLL_OFF_GRACE_SECONDS = 3;

const VideoPlayIndex = ({
  player,
  videoId,
  scrollToPlayer,
  setActivePlay,
  activePlay,
  setSeenActivePlay,
  handlePlayDeleted,
}: VideoPlayIndexProps) => {
  const { affIds } = useAuthContext();
  //   const { isMobile } = useMobileContext();

  // State to hold ALL fetched plays (no pagination)
  const [allPlays, setAllPlays] = useState<UnifiedPlayIndexType[]>([]);
  const [playCount, setPlayCount] = useState<number | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);

  // New state for auto-roll-off feature (Requirement 3)
  const [isAutoRollOffEnabled, setIsAutoRollOffEnabled] =
    useState<boolean>(true);
  const [currentVideoTime, setCurrentVideoTime] = useState<number>(0); // Requirement 2 tracking

  const [searchOptions, setSearchOptions] = useState<PlaySearchOptions>({
    only_highlights: false,
    author: "",
    private_only: "all",
    topic: "",
    timestamp: null,
  });

  const topRef = useRef<HTMLDivElement | null>(null);

  // Determine if any filter is manually active (Requirement 4)
  const isFilterActive = useMemo(() => {
    return (
      !!searchOptions.topic ||
      !!searchOptions.only_highlights ||
      !!searchOptions.timestamp ||
      (searchOptions.private_only && searchOptions.private_only !== "all")
    );
  }, [searchOptions]);

  // Modified fetchPlays: Always fetches ALL results that match the current search filters.
  const fetchPlays = useCallback(
    async (shouldClearPlays = true) => {
      setLoadingInitial(shouldClearPlays);

      try {
        let playsQuery = supabase
          .from("unified_play_index")
          .select("*", { count: "exact" }) // Fetch all columns, but still get the count
          .eq("video_id", videoId)
          .order("play_start_time_sort");

        if (searchOptions.topic) {
          playsQuery = playsQuery.ilike(
            "topic_searchable_text",
            `%${searchOptions.topic}%`,
          );
        }

        if (searchOptions.only_highlights) {
          playsQuery = playsQuery.eq("highlight", true);
        }

        // Manual Timestamp Filter applies regardless of auto-roll-off state (Requirement 4)
        if (searchOptions.timestamp) {
          playsQuery = playsQuery.gte(
            "play_end_time_sort",
            searchOptions.timestamp,
          );
        }

        if (affIds && affIds.length > 0) {
          if (searchOptions.private_only === "all") {
            playsQuery = playsQuery.or(
              `private.eq.false, exclusive_to.in.(${affIds})`,
            );
          } else if (
            searchOptions.private_only &&
            searchOptions.private_only !== "all"
          ) {
            playsQuery = playsQuery.eq(
              "exclusive_to",
              searchOptions.private_only,
            );
          }
        } else {
          // If no affiliations, only fetch public plays
          playsQuery = playsQuery.eq("private", false);
        }

        // Fetch ALL results matching the filters (removed range/limit)
        const { data, count } = await playsQuery;

        if (data) {
          setAllPlays(data); // Store ALL results
          setPlayCount(count ?? 0);
        } else {
          setAllPlays([]);
          setPlayCount(0);
        }
      } catch (error) {
        console.error("Error fetching plays:", error);
        setAllPlays([]);
        setPlayCount(0);
      } finally {
        setLoadingInitial(false);
      }
    },
    [videoId, searchOptions, affIds],
  );

  const debouncedFetchPlays = useDebounce(fetchPlays, 300);

  // Effect to trigger fetching of ALL plays whenever search options change
  useEffect(() => {
    setAllPlays([]);
    setPlayCount(null);
    setLoadingInitial(true);
    // Since we are fetching ALL, we don't need to pass offset, only clear state
    debouncedFetchPlays(true);
  }, [searchOptions, videoId, debouncedFetchPlays]);

  // Video Time Polling (Requirement 2)
  useEffect(() => {
    if (!player || !isAutoRollOffEnabled || isFilterActive) {
      setCurrentVideoTime(0);
      return;
    }

    const pollTime = async () => {
      if (!player) return;
      try {
        // FIX: Await both getCurrentTime() and getPlayerState()
        const currentTime = await player.getCurrentTime();
        // const playerState = await player.getPlayerState();

        if (typeof currentTime === "number") {
          setCurrentVideoTime(Math.round(currentTime));
        }
      } catch (e) {
        console.warn("Could not get current time or state from player:", e);
      }
    };

    const intervalId = setInterval(() => {
      void pollTime();
    }, 1000);

    // Cleanup function
    return () => clearInterval(intervalId);
  }, [player, isAutoRollOffEnabled, isFilterActive]);

  // Dynamic Play Filtering (Roll-Off/Roll-On logic)
  const displayedPlays = useMemo(() => {
    const currentVideoTimePadded = currentVideoTime.toString().padStart(6, "0");
    if (!isAutoRollOffEnabled || isFilterActive) {
      setPlayCount(allPlays.length);
      return allPlays;
    }

    const filteredPlays = allPlays.filter((play) => {
      // Show play if its end time + grace period is greater than or equal to the current video time.
      return (
        play.play_end_time_sort + ROLL_OFF_GRACE_SECONDS >=
          currentVideoTimePadded && play.play_id !== activePlay?.play_id
      );
    });
    setPlayCount(filteredPlays.length);
    return filteredPlays;
  }, [
    allPlays,
    currentVideoTime,
    isAutoRollOffEnabled,
    isFilterActive,
    activePlay,
  ]);

  // Toggle for auto-roll-off
  const toggleAutoRollOff = useCallback(() => {
    setIsAutoRollOffEnabled((prev) => !prev);
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {activePlay && (
        <Box
          sx={{
            display: "flex",
            width: "100%",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            mb: 2,
          }}
        >
          <PageTitle title="Active Play" size="x-small" />
          <Play
            scrollToPlayer={scrollToPlayer}
            play={activePlay}
            player={player}
            activePlay={activePlay}
            setActivePlay={setActivePlay}
            searchOptions={searchOptions}
            setSearchOptions={setSearchOptions}
            setSeenActivePlay={setSeenActivePlay}
            setIsFiltersOpen={setIsFiltersOpen}
            index={0}
            handlePlayDeleted={handlePlayDeleted}
          />
          <Divider sx={{ my: 2 }} flexItem />
        </Box>
      )}

      <Box
        ref={topRef}
        sx={{
          display: "flex",
          width: "100%",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            fontSize: "1.25rem",
            fontWeight: "bold",
            flexWrap: "wrap",
          }}
        >
          <PageTitle
            title={`${
              playCount !== null
                ? playCount > 1
                  ? `${playCount} Plays`
                  : `${playCount} Play`
                : "0 Plays"
            }`}
            size="x-small"
          />
          <StandardPopover
            content="Open Filters"
            children={
              <IconButton
                size="small"
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                aria-label="open-filters"
                sx={{ padding: 0 }}
                color={isFiltersOpen || isFilterActive ? "primary" : "inherit"}
              >
                <FilterListIcon />
              </IconButton>
            }
          />

          {/* Auto Roll-Off Toggle Button (Requirement 3) */}
          <StandardPopover
            content={
              isAutoRollOffEnabled
                ? `Auto-Roll-Off is ON. Plays roll off ${ROLL_OFF_GRACE_SECONDS}s after they end. Click to disable.`
                : "Auto-Roll-Off is OFF. Click to enable."
            }
          >
            <Button
              size="small"
              onClick={toggleAutoRollOff}
              aria-label="toggle-auto-roll-off"
              variant={
                isAutoRollOffEnabled && !isFilterActive
                  ? "contained"
                  : "outlined"
              }
              color={
                "secondary"
                // isAutoRollOffEnabled && !isFilterActive
                //   ? "secondary"
                //   : "inherit"
              }
              sx={{
                fontWeight: "bold",
                gap: 0.5,
                minWidth: "auto",
                px: 1,
                py: 0.5,
                borderColor: isFilterActive ? "red" : undefined, // Visual cue if disabled by filter
                "&:hover": {
                  borderColor: isFilterActive ? "red" : undefined,
                },
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: "bold", fontSize: "10px" }}
              >
                {isAutoRollOffEnabled ? "Auto-Index: ON" : "Auto-Index: OFF"}
                {isFilterActive && " (Filter Active)"}
              </Typography>
              <TimelapseIcon fontSize="small" />
            </Button>
          </StandardPopover>
          {/* Manual Timestamp Filter Button (preserved) */}
        </Box>

        {isFiltersOpen && (
          <PlaySearchFilters2
            searchOptions={searchOptions}
            setSearchOptions={setSearchOptions}
          />
        )}

        {loadingInitial ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "200px",
              width: "100%",
            }}
          >
            <CircularProgress size={60} />
          </Box>
        ) : (
          // Display the dynamically filtered plays (displayedPlays)
          <Box sx={{ width: "100%" }}>
            {displayedPlays.length === 0 &&
            allPlays.length > 0 &&
            isAutoRollOffEnabled &&
            !isFilterActive ? (
              <Typography
                variant="caption"
                color="text.disabled"
                sx={{ display: "block", textAlign: "center", mt: 2 }}
              >
                All plays have rolled off (Current Time:{" "}
                {convertYouTubeTimestamp(currentVideoTime)}).
              </Typography>
            ) : displayedPlays.length === 0 && allPlays.length === 0 ? (
              <Typography
                variant="caption"
                color="text.disabled"
                sx={{ display: "block", textAlign: "center", mt: 2 }}
              >
                No plays found matching the current criteria.
              </Typography>
            ) : (
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                {displayedPlays.map((play, index) => (
                  <Play
                    setActivePlay={setActivePlay}
                    key={play.play_id}
                    scrollToPlayer={scrollToPlayer}
                    play={play}
                    player={player}
                    setSearchOptions={setSearchOptions}
                    searchOptions={searchOptions}
                    setSeenActivePlay={setSeenActivePlay}
                    setIsFiltersOpen={setIsFiltersOpen}
                    index={index}
                    handlePlayDeleted={handlePlayDeleted}
                    activePlay={activePlay}
                  />
                ))}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default VideoPlayIndex;
