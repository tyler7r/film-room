import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
import PlayDirectory from "~/components/play-directory";
import Mentions from "~/components/play-mentions";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { GameListType, PlayerType } from "~/utils/types";

type PlayType = {
  start: number | null | undefined;
  end: number | null | undefined;
};

type NoteType = {
  note: string;
  highlight: boolean;
};

const FilmRoom = () => {
  const router = useRouter();
  const { screenWidth } = useMobileContext();
  const { borderStyle } = useIsDarkContext();
  const { user } = useAuthContext();
  const [game, setGame] = useState<GameListType | null>(null);
  const [isPlayDirectoryOpen, setIsPlayDirectoryOpen] =
    useState<boolean>(false);

  const [player, setPlayer] = useState<YouTubePlayer | null>(null);

  const [affiliatedPlayers, setAffiliatedPlayers] = useState<PlayerType | null>(
    null,
  );
  const [mentions, setMentions] = useState<string[]>([]);

  const [isClipStarted, setIsClipStarted] = useState(false);
  const [play, setPlay] = useState<PlayType>({
    start: null,
    end: null,
  });
  const [noteOpen, setNoteOpen] = useState<boolean>(false);
  const [noteDetails, setNoteDetails] = useState<NoteType>({
    note: "",
    highlight: false,
  });
  const [isValidPlay, setIsValidPlay] = useState<boolean>(false);

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

  const fetchPlayers = async () => {
    const { data } = await supabase
      .from("affiliations")
      .select(`user_id, profiles (name)`)
      .neq("user_id", user.userId)
      .match({ team_id: user.currentAffiliation?.team.id, role: "player" });
    if (data) setAffiliatedPlayers(data);
  };

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
    const time = Number(router.query.time);
    if (time) {
      player?.seekTo(time, true);
    }
  };

  const startClip = async () => {
    setIsClipStarted(true);
    const time = await player?.getCurrentTime();
    const roundedTime = Math.round(time!);
    setPlay({ ...play, start: roundedTime });
    void player?.playVideo();
  };

  const endClip = async () => {
    setIsClipStarted(false);
    const time = await getCurrentTime();
    const roundedTime = Math.round(time!);
    void player?.pauseVideo();
    setPlay({ ...play, end: roundedTime });
    setNoteOpen(true);
  };

  const resetPlay = async () => {
    setNoteOpen(false);
    setNoteDetails({
      note: "",
      highlight: false,
    });
    setPlay({ end: null, start: null });
    setMentions([]);
  };

  const handleMention = async (player: string, play: string) => {
    await supabase
      .from("play_mentions")
      .insert({
        play_id: play,
        sender_id: `${user.userId}`,
        receiver_id: player,
      })
      .select()
      .single();
  };

  const createPlay = async () => {
    const { data } = await supabase
      .from("plays")
      .insert({
        team_id: user.currentAffiliation?.team.id,
        profile_id: user.userId,
        game_id: `${game?.id}`,
        highlight: noteDetails.highlight,
        note: noteDetails.note,
        start_time: play.start!,
        end_time: play.end!,
        author_role: user.currentAffiliation?.role,
        author_name: user.name,
      })
      .select()
      .single();
    if (data) {
      mentions.forEach((mention) => {
        const player = affiliatedPlayers?.find(
          (v) => v.profiles?.name === mention,
        );
        if (player) {
          void handleMention(player.user_id, data.id);
        }
      });
      void resetPlay();
    }
  };

  const checkValidForm = () => {
    if (
      typeof play.end !== "number" ||
      typeof play.start !== "number" ||
      noteDetails.note === ""
    ) {
      setIsValidPlay(false);
    } else {
      setIsValidPlay(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void createPlay();
  };

  useEffect(() => {
    checkValidForm();
  }, [noteDetails, play]);

  useEffect(() => {
    if (router.query.game) void fetchGame();
    if (user.currentAffiliation) void fetchPlayers();
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
        {noteOpen ? (
          <form
            onSubmit={handleSubmit}
            style={borderStyle}
            className="flex w-4/5 flex-col items-center justify-center gap-4 rounded-md border-solid p-4"
          >
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
            <Mentions
              players={affiliatedPlayers}
              mentions={mentions}
              setMentions={setMentions}
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
                  size="medium"
                />
              }
              labelPlacement="end"
              label="Highlight?"
            />
            <div className="flex items-center justify-center gap-2">
              <Button type="submit" variant="contained" disabled={!isValidPlay}>
                Submit
              </Button>
              <Button type="button" variant="text" onClick={() => resetPlay()}>
                Cancel
              </Button>
            </div>
          </form>
        ) : !isClipStarted ? (
          <Button onClick={() => startClip()}>Start Clip</Button>
        ) : (
          <Button onClick={() => endClip()}>End Clip</Button>
        )}
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
