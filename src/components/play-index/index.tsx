import StarIcon from "@mui/icons-material/Star";
import { Typography } from "@mui/material";
import { useEffect, useState } from "react";
import type { YouTubePlayer } from "react-youtube";
import { useAuthContext } from "~/contexts/auth";
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

  const [plays, setPlays] = useState<PlayIndexType | null>(null);
  const [searchOptions, setSearchOptions] = useState<PlaySearchOptions>({
    only_highlights: false,
    role: "",
    sender_name: "",
    receiver_name: "",
  });

  const fetchPlays = async (options?: PlaySearchOptions) => {
    let plays = supabase
      .from(`plays`)
      .select(`*, mentions:play_mentions (receiver_name)`)
      .match({
        video_id: videoId,
        team_id: `${user.currentAffiliation?.team.id}`,
      })
      .order("start_time");
    if (options?.only_highlights) {
      void plays.eq("highlight", true);
    }
    if (options?.role) {
      void plays.eq("author_role", options.role);
    }

    const { data } = await plays;
    if (data) setPlays(data);
  };

  useEffect(() => {
    if (user.currentAffiliation) void fetchPlays(searchOptions);
  }, [searchOptions, videoId]);

  return (
    <div className="flex w-4/5 flex-col gap-3">
      <PlaySearchFilters
        searchOptions={searchOptions}
        setSearchOptions={setSearchOptions}
      />
      <div className="flex items-center justify-center text-center">
        <StarIcon color="secondary" />
        <Typography fontSize={14} variant="overline">
          = Highlight Play
        </Typography>
      </div>
      <Plays scrollToPlayer={scrollToPlayer} player={player} plays={plays} />
    </div>
  );
};

export default PlayIndex;
