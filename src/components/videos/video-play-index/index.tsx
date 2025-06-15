import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import SortIcon from "@mui/icons-material/Sort";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import type { YouTubePlayer } from "react-youtube";
import Play from "~/components/plays/play";
import StandardPopover from "~/components/utils/standard-popover";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import useDebounce from "~/utils/debounce"; // Assuming useDebounce is correctly implemented
import { convertYouTubeTimestamp } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { Database, PlayPreviewType } from "~/utils/types"; // Import PlayPreviewType and Database type
import PlaySearchFilters from "../../search-filters/play-search-filters";
import PageTitle from "../../utils/page-title";

type VideoPlayIndexProps = {
  player: YouTubePlayer | null;
  videoId: string;
  scrollToPlayer: () => void;
  setActivePlay: (play: PlayPreviewType) => void;
  activePlay: PlayPreviewType | null;
  setSeenActivePlay: (seenActivePlay: boolean) => void;
};

export type PlaySearchOptions = {
  author?: string;
  only_highlights?: boolean;
  topic: string;
  private_only?: string;
  timestamp: string | null;
};

const VideoPlayIndex = ({
  player,
  videoId,
  scrollToPlayer,
  setActivePlay,
  activePlay,
  setSeenActivePlay,
}: VideoPlayIndexProps) => {
  const { affIds } = useAuthContext();
  const { isMobile } = useMobileContext();

  const [plays, setPlays] = useState<PlayPreviewType[]>([]);
  const [playCount, setPlayCount] = useState<number | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false);

  const [hasMore, setHasMore] = useState<boolean>(true);
  const [currentOffset, setCurrentOffset] = useState<number>(0);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);

  const itemsPerLoad = isMobile ? 5 : 10;

  const [searchOptions, setSearchOptions] = useState<PlaySearchOptions>({
    only_highlights: false,
    author: "",
    private_only: "all",
    topic: "",
    timestamp: null,
  });

  const topRef = useRef<HTMLDivElement | null>(null);

  const fetchPlays = useCallback(
    async (offset: number, append = true) => {
      setLoadingInitial(!append);

      try {
        let combinedPlays: PlayPreviewType[] = [];
        let totalCount: number | null = 0;

        if (searchOptions.topic && searchOptions.topic !== "") {
          // --- Fetch by mention and tag (topic search) ---
          let playsByMentionQuery = supabase
            .from("plays_via_user_mention")
            .select<
              string,
              Database["public"]["Views"]["plays_via_user_mention"]["Row"]
            >("*", { count: "exact" })
            .eq("video->>id", videoId)
            .order("play->>start_time_sort")
            .ilike("mention->>receiver_name", `%${searchOptions.topic}%`);

          let playsByTagQuery = supabase
            .from("plays_via_tag")
            .select<
              string,
              Database["public"]["Views"]["plays_via_tag"]["Row"]
            >("*", { count: "exact" })
            .eq("video->>id", videoId)
            .order("play->>start_time_sort")
            .ilike("tag->>title", `%${searchOptions.topic}%`);

          if (searchOptions.only_highlights) {
            playsByMentionQuery = playsByMentionQuery.eq(
              "play->>highlight",
              true,
            );
            playsByTagQuery = playsByTagQuery.eq("play->>highlight", true);
          }
          if (searchOptions.author && searchOptions.author !== "") {
            playsByMentionQuery = playsByMentionQuery.ilike(
              "author->>name",
              `%${searchOptions.author}%`,
            );
            playsByTagQuery = playsByTagQuery.ilike(
              "author->>name",
              `%${searchOptions.author}%`,
            );
          }
          if (activePlay) {
            playsByMentionQuery = playsByMentionQuery.neq(
              "play->>id",
              activePlay.play.id,
            );
            playsByTagQuery = playsByTagQuery.neq(
              "play->>id",
              activePlay.play.id,
            );
          }
          if (searchOptions.timestamp) {
            playsByMentionQuery = playsByMentionQuery.gte(
              "play->>end_time_sort",
              searchOptions.timestamp,
            );
            playsByTagQuery = playsByTagQuery.gte(
              "play->>end_time_sort",
              searchOptions.timestamp,
            );
          }
          if (affIds && affIds.length > 0) {
            if (searchOptions.private_only === "all") {
              playsByMentionQuery = playsByMentionQuery.or(
                `play->>private.eq.false, play->>exclusive_to.in.(${affIds})`,
              );
              playsByTagQuery = playsByTagQuery.or(
                `play->>private.eq.false, play->>exclusive_to.in.(${affIds})`,
              );
            } else if (
              searchOptions.private_only &&
              searchOptions.private_only !== "all"
            ) {
              playsByMentionQuery = playsByMentionQuery.eq(
                "play->>exclusive_to",
                searchOptions.private_only,
              );
              playsByTagQuery = playsByTagQuery.eq(
                "play->>exclusive_to",
                searchOptions.private_only,
              );
            }
          } else {
            playsByMentionQuery = playsByMentionQuery.eq(
              "play->>private",
              false,
            );
            playsByTagQuery = playsByTagQuery.eq("play->>private", false);
          }

          const [getMentions, getTags] = await Promise.all([
            playsByMentionQuery.range(offset, offset + itemsPerLoad - 1),
            playsByTagQuery.range(offset, offset + itemsPerLoad - 1),
          ]);

          if (getTags.data) {
            combinedPlays = [
              ...combinedPlays,
              ...getTags.data.map((row) => ({
                play: row.play,
                video: row.video,
                team: row.team,
                author: row.author,
              })),
            ];
            // totalCount += getTags.count ?? 0;
          }
          if (getMentions.data) {
            combinedPlays = [
              ...combinedPlays,
              ...getMentions.data.map((row) => ({
                play: row.play,
                video: row.video,
                team: row.team,
                author: row.author,
              })),
            ];
            // totalCount += getMentions.count ?? 0;
          }

          const uniquePlays = [
            ...new Map(combinedPlays.map((x) => [x.play.id, x])).values(),
          ];
          uniquePlays.sort((a, b) => a.play.start_time - b.play.start_time);
          combinedPlays = uniquePlays;

          totalCount = combinedPlays.length ?? 0;
        } else {
          // --- General fetch (no topic search) ---
          let query = supabase
            .from("play_preview")
            .select<string, Database["public"]["Views"]["play_preview"]["Row"]>(
              `*`,
              { count: "exact" },
            )
            .order("play->>start_time_sort")
            .eq("video->>id", videoId);

          if (searchOptions.only_highlights) {
            query = query.eq("play->>highlight", true);
          }
          if (searchOptions.author && searchOptions.author !== "") {
            query = query.ilike("author->>name", `%${searchOptions.author}%`);
          }
          if (activePlay) {
            query = query.neq("play->>id", activePlay.play.id);
          }
          if (searchOptions.timestamp) {
            query = query.gte("play->>end_time_sort", searchOptions.timestamp);
          }
          if (affIds && affIds.length > 0) {
            if (searchOptions.private_only === "all") {
              query = query.or(
                `play->>private.eq.false, play->>exclusive_to.in.(${affIds})`,
              );
            } else if (
              searchOptions.private_only &&
              searchOptions.private_only !== "all"
            ) {
              query = query.eq(
                "play->>exclusive_to",
                searchOptions.private_only,
              );
            }
          } else {
            query = query.eq("play->>private", false);
          }

          const { data, count } = await query.range(
            offset,
            offset + itemsPerLoad - 1,
          );

          if (data) {
            combinedPlays = data;
            totalCount = count;
          }
        }

        setPlays((prev: PlayPreviewType[]) =>
          append ? [...prev, ...combinedPlays] : combinedPlays,
        );
        setCurrentOffset(offset + combinedPlays.length);
        setHasMore(combinedPlays.length === itemsPerLoad);
        setPlayCount(totalCount);
      } catch (error) {
        console.error("Error fetching plays:", error);
        setHasMore(false);
        setPlays(append ? plays : []);
        setPlayCount(0);
      } finally {
        setLoadingInitial(false);
      }
    },
    [videoId, itemsPerLoad, searchOptions, activePlay, affIds, plays],
  );

  const debouncedFetchPlays = useDebounce(fetchPlays);

  useEffect(() => {
    setCurrentOffset(0);
    setHasMore(true);
    setPlays([]);
    setPlayCount(null);
    setLoadingInitial(true);

    debouncedFetchPlays(0, false);
  }, [searchOptions, isMobile, videoId, activePlay, debouncedFetchPlays]);

  const loadMorePlays = useCallback(() => {
    if (hasMore && !loadingInitial) {
      void fetchPlays(currentOffset, true);
    }
  }, [hasMore, currentOffset, loadingInitial, fetchPlays]);

  const getCurrentTime = useCallback(async (playerInstance: YouTubePlayer) => {
    return Math.round(await playerInstance.getCurrentTime()) - 1;
  }, []);

  const setTimestamp = useCallback(async () => {
    if (searchOptions.timestamp) {
      setSearchOptions((prev: PlaySearchOptions) => ({
        ...prev,
        timestamp: null,
      }));
      return;
    }
    if (player && !searchOptions.timestamp) {
      void getCurrentTime(player).then((currentTime) => {
        const paddedCurrentTime = currentTime.toString().padStart(6, "0");
        setSearchOptions((prev: PlaySearchOptions) => ({
          ...prev,
          timestamp: paddedCurrentTime,
        }));
      });
    }
  }, [searchOptions.timestamp, player, getCurrentTime, setSearchOptions]);

  useEffect(() => {
    const channel = supabase
      .channel("play_changes_video_index")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "plays",
          filter: `video_id=eq.${videoId}`,
        },
        () => {
          debouncedFetchPlays(0, false);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "play_tags",
          filter: `play_id->>video_id=eq.${videoId}`,
        },
        () => {
          debouncedFetchPlays(0, false);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "play_mentions",
          filter: `play_id->>video_id=eq.${videoId}`,
        },
        () => {
          debouncedFetchPlays(0, false);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [videoId, debouncedFetchPlays]);

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
                color={isFiltersOpen ? "primary" : "inherit"}
              >
                <SortIcon />
              </IconButton>
            }
          />
          {/* Updated Timestamp Filter Button */}
          <StandardPopover
            content={`${
              !searchOptions.timestamp
                ? "Show plays at current video time or later"
                : "Show all plays (clear timestamp filter)"
            }`}
          >
            <Button
              size="small"
              onClick={setTimestamp}
              aria-label="filter-by-timestamp"
              variant={searchOptions.timestamp ? "contained" : "outlined"}
              color={searchOptions.timestamp ? "primary" : "inherit"}
              sx={{
                fontWeight: "bold",
                gap: 0.5, // Space between icon and text
                minWidth: "auto", // Adjust minimum width if needed
                px: 1, // Padding horizontal
                py: 0.5, // Padding vertical
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: "bold", fontSize: "10px" }}
              >
                {!searchOptions.timestamp
                  ? "Timestamp Filter"
                  : `Plays > ${convertYouTubeTimestamp(
                      parseInt(searchOptions.timestamp),
                    )}`}
              </Typography>
              {searchOptions.timestamp ? (
                <ClearIcon fontSize="small" />
              ) : (
                <AddIcon fontSize="small" />
              )}
            </Button>
          </StandardPopover>
        </Box>
        {isFiltersOpen && (
          <PlaySearchFilters
            searchOptions={searchOptions}
            setSearchOptions={setSearchOptions}
          />
        )}
        {loadingInitial && plays.length === 0 ? (
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
          <Box sx={{ width: "100%" }}>
            <InfiniteScroll
              dataLength={plays.length}
              next={loadMorePlays}
              hasMore={hasMore}
              scrollThreshold={0.9}
              loader={
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    my: 2,
                    width: "100%",
                  }}
                >
                  <CircularProgress size={20} />
                </Box>
              }
              endMessage={
                plays.length > 0 &&
                !hasMore && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      color: "text.disabled",
                      my: 1,
                    }}
                  >
                    — End of Plays —
                  </Typography>
                )
              }
            >
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                {plays.map((play, index) => (
                  <Play
                    setActivePlay={setActivePlay}
                    key={play.play.id}
                    scrollToPlayer={scrollToPlayer}
                    play={play}
                    player={player}
                    setSearchOptions={setSearchOptions}
                    searchOptions={searchOptions}
                    setSeenActivePlay={setSeenActivePlay}
                    setIsFiltersOpen={setIsFiltersOpen}
                    index={index}
                  />
                ))}
              </Box>
            </InfiniteScroll>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default VideoPlayIndex;
