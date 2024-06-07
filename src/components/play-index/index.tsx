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
import type { IndexPlayType } from "~/utils/types";
import PlaySearchFilters from "../play-search-filters";
import Play from "./play";
import Plays from "./plays";

type PlayIndexProps = {
  player: YouTubePlayer | null;
  videoId: string;
  scrollToPlayer: () => void;
  duration: number;
  setActivePlay: (play: IndexPlayType) => void;
  activePlay: IndexPlayType | null;
};

export type PlaySearchOptions = {
  role?: string | undefined;
  only_highlights?: boolean;
  receiver_name?: string;
  tag?: string;
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

  const [plays, setPlays] = useState<IndexPlayType[] | null>(null);
  const [page, setPage] = useState<number>(1);
  const [playCount, setPlayCount] = useState<number | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false);

  const [searchOptions, setSearchOptions] = useState<PlaySearchOptions>({
    only_highlights: false,
    role: "",
    private_only: false,
    tag: "",
    currentAffiliation: user.currentAffiliation?.team.id,
  });

  const fetchPlays = async (options?: PlaySearchOptions) => {
    const { from, to } = getFromAndTo();
    const plays = supabase
      .from(`plays`)
      .select(`*, tags(title), mentions:play_mentions(receiver_name)`, {
        count: "exact",
      })
      .eq("video_id", videoId)
      .order("start_time")
      .range(from, to);
    if (options?.receiver_name) {
      void plays.select(`*, mentions:play_mentions!inner(receiver_name)`);
      void plays.ilike(
        "play_mentions.receiver_name",
        options?.receiver_name && options.receiver_name !== ""
          ? `%${options.receiver_name}%`
          : "%%",
      );
    }
    if (options?.tag) {
      void plays.select(
        `*, mentions:play_mentions(receiver_name), tags!inner(title))`,
      );
      void plays.ilike(
        "tags.title",
        options?.tag && options.tag !== "" ? `%${options.tag}%` : "%%",
      );
    }
    if (options?.only_highlights) {
      void plays.eq("highlight", true);
    }
    if (options?.private_only) {
      void plays.eq("private", true);
    }
    if (options?.role) {
      void plays.eq("author_role", options.role);
    }
    if (activePlay) {
      void plays.neq("id", activePlay.id);
    }
    if (user.currentAffiliation?.team.id) {
      void plays.or(
        `private.eq.false, exclusive_to.eq.${user.currentAffiliation.team.id}`,
      );
    } else {
      void plays.eq("private", false);
    }
    const { data, count } = await plays;
    if (data) setPlays(data);
    if (count) setPlayCount(count);
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
    void fetchPlays(searchOptions);
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
