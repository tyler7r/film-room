import { Typography } from "@mui/material";
import { useEffect, useState } from "react";
import type { YouTubePlayer } from "react-youtube";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import { type PlayDirectoryType } from "~/utils/types";

type PlayDirectoryProps = {
  // plays: PlayDirectoryType | null;
  player: YouTubePlayer | null;
  gameId: string;
};

const PlayDirectory = ({ player, gameId }: PlayDirectoryProps) => {
  const { user } = useAuthContext();
  const [plays, setPlays] = useState<PlayDirectoryType | null>(null);
  const fetchPlays = async () => {
    const { data } = await supabase
      .from("plays")
      .select(`*`)
      .match({
        game_id: gameId,
        team_id: `${user.currentAffiliation?.team.id}`,
      });
    if (data) {
      const p = data;
      setPlays(p);
    }
  };

  useEffect(() => {
    void fetchPlays();
  }, []);

  return plays ? (
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
  );
};

export default PlayDirectory;
