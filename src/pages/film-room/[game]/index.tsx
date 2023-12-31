import { Button, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Youtube, { type YouTubeEvent, type YouTubePlayer } from "react-youtube";
import { supabase } from "~/utils/supabase";
import { GameListType } from "~/utils/types";

type PlayType = {
  start: number | null | undefined;
  end: number | null | undefined;
};

const FilmRoom = () => {
  const router = useRouter();
  const [game, setGame] = useState<GameListType | null>(null);
  const [isClipStarted, setIsClipStarted] = useState(false);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [play, setPlay] = useState<PlayType>({
    start: null,
    end: null,
  });

  const getCurrentTime = () => {
    if (player) {
      return player.getCurrentTime();
    }
  };

  const videoOnReady = (e: YouTubeEvent) => {
    const video = e.target;
    setPlayer(video);
  };

  const startClip = async () => {
    setIsClipStarted(true);
    const time = await getCurrentTime();
    setPlay({ ...play, start: time });
  };

  const endClip = async () => {
    setIsClipStarted(false);
    const time = await getCurrentTime();
    setPlay({ ...play, end: time });
  };

  const fetchGame = async () => {
    const { data, error } = await supabase
      .from("games")
      .select(
        `*, one: teams!games_one_id_fkey(id, city, name), two: teams!games_two_id_fkey(id, city, name)`,
      )
      .eq("id", router.query.game as string)
      .single();

    if (data) setGame(data);
  };

  const youtubeEvent = (e: YouTubeEvent) => {
    const duration = e.target.getDuration();
    const currentTime = e.target.getCurrentTime();
    console.log("duration", duration);
    console.log("currentTime", currentTime);
  };

  useEffect(() => {
    console.log(play);
  }, [play]);

  useEffect(() => {
    void fetchGame();
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
        {!isClipStarted ? (
          <Button onClick={() => startClip()}>Start Clip</Button>
        ) : (
          <Button onClick={() => endClip()}>End Clip</Button>
        )}
        {game.link && (
          <div className="border-solid">
            <Youtube
              id="player"
              videoId={game.link.split("v=")[1]?.split("&")[0]}
              onPause={youtubeEvent}
              onReady={videoOnReady}
            />
          </div>
        )}
      </div>
    )
  );
};

export default FilmRoom;
