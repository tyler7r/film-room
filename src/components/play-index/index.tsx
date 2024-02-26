import StarIcon from "@mui/icons-material/Star";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";
import { useEffect, useState } from "react";
import type { YouTubePlayer } from "react-youtube";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import { type PlayIndexType } from "~/utils/types";
import Plays from "./plays";

type PlayIndexProps = {
  player: YouTubePlayer | null;
  gameId: string;
  scrollToPlayer: () => void;
};

type ActivePlayFilterType = {
  name: string;
  count: number;
};

const PlayIndex = ({ player, gameId, scrollToPlayer }: PlayIndexProps) => {
  const { user } = useAuthContext();

  const [plays, setPlays] = useState<PlayIndexType | null>(null);
  const [filteredPlays, setFilteredPlays] = useState<PlayIndexType | null>(
    null,
  );

  const [activePlayFilters, setActivePlayFilters] = useState<
    ActivePlayFilterType[] | null
  >(null);
  const [currentFilter, setCurrentFilter] = useState<string>("");

  const fetchPlays = async () => {
    const { data } = await supabase
      .from(`plays`)
      .select(
        `*, mentions:play_mentions(profiles!play_mentions_receiver_id_fkey(name))`,
      )
      .match({
        game_id: gameId,
        team_id: `${user.currentAffiliation?.team.id}`,
      })
      .order("start_time");
    const arr: ActivePlayFilterType[] = [
      { name: "Coaches", count: 0 },
      { name: "Players", count: 0 },
      { name: "Highlights", count: 0 },
    ];
    if (data) {
      setPlays(data);
      data.forEach((play) => {
        const authorRole = play.author_role === "player" ? arr[1] : arr[0];
        if (authorRole) authorRole.count++;
        if (play.highlight && arr[2]) arr[2].count++;
        const isRepeatAuthor = arr.find((p) => p.name === play.author_name);
        if (isRepeatAuthor) {
          isRepeatAuthor.count++;
        } else {
          arr.push({ name: play.author_name, count: 1 });
        }
      });
    }
    setActivePlayFilters(arr);
  };

  const handleChange = (e: SelectChangeEvent) => {
    const f = e.target.value;
    setCurrentFilter(f);
    const copy = plays;
    if (f === "Players") {
      const result = copy?.filter((v) => v.author_role === "player");
      if (result) setFilteredPlays(result);
    } else if (f === "Coaches") {
      const result = copy?.filter((v) => v.author_role === "coach");
      if (result) setFilteredPlays(result);
    } else if (f === "Highlights") {
      const result = copy?.filter((v) => v.highlight);
      if (result) setFilteredPlays(result);
    } else {
      const result = copy?.filter((v) => v.author_name === f);
      if (result) setFilteredPlays(result);
    }
  };

  useEffect(() => {
    if (user.currentAffiliation) void fetchPlays();
  }, []);

  return (
    <div className="flex w-4/5 flex-col gap-3">
      <FormControl className="mb-2 w-1/2 self-center">
        <InputLabel>Filter</InputLabel>
        <Select value={currentFilter} onChange={handleChange} label="Filter">
          <MenuItem value="">No Filter</MenuItem>
          {activePlayFilters?.map((i) => (
            <MenuItem key={i.name} value={i.name}>
              {i.name === "Highlights" ? "Highlights" : `Notes by ${i.name}`} (
              {i.count})
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <div className="flex items-center justify-center text-center">
        <StarIcon color="secondary" />
        <Typography fontSize={14} variant="overline">
          = Highlight Play
        </Typography>
      </div>
      {currentFilter !== "" ? (
        <Plays
          scrollToPlayer={scrollToPlayer}
          plays={filteredPlays}
          player={player}
        />
      ) : (
        <Plays scrollToPlayer={scrollToPlayer} player={player} plays={plays} />
      )}
    </div>
  );
};

export default PlayIndex;
