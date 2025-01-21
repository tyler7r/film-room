import SortIcon from "@mui/icons-material/Sort";
import UpdateIcon from "@mui/icons-material/Update";
import { Divider, IconButton, Pagination } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import type { YouTubePlayer } from "react-youtube";
import Play from "~/components/plays/play";
import StandardPopover from "~/components/utils/standard-popover";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import useDebounce from "~/utils/debounce";
import { getNumberOfPages, getToAndFrom } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { PlayPreviewType } from "~/utils/types";
import PlaySearchFilters from "../../search-filters/play-search-filters";
import PageTitle from "../../utils/page-title";
import Plays from "./plays";

type VideoPlayIndex = {
  player: YouTubePlayer | null;
  videoId: string;
  scrollToPlayer: () => void;
  setActivePlay: (play: PlayPreviewType) => void;
  activePlay: PlayPreviewType | null;
  setSeenActivePlay: (seenActivePlay: boolean) => void;
};

export type PlaySearchOptions = {
  author?: string | undefined;
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
}: VideoPlayIndex) => {
  const { affIds } = useAuthContext();
  const { isMobile } = useMobileContext();

  const [plays, setPlays] = useState<PlayPreviewType[] | null>(null);
  const [page, setPage] = useState<number>(1);
  const [playCount, setPlayCount] = useState<number | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false);

  const [searchOptions, setSearchOptions] = useState<PlaySearchOptions>({
    only_highlights: false,
    author: "",
    private_only: "all",
    topic: "",
    timestamp: null,
  });
  const itemsPerPage = isMobile ? 5 : 10;
  const topRef = useRef<HTMLDivElement | null>(null);
  const [anchorEl, setAnchorEl] = useState<{
    anchor1: HTMLElement | null;
    anchor2: HTMLElement | null;
  }>({
    anchor1: null,
    anchor2: null,
  });

  const handlePopoverOpen = (
    e: React.MouseEvent<HTMLElement>,
    target: "a" | "b",
  ) => {
    if (target === "a") {
      setAnchorEl({ ...anchorEl, anchor1: e.currentTarget });
    } else {
      setAnchorEl({ ...anchorEl, anchor2: e.currentTarget });
    }
  };

  const handlePopoverClose = () => {
    setAnchorEl({ anchor1: null, anchor2: null });
  };

  const open1 = Boolean(anchorEl.anchor1);
  const open2 = Boolean(anchorEl.anchor2);

  const fetchPlays = useDebounce(async () => {
    const { from, to } = getToAndFrom(itemsPerPage, page);
    const plays = supabase
      .from("play_preview")
      .select(`*`, {
        count: "exact",
      })
      .order("play->>start_time_sort")
      .eq("video->>id", videoId)
      .range(from, to);
    if (searchOptions.only_highlights) {
      void plays.eq("play->>highlight", true);
    }
    if (searchOptions?.author && searchOptions.author !== "") {
      void plays.ilike("author->>name", `%${searchOptions.author}%`);
    }
    if (activePlay) {
      void plays.neq("play->>id", activePlay.play.id);
    }
    if (searchOptions.timestamp) {
      void plays.gte("play->>end_time_sort", searchOptions.timestamp);
    }
    if (affIds && affIds.length > 0) {
      if (searchOptions.private_only === "all") {
        void plays.or(
          `play->>private.eq.false, play->>exclusive_to.in.(${affIds})`,
        );
      } else if (
        searchOptions.private_only &&
        searchOptions.private_only !== "all"
      ) {
        void plays.eq("play->>exclusive_to", searchOptions.private_only);
      }
    } else {
      void plays.eq("play->>private", false);
    }
    const { data, count } = await plays;
    if (data)
      if (searchOptions.timestamp) {
        setPlays(
          data.filter(
            (p) =>
              p.play.end_time.toString().padStart(6, "0") >=
              searchOptions.timestamp!,
          ),
        );
      } else
        setPlays(data.sort((a, b) => a.play.start_time - b.play.start_time));
    if (count) setPlayCount(count);
  });

  const fetchPlaysBySearch = useDebounce(async () => {
    const { from, to } = getToAndFrom(itemsPerPage, page);
    if (searchOptions.topic && searchOptions.topic !== "") {
      const playsByMention = supabase
        .from("plays_via_user_mention")
        .select("*")
        .eq("video->>id", videoId)
        .order("play->>start_time_sort")
        .ilike("mention->>receiver_name", `%${searchOptions.topic}%`)
        .range(from, to);
      const playsByTag = supabase
        .from("plays_via_tag")
        .select("*")
        .eq("video->>id", videoId)
        .order("play->>start_time_sort")
        .ilike("tag->>title", `%${searchOptions.topic}%`)
        .range(from, to);
      if (searchOptions.only_highlights) {
        void playsByMention.eq("play->>highlight", true);
        void playsByTag.eq("play->>highlight", true);
      }
      if (activePlay) {
        void playsByMention.neq("play->>id", activePlay.play.id);
        void playsByTag.neq("play->>id", activePlay.play.id);
      }
      if (searchOptions.timestamp) {
        void playsByMention.gte(
          "play->>end_time_sort",
          searchOptions.timestamp,
        );
        void playsByTag.gte("play->>end_time_sort", searchOptions.timestamp);
      }
      if (searchOptions.author) {
        void playsByMention.ilike("author->>name", searchOptions.author);
        void playsByTag.ilike("author->>name", searchOptions.author);
      }
      if (affIds && affIds.length > 0) {
        if (searchOptions.private_only === "all") {
          void playsByMention.or(
            `play->>private.eq.false, play->>exclusive_to.in.(${affIds})`,
          );
          void playsByTag.or(
            `play->>private.eq.false, play->>exclusive_to.in.(${affIds})`,
          );
        } else if (
          searchOptions.private_only &&
          searchOptions.private_only !== "all"
        ) {
          void playsByMention.eq(
            "play->>exclusive_to",
            searchOptions.private_only,
          );
          void playsByTag.eq("play->>exclusive_to", searchOptions.private_only);
        }
      } else {
        void playsByMention.eq("play->>private", false);
        void playsByTag.eq("play->>private", false);
      }
      const getTags = await playsByTag;
      const getMentions = await playsByMention;
      let ps: PlayPreviewType[] | null = null;
      if (getTags.data) {
        ps = getTags.data;
      }
      if (getMentions.data) {
        ps = ps ? [...ps, ...getMentions.data] : getMentions.data;
      }
      const uniquePlays = [...new Map(ps?.map((x) => [x.play.id, x])).values()];
      setPlays(ps ? uniquePlays : null);
      setPlayCount(uniquePlays.length > 0 ? uniquePlays.length : null);
    }
  });

  const scrollToTop = () => {
    if (topRef) topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePageChange = (e: React.ChangeEvent<unknown>, value: number) => {
    e.preventDefault();
    setPage(value);
    scrollToTop();
  };

  const getCurrentTime = async (player: YouTubePlayer) => {
    return Math.round(await player.getCurrentTime()) - 1;
  };

  const setTimestamp = async () => {
    if (searchOptions.timestamp) {
      setSearchOptions({ ...searchOptions, timestamp: null });
      return;
    }
    if (player && !searchOptions.timestamp) {
      void getCurrentTime(player).then((currentTime) => {
        const paddedCurrentTime = currentTime.toString().padStart(6, "0");
        setSearchOptions({
          ...searchOptions,
          timestamp: paddedCurrentTime,
        });
      });
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel("play_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "plays" },
        () => {
          void fetchPlays();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "play_tags" },
        () => {
          void fetchPlays();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "play_mentions" },
        () => {
          void fetchPlays();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (page === 1 && searchOptions.topic !== "") {
      void fetchPlaysBySearch();
    } else if (page === 1 && searchOptions.topic === "") void fetchPlays();
    else setPage(1);
  }, [searchOptions, isMobile]);

  useEffect(() => {
    if (searchOptions.topic !== "") void fetchPlaysBySearch();
    else void fetchPlays();
  }, [videoId, page, activePlay]);

  return (
    <div className="flex w-full flex-col items-center">
      {activePlay && (
        <div className="flex w-11/12 flex-col items-center justify-center gap-2">
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
          />
          <Divider sx={{ marginTop: "16px", marginBottom: "16px" }} flexItem />
        </div>
      )}
      <div
        ref={topRef}
        className="flex w-full flex-col items-center justify-center gap-4"
      >
        <div className="flex items-center justify-center gap-2 text-lg font-bold">
          <PageTitle
            title={`${
              playCount
                ? playCount > 1
                  ? `${playCount} Plays`
                  : `${playCount} Play`
                : "0 Plays"
            }`}
            size="x-small"
          />
          <IconButton
            size="small"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            onMouseEnter={(e) => handlePopoverOpen(e, "a")}
            onMouseLeave={handlePopoverClose}
          >
            <SortIcon />
          </IconButton>
          <StandardPopover
            open={open1}
            anchorEl={anchorEl.anchor1}
            handlePopoverClose={handlePopoverClose}
            content="Open Filters"
          />
          <IconButton
            size="small"
            onClick={setTimestamp}
            onMouseEnter={(e) => handlePopoverOpen(e, "b")}
            onMouseLeave={handlePopoverClose}
          >
            <UpdateIcon
              color={!searchOptions.timestamp ? "action" : "primary"}
            />
          </IconButton>
          <StandardPopover
            open={open2}
            anchorEl={anchorEl.anchor2}
            handlePopoverClose={handlePopoverClose}
            content={`${
              !searchOptions.timestamp
                ? "Plays found at this timestamp or later"
                : "All plays"
            }`}
          />
        </div>
        {isFiltersOpen && (
          <PlaySearchFilters
            searchOptions={searchOptions}
            setSearchOptions={setSearchOptions}
          />
        )}
        <Plays
          scrollToPlayer={scrollToPlayer}
          player={player}
          plays={plays}
          setActivePlay={setActivePlay}
          setSearchOptions={setSearchOptions}
          searchOptions={searchOptions}
          setSeenActivePlay={setSeenActivePlay}
          setIsFiltersOpen={setIsFiltersOpen}
        />
        {playCount && (
          <Pagination
            siblingCount={1}
            boundaryCount={0}
            size={isMobile ? "small" : "medium"}
            showFirstButton
            showLastButton
            sx={{ marginTop: "16px" }}
            variant="text"
            shape="rounded"
            count={getNumberOfPages(itemsPerPage, playCount)}
            page={page}
            onChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default VideoPlayIndex;
