import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LockIcon from "@mui/icons-material/Lock";
import StarIcon from "@mui/icons-material/Star";
import { Button, Divider, Pagination, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import type { YouTubePlayer } from "react-youtube";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { getNumberOfPages } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { PlayType } from "~/utils/types";
import PlaySearchFilters from "../play-search-filters";
import Play from "./play";
import Plays from "./plays";

type PlayIndexProps = {
  player: YouTubePlayer | null;
  videoId: string;
  scrollToPlayer: () => void;
  duration: number;
  setActivePlay: (play: PlayType) => void;
  activePlay: PlayType | null;
};

export type PlaySearchOptions = {
  role?: string | undefined;
  only_highlights?: boolean;
  topic: string;
  private_only?: boolean;
  currentAffiliation: string | undefined;
};

const PlayIndex = ({
  setActivePlay,
  player,
  videoId,
  scrollToPlayer,
  activePlay,
}: PlayIndexProps) => {
  const { user } = useAuthContext();
  const { isMobile } = useMobileContext();

  const [plays, setPlays] = useState<PlayType[] | null>(null);
  const [page, setPage] = useState<number>(1);
  const [playCount, setPlayCount] = useState<number | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false);

  const [searchOptions, setSearchOptions] = useState<PlaySearchOptions>({
    only_highlights: false,
    role: "",
    private_only: false,
    topic: "",
    currentAffiliation: user.currentAffiliation?.team.id,
  });

  const fetchPlays = async (options?: PlaySearchOptions) => {
    const { from, to } = getFromAndTo();
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
    if (options?.private_only) {
      void plays.eq("play->>private", true);
    }
    if (options?.role) {
      void plays.eq("play->>author_role", options.role);
    }
    if (activePlay) {
      void plays.neq("play->>id", activePlay.id);
    }
    if (user.currentAffiliation?.team.id) {
      void plays.or(
        `play->>private.eq.false, play->>exclusive_to.eq.${user.currentAffiliation.team.id}`,
      );
    } else {
      void plays.eq("play->>private", false);
    }
    const { data, count } = await plays;
    if (data) setPlays(data.map((play) => play.play));
    if (count) setPlayCount(count);
  };

  const fetchPlaysBySearch = async (options: PlaySearchOptions) => {
    const { from, to } = getFromAndTo();
    const playsByMention = supabase
      .from("plays_via_user_mention")
      .select("*")
      .eq("video->>id", videoId)
      .ilike(
        "mention->>receiver_name",
        options.topic ? `%${options.topic}%` : "%%",
      )
      .order("play->>start_time")
      .range(from, to);
    const playsByTag = supabase
      .from("plays_via_tag")
      .select("*")
      .eq("video->>id", videoId)
      .ilike("tag->>title", options.topic ? `%${options.topic}%` : "%%")
      .order("play->>start_time")
      .range(from, to);
    if (options.only_highlights) {
      void playsByMention.eq("play->>highlight", true);
      void playsByTag.eq("play->>highlight", true);
    }
    if (options.private_only) {
      void playsByMention.eq("play->>private", true);
      void playsByTag.eq("play->>private", true);
    }
    if (options.role) {
      void playsByMention.eq("play->>author_role", options.role);
      void playsByTag.eq("play->>author_role", options.role);
    }
    if (activePlay) {
      void playsByMention.neq("play->>id", activePlay.id);
      void playsByTag.neq("play->>id", activePlay.id);
    }
    if (user.currentAffiliation?.team.id) {
      void playsByMention.or(
        `play->>private.eq.false, play->>exclusive_to.eq.${user.currentAffiliation.team.id}`,
      );
      void playsByTag.or(
        `play->>private.eq.false, play->>exclusive_to.eq.${user.currentAffiliation.team.id}`,
      );
    } else {
      void playsByMention.eq("play->>private", false);
      void playsByTag.eq("play->>private", false);
    }
    if (options.topic !== "") {
      const getTags = await playsByTag;
      const getMentions = await playsByMention;
      let ps: PlayType[] | null = null;
      if (getTags.data) {
        ps = getTags.data.map((play) => play.play);
      }
      if (getMentions.data) {
        ps = ps
          ? [...ps, ...getMentions.data?.map((play) => play.play)]
          : getMentions.data.map((play) => play.play);
      }
      const uniquePlays = [...new Map(ps?.map((x) => [x.id, x])).values()];
      setPlays(ps ? uniquePlays : null);
      setPlayCount(ps ? uniquePlays.length : null);
    }
  };

  const handlePageChange = (e: React.ChangeEvent<unknown>, value: number) => {
    e.preventDefault();
    setPage(value);
  };

  const getFromAndTo = () => {
    const itemPerPage = isMobile ? 5 : 10;
    const from = (page - 1) * itemPerPage;
    const to = from + itemPerPage - 1;

    return { from, to };
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
    setSearchOptions({
      ...searchOptions,
      currentAffiliation: user.currentAffiliation?.team.id,
    });
  }, [user]);

  useEffect(() => {
    if (searchOptions.topic !== "") void fetchPlaysBySearch(searchOptions);
    else void fetchPlays(searchOptions);
  }, [searchOptions, videoId, page, isMobile, activePlay]);

  return (
    <div className="flex w-full flex-col items-center">
      {activePlay && (
        <div className="flex w-11/12 flex-col items-center justify-center gap-2">
          <div className="tracking-tightest text-xl font-bold">Active Play</div>
          <Play
            setIsFiltersOpen={setIsFiltersOpen}
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
        {isFiltersOpen ? (
          <div className="flex w-full flex-col items-center justify-center gap-2">
            <Button
              variant="outlined"
              onClick={() => setIsFiltersOpen(false)}
              endIcon={<ExpandLessIcon />}
              sx={{ marginBottom: "8px" }}
            >
              Close Filters
            </Button>
            <PlaySearchFilters
              searchOptions={searchOptions}
              setSearchOptions={setSearchOptions}
              setPage={setPage}
            />
          </div>
        ) : (
          <Button
            variant="outlined"
            onClick={() => setIsFiltersOpen(true)}
            endIcon={<ExpandMoreIcon />}
            size="medium"
          >
            Open Filters
          </Button>
        )}
        <div className="flex gap-4">
          <div className="flex items-center justify-center gap-1 text-center">
            <StarIcon color="secondary" fontSize="large" />
            <Typography fontSize={16} variant="overline">
              = Highlight Play
            </Typography>
          </div>
          <div className="flex items-center justify-center gap-1 text-center">
            <LockIcon color="action" fontSize="large" />
            <Typography fontSize={16} variant="overline">
              = Private Play
            </Typography>
          </div>
        </div>
        <Plays
          setIsFiltersOpen={setIsFiltersOpen}
          scrollToPlayer={scrollToPlayer}
          player={player}
          plays={plays}
          setActivePlay={setActivePlay}
          setSearchOptions={setSearchOptions}
          searchOptions={searchOptions}
          videoId={videoId}
        />
        {plays && playCount && (
          <Pagination
            showFirstButton
            showLastButton
            sx={{ marginTop: "24px" }}
            size="large"
            variant="text"
            shape="rounded"
            count={getNumberOfPages(isMobile, playCount)}
            page={page}
            onChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default PlayIndex;
