import { Divider, Pagination } from "@mui/material";
import { useEffect, useState } from "react";
import type { YouTubePlayer } from "react-youtube";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { getNumberOfPages, getToAndFrom } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { PlayPreviewType } from "~/utils/types";
import PlaySearchFilters from "../play-search-filters";
import IndexPlay from "./index-play";
import Plays from "./plays";

type PlayIndexProps = {
  player: YouTubePlayer | null;
  videoId: string;
  scrollToPlayer: () => void;
  setActivePlay: (play: PlayPreviewType) => void;
  activePlay: PlayPreviewType | null;
};

export type PlaySearchOptions = {
  author?: string | undefined;
  only_highlights?: boolean;
  topic: string;
  private_only?: string;
};

const PlayIndex = ({
  player,
  videoId,
  scrollToPlayer,
  setActivePlay,
  activePlay,
}: PlayIndexProps) => {
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
  });
  const itemsPerPage = isMobile ? 10 : 20;

  const fetchPlays = async (options?: PlaySearchOptions) => {
    const { from, to } = getToAndFrom(itemsPerPage, page);
    const plays = supabase
      .from("play_preview")
      .select(`*`, {
        count: "exact",
      })
      .eq("video->>id", videoId)
      .order("play->>start_time")
      .range(from, to);
    if (options?.only_highlights) {
      void plays.eq("play->>highlight", true);
    }
    if (options?.author && options.author !== "") {
      void plays.ilike("play->>author_name", `%${options.author}%`);
    }
    if (activePlay) {
      void plays.neq("play->>id", activePlay.play.id);
    }
    if (affIds) {
      if (options?.private_only === "all") {
        void plays.or(
          `play->>private.eq.false, play->>exclusive_to.in.(${affIds})`,
        );
      } else if (options?.private_only && options.private_only !== "all") {
        void plays.eq("play->>exclusive_to", options.private_only);
      }
    } else {
      void plays.eq("play->>private", false);
    }
    const { data, count } = await plays;
    if (data) setPlays(data);
    if (count) setPlayCount(count);
  };

  const fetchPlaysBySearch = async (options: PlaySearchOptions) => {
    const { from, to } = getToAndFrom(itemsPerPage, page);
    if (options.topic && options.topic !== "") {
      const playsByMention = supabase
        .from("plays_via_user_mention")
        .select("*")
        .eq("video->>id", videoId)
        .or(
          `mention->>receiver_name.ilike.%${options.topic}%, play->>title.ilike.%${options.topic}%`,
        )
        .order("play->>start_time")
        .range(from, to);
      const playsByTag = supabase
        .from("plays_via_tag")
        .select("*")
        .eq("video->>id", videoId)
        .ilike("tag->>title", `%${options.topic}%`)
        .order("play->>start_time")
        .range(from, to);
      if (options.only_highlights) {
        void playsByMention.eq("play->>highlight", true);
        void playsByTag.eq("play->>highlight", true);
      }
      if (activePlay) {
        void playsByMention.neq("play->>id", activePlay.play.id);
        void playsByTag.neq("play->>id", activePlay.play.id);
      }
      if (options.author) {
        void playsByMention.ilike("play->>author_name", options.author);
        void playsByTag.ilike("play->>author_name", options.author);
      }
      if (affIds) {
        if (options?.private_only === "all") {
          void playsByMention.or(
            `play->>private.eq.false, play->>exclusive_to.in.(${affIds})`,
          );
          void playsByTag.or(
            `play->>private.eq.false, play->>exclusive_to.in.(${affIds})`,
          );
        } else if (options.private_only && options.private_only !== "all") {
          void playsByMention.eq("play->>exclusive_to", options.private_only);
          void playsByTag.eq("play->>exclusive_to", options.private_only);
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
  };

  const handlePageChange = (e: React.ChangeEvent<unknown>, value: number) => {
    e.preventDefault();
    setPage(value);
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
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (page === 1 && searchOptions.topic !== "") {
      void fetchPlaysBySearch(searchOptions);
    } else if (page === 1 && searchOptions.topic === "")
      void fetchPlays(searchOptions);
    else setPage(1);
  }, [searchOptions, isMobile]);

  useEffect(() => {
    if (searchOptions.topic !== "") void fetchPlaysBySearch(searchOptions);
    else void fetchPlays(searchOptions);
  }, [videoId, page, activePlay]);

  return (
    <div className="flex w-full flex-col items-center">
      {activePlay && (
        <div className="flex w-11/12 flex-col items-center justify-center gap-2">
          <div className="tracking-tightest text-xl font-bold">Active Play</div>
          <IndexPlay
            scrollToPlayer={scrollToPlayer}
            play={activePlay}
            player={player}
            activePlay={activePlay}
            setActivePlay={setActivePlay}
            searchOptions={searchOptions}
            setSearchOptions={setSearchOptions}
            videoId={videoId}
          />
          <Divider
            sx={{ marginTop: "16px", marginBottom: "16px" }}
            flexItem
          ></Divider>
        </div>
      )}
      <div className="flex w-full flex-col items-center justify-center gap-4">
        <PlaySearchFilters
          searchOptions={searchOptions}
          setSearchOptions={setSearchOptions}
        />
        <Plays
          scrollToPlayer={scrollToPlayer}
          player={player}
          plays={plays}
          setActivePlay={setActivePlay}
          setSearchOptions={setSearchOptions}
          searchOptions={searchOptions}
          videoId={videoId}
        />
        {playCount && (
          <Pagination
            showFirstButton
            showLastButton
            sx={{ marginTop: "16px" }}
            size="medium"
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

export default PlayIndex;
