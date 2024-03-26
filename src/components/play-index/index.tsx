import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import StarIcon from "@mui/icons-material/Star";
import { Button, Pagination, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import type { YouTubePlayer } from "react-youtube";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { getNumberOfPages } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import { PlayType, type PlayIndexType } from "~/utils/types";
import PlaySearchFilters from "../play-search-filters";
import Plays from "./plays";

type PlayIndexProps = {
  player: YouTubePlayer | null;
  videoId: string;
  scrollToPlayer: () => void;
  duration: number;
  setActivePlay: (play: PlayType) => void;
};

export type PlaySearchOptions = {
  role?: string | undefined;
  only_highlights?: boolean;
  receiver_name?: string;
};

const PlayIndex = ({
  setActivePlay,
  player,
  videoId,
  scrollToPlayer,
}: PlayIndexProps) => {
  const { user } = useAuthContext();
  const { isMobile } = useMobileContext();

  const [plays, setPlays] = useState<PlayIndexType | null>(null);
  const [page, setPage] = useState<number>(1);
  const [playCount, setPlayCount] = useState<number | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false);

  const [searchOptions, setSearchOptions] = useState<PlaySearchOptions>({
    only_highlights: false,
    role: "",
    receiver_name: "",
  });

  const fetchPlays = async (options?: PlaySearchOptions) => {
    const { from, to } = getFromAndTo();
    let plays = supabase
      .from(`plays`)
      .select(`*, mentions:play_mentions!inner(receiver_name)`, {
        count: "exact",
      })
      .match({
        video_id: videoId,
        team_id: `${user.currentAffiliation?.team.id}`,
      })
      .ilike(
        "play_mentions.receiver_name",
        options?.receiver_name && options.receiver_name !== ""
          ? `%${options?.receiver_name}%`
          : "%%",
      )
      .order("start_time")
      .range(from, to);
    if (options?.only_highlights) {
      void plays.eq("highlight", true);
    }
    if (options?.role) {
      void plays.eq("author_role", options.role);
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
    if (user.currentAffiliation) void fetchPlays(searchOptions);
  }, [searchOptions, videoId, page, isMobile]);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-4">
      {isFiltersOpen ? (
        <div className="flex w-full flex-col items-center justify-center gap-2">
          <Button
            variant="outlined"
            onClick={() => setIsFiltersOpen(false)}
            endIcon={<ExpandLessIcon />}
            className="mb-2"
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
      <div className="flex items-center justify-center gap-1 text-center">
        <StarIcon color="secondary" fontSize="large" />
        <Typography fontSize={16} variant="overline">
          = Highlight Play
        </Typography>
      </div>
      <Plays
        scrollToPlayer={scrollToPlayer}
        player={player}
        plays={plays}
        setActivePlay={setActivePlay}
      />
      {plays && playCount && (
        <Pagination
          showFirstButton
          showLastButton
          className="mt-6"
          size="large"
          variant="text"
          shape="rounded"
          count={getNumberOfPages(isMobile, playCount)}
          page={page}
          onChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default PlayIndex;
