import { Typography } from "@mui/material";
import { useRouter } from "next/router";

import { useEffect, useState } from "react";
import { supabase } from "~/utils/supabase";
import { GameListType } from "~/utils/types";

const FilmRoom = () => {
  const router = useRouter();
  const [game, setGame] = useState<GameListType | null>(null);
  const fetchGames = async () => {
    const { data, error } = await supabase
      .from("games")
      .select(
        `*, one: teams!games_one_id_fkey(id, city, name), two: teams!games_two_id_fkey(id, city, name)`,
      )
      .eq("id", router.query.game as string)
      .single();

    if (data) setGame(data);
  };

  useEffect(() => {
    void fetchGames();
  });
  return (
    game && (
      <div className="m-4 flex flex-col items-center justify-center gap-2">
        <Typography variant="h6">
          {game.season} {game.tournament}
        </Typography>
        <div className="flex items-center justify-center gap-4 text-center">
          <Typography variant="h1" fontSize={36}>
            {game.one?.city} {game.one?.name}
          </Typography>
          <Typography variant="overline" fontSize={14}>
            vs
          </Typography>
          <Typography variant="h1" fontSize={36}>
            {game.two?.city} {game.two?.name}
          </Typography>
        </div>
      </div>
    )
  );
};

export default FilmRoom;
