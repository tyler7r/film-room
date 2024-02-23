import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import type { YouTubePlayer } from "react-youtube";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import { type PlayDirectoryType } from "~/utils/types";

type PlayDirectoryProps = {
  player: YouTubePlayer | null;
  gameId: string;
};

type PlayIndexType = {
  name: string;
  count: number;
};

const PlayDirectory = ({ player, gameId }: PlayDirectoryProps) => {
  const { user } = useAuthContext();
  const [plays, setPlays] = useState<PlayDirectoryType | null>(null);
  const [filteredPlays, setFilteredPlays] = useState<PlayDirectoryType | null>(
    null,
  );
  const [playIndex, setPlayIndex] = useState<PlayIndexType[] | null>(null);
  const [filter, setFilter] = useState<string>("");

  const fetchPlays = async () => {
    const { data } = await supabase
      .from("plays")
      .select(`*`)
      .match({
        game_id: gameId,
        team_id: `${user.currentAffiliation?.team.id}`,
      });
    if (data) {
      setPlays(data);
      let arr: PlayIndexType[] = [
        { name: "Coach Notes", count: 0 },
        { name: "Player Notes", count: 0 },
      ];
      data.forEach((play) => {
        const authorRole = play.author_role === "player" ? arr[1] : arr[0];
        if (authorRole) authorRole.count++;
        const isRepeatAuthor = arr.find((p) => p.name === play.author_name);
        if (isRepeatAuthor) {
          isRepeatAuthor.count++;
        } else {
          arr.push({ name: play.author_name as string, count: 1 });
        }
      });
      setPlayIndex(arr);
    }
  };

  const handleChange = (e: SelectChangeEvent) => {
    const f = e.target.value as string;
    setFilter(f);
    let copy = plays;
    if (f === "Player Notes") {
      let result = copy?.filter((v) => v.author_role === "player");
      if (result) setFilteredPlays(result);
    } else if (f === "Coach Notes") {
      let result = copy?.filter((v) => v.author_role === "coach");
      if (result) setFilteredPlays(result);
    } else {
      let result = copy?.filter((v) => v.author_name === f);
      if (result) setFilteredPlays(result);
    }
  };

  useEffect(() => {
    void fetchPlays();
  }, []);

  return (
    <div>
      <FormControl>
        <InputLabel>Play Filter</InputLabel>
        <Select value={filter} onChange={handleChange} label="Play Filter">
          <MenuItem value="">None</MenuItem>
          {playIndex?.map((i) => (
            <MenuItem key={i.name} value={i.name}>
              {i.name} ({i.count})
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {filter !== "" ? (
        filteredPlays && filteredPlays.length > 0 ? (
          filteredPlays.map((play) => (
            <div
              key={play.id}
              className=""
              onClick={() => player?.seekTo(play.start_time, true)}
            >
              <div>{play.author_name}</div>
              <div>{play.note}</div>
            </div>
          ))
        ) : (
          <Typography>Play directory is empty!</Typography>
        )
      ) : plays && plays.length > 0 ? (
        plays.map((play) => (
          <div
            key={play.id}
            className=""
            onClick={() => player?.seekTo(play.start_time, true)}
          >
            <div>{play.author_name}</div>
            <div>{play.note}</div>
          </div>
        ))
      ) : (
        <Typography>Play directory is empty!</Typography>
      )}
    </div>
  );
};

export default PlayDirectory;
