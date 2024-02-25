import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Button, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Youtube, { type YouTubeEvent, type YouTubePlayer } from "react-youtube";
import PlayDirectory from "~/components/play-directory";
import PlayModal from "~/components/play-modal";
import { useMobileContext } from "~/contexts/mobile";
import { supabase } from "~/utils/supabase";
import type { GameListType } from "~/utils/types";

const FilmRoom = () => {
  const router = useRouter();
  const { screenWidth } = useMobileContext();

  const [game, setGame] = useState<GameListType | null>(null);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);

  const [isPlayModalOpen, setIsPlayModalOpen] = useState<boolean>(false);

  const [isPlayDirectoryOpen, setIsPlayDirectoryOpen] =
    useState<boolean>(false);

  const fetchGame = async () => {
    const { data } = await supabase
      .from("games")
      .select(
        `*, one: teams!games_one_id_fkey(id, city, name), two: teams!games_two_id_fkey(id, city, name)`,
      )
      .eq("id", router.query.game as string)
      .single();
    if (data) setGame(data);
  };

  const videoOnReady = (e: YouTubeEvent) => {
    const video = e.target;
    setPlayer(video);
    const time = Number(router.query.time);
    if (time) {
      void player?.seekTo(time, true);
    }
  };

  useEffect(() => {
    if (router.query.game) void fetchGame();
  }, [router.query.game]);

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
        <PlayModal
          player={player}
          gameId={game.id}
          isPlayModalOpen={isPlayModalOpen}
          setIsPlayModalOpen={setIsPlayModalOpen}
        />
        {game.link && (
          <Youtube
            opts={{
              width: `${screenWidth * 0.8}`,
              height: `${(screenWidth * 0.8) / 1.778}`,
              playerVars: {
                enablejsapi: 1,
                playsinline: 1,
                fs: 1,
                rel: 0,
                color: "red",
                origin: "https://www.youtube.com",
              },
            }}
            id="player"
            videoId={game.link.split("v=")[1]?.split("&")[0]}
            onReady={videoOnReady}
          />
        )}
        {isPlayDirectoryOpen ? (
          <div className="flex w-full flex-col items-center justify-center gap-4">
            <Button
              variant="text"
              onClick={() => setIsPlayDirectoryOpen(false)}
              endIcon={<ExpandLessIcon />}
              size="large"
            >
              Close Play Directory
            </Button>
            <PlayDirectory gameId={game.id} player={player} />
          </div>
        ) : (
          <Button
            variant="text"
            onClick={() => setIsPlayDirectoryOpen(true)}
            endIcon={<ExpandMoreIcon />}
            size="large"
          >
            Open Play Directory
          </Button>
        )}
      </div>
    )
  );
};

export default FilmRoom;
