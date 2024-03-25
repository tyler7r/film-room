import StarIcon from "@mui/icons-material/Star";
import { Pagination, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import type { YouTubePlayer } from "react-youtube";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { getNumberOfPages } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import { type PlayIndexType } from "~/utils/types";
import PlaySearchFilters from "../play-search-filters";
import Plays from "./plays";

type PlayIndexProps = {
  player: YouTubePlayer | null;
  videoId: string;
  scrollToPlayer: () => void;
  duration: number;
};

export type PlaySearchOptions = {
  role?: string | undefined;
  only_highlights?: boolean;
  sender_name?: string | undefined;
  receiver_name?: string | undefined;
};

const PlayIndex = ({ player, videoId, scrollToPlayer }: PlayIndexProps) => {
  const { user } = useAuthContext();
  const { isMobile } = useMobileContext();

  const [plays, setPlays] = useState<PlayIndexType | null>(null);
  const [page, setPage] = useState<number>(1);
  const [playCount, setPlayCount] = useState<number | null>(null);

  const [searchOptions, setSearchOptions] = useState<PlaySearchOptions>({
    only_highlights: false,
    role: "",
    sender_name: "",
    receiver_name: "",
  });

  const fetchPlays = async (options?: PlaySearchOptions) => {
    const { from, to } = getFromAndTo();
    let plays = supabase
      .from(`plays`)
      .select(`*, mentions:play_mentions (receiver_name)`, { count: "exact" })
      .match({
        video_id: videoId,
        team_id: `${user.currentAffiliation?.team.id}`,
      })
      .order("start_time")
      .range(from, to);
    if (options?.only_highlights) {
      void plays.eq("highlight", true);
    }
    if (options?.role) {
      void plays.eq("author_role", options.role);
    }

    const { data, count } = await plays;
    console.log({ data, count });
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
    <div className="flex w-4/5 flex-col items-center justify-center gap-4">
      <PlaySearchFilters
        searchOptions={searchOptions}
        setSearchOptions={setSearchOptions}
        setPage={setPage}
      />
      <div className="flex items-center justify-center gap-1 text-center">
        <StarIcon color="secondary" fontSize="large" />
        <Typography fontSize={16} variant="overline">
          = Highlight Play
        </Typography>
      </div>
      <Plays scrollToPlayer={scrollToPlayer} player={player} plays={plays} />
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
