import { Divider, Pagination } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import type { YouTubePlayer } from "react-youtube";
import Play from "~/components/plays/play";
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

  const [searchOptions, setSearchOptions] = useState<PlaySearchOptions>({
    only_highlights: false,
    author: "",
    private_only: "all",
    topic: "",
    timestamp: null,
  });
  const itemsPerPage = isMobile ? 5 : 10;
  const topRef = useRef<HTMLDivElement | null>(null);

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
        // if (searchOptions.timestamp) {
        //   ps = getTags.data.filter(
        //     (p) =>
        //       p.play.end_time.toString().padStart(6, "0") >=
        //       searchOptions.timestamp!,
        //   );
        // } else {
        //   ps = getTags.data;
        // }
        ps = getTags.data;
      }
      if (getMentions.data) {
        // if (searchOptions.timestamp) {
        //   const ms = getMentions.data.filter(
        //     (p) =>
        //       p.play.end_time.toString().padStart(6, "0") >=
        //       searchOptions.timestamp!,
        //   );
        //   ps = ps ? [...ps, ...ms] : ms;
        // } else ps = ps ? [...ps, ...getMentions.data] : getMentions.data;
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
          />
          <Divider sx={{ marginTop: "16px", marginBottom: "16px" }} flexItem />
        </div>
      )}
      <div
        ref={topRef}
        className="flex w-full flex-col items-center justify-center gap-4"
      >
        <PlaySearchFilters
          searchOptions={searchOptions}
          setSearchOptions={setSearchOptions}
          player={player}
        />
        <Plays
          scrollToPlayer={scrollToPlayer}
          player={player}
          plays={plays}
          setActivePlay={setActivePlay}
          setSearchOptions={setSearchOptions}
          searchOptions={searchOptions}
          setSeenActivePlay={setSeenActivePlay}
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
