import {
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Youtube, { type YouTubeEvent, type YouTubePlayer } from "react-youtube";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import { GameListType } from "~/utils/types";

type PlayType = {
  start: number | null | undefined;
  end: number | null | undefined;
};

type NoteType = {
  note: string;
  highlight: boolean;
  keywords: string[] | null;
};

const FilmRoom = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const [game, setGame] = useState<GameListType | null>(null);
  const [isClipStarted, setIsClipStarted] = useState(false);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [play, setPlay] = useState<PlayType>({
    start: null,
    end: null,
  });
  const [noteOpen, setNoteOpen] = useState<boolean>(false);
  const [noteDetails, setNoteDetails] = useState<NoteType>({
    note: "",
    highlight: false,
    keywords: null,
  });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNoteDetails({
      ...noteDetails,
      [name]: value,
    });
  };

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
    player?.pauseVideo();
    setPlay({ ...play, end: time });
    setNoteOpen(true);
  };

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

  const createPlay = async () => {
    const { data } = await supabase
      .from("plays")
      .insert({
        author_id: user.userId,
        game_id: game?.id,
        highlight: false,
        keywords: [""],
        note: "This is a test!",
        timestamp: { start: play.start, end: play.end },
      })
      .select();
    if (data) console.log(data);
  };

  const resetPlay = async () => {
    setNoteOpen(false);
    setNoteDetails({ note: "", highlight: false, keywords: null });
    setPlay({ end: null, start: null });
  };

  useEffect(() => {
    console.log(play);
  }, [play]);

  useEffect(() => {
    void fetchGame();
  }, []);

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
        {noteOpen ? (
          <form>
            <TextField
              className="w-full"
              name="note"
              autoComplete="note"
              required
              id="note"
              label="Note"
              onChange={handleInput}
              value={noteDetails.note}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={noteDetails.highlight}
                  onChange={() =>
                    setNoteDetails({
                      ...noteDetails,
                      highlight: !noteDetails.highlight,
                    })
                  }
                  size="small"
                />
              }
              labelPlacement="end"
              label="Highlight Play?"
            />
            <Button type="submit" variant="contained">
              Submit
            </Button>
            <Button type="button" variant="text" onClick={() => resetPlay()}>
              Cancel
            </Button>
          </form>
        ) : !isClipStarted ? (
          <Button onClick={() => startClip()}>Start Clip</Button>
        ) : (
          <Button onClick={() => endClip()}>End Clip</Button>
        )}
        {game.link && (
          <div className="relative">
            <Youtube
              opts={{
                playerVars: {
                  enablejsapi: 1,
                  playsinline: 1,
                  //   fs: 0,
                  rel: 0,
                  color: "red",
                },
              }}
              id="player"
              videoId={game.link.split("v=")[1]?.split("&")[0]}
              onReady={videoOnReady}
            />
          </div>
        )}
      </div>
    )
  );
};

export default FilmRoom;
