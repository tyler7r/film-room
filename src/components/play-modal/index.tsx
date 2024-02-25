import { Button, Checkbox, FormControlLabel, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import type { YouTubePlayer } from "react-youtube";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import { PlayerType } from "~/utils/types";
import Mentions from "../play-mentions";

type CreatePlayProps = {
  player: YouTubePlayer | null;
  gameId: string;
  isPlayModalOpen: boolean;
  setIsPlayModalOpen: (status: boolean) => void;
};

type PlayType = {
  start: number | null | undefined;
  end: number | null | undefined;
  title: string;
  note: string;
  highlight: boolean;
};

const PlayModal = ({
  player,
  gameId,
  setIsPlayModalOpen,
  isPlayModalOpen,
}: CreatePlayProps) => {
  const { user } = useAuthContext();
  const { borderStyle } = useIsDarkContext();
  const [isPlayStarted, setIsPlayStarted] = useState(false);
  const [playDetails, setPlayDetails] = useState<PlayType>({
    title: "",
    note: "",
    highlight: false,
    start: null,
    end: null,
  });
  const [mentions, setMentions] = useState<string[]>([]);
  const [affiliatedPlayers, setAffiliatedPlayers] = useState<PlayerType | null>(
    null,
  );
  const [isValidPlay, setIsValidPlay] = useState<boolean>(false);

  const fetchAffiliatedPlayers = async () => {
    const { data } = await supabase
      .from("affiliations")
      .select(`user_id, profiles (name)`)
      .neq("user_id", user.userId)
      .match({ team_id: user.currentAffiliation?.team.id, role: "player" });
    if (data) setAffiliatedPlayers(data);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPlayDetails({
      ...playDetails,
      [name]: value,
    });
  };

  const startPlay = async () => {
    setIsPlayStarted(true);
    const time = await player?.getCurrentTime();
    const roundedTime = Math.round(time!);
    setPlayDetails({ ...playDetails, start: roundedTime });
    void player?.playVideo();
  };

  const endPlay = async () => {
    setIsPlayStarted(false);
    const time = await player?.getCurrentTime();
    const roundedTime = Math.round(time!);
    void player?.pauseVideo();
    setPlayDetails({ ...playDetails, end: roundedTime });
    setIsPlayModalOpen(true);
  };

  const resetPlay = async () => {
    setIsPlayModalOpen(false);
    setPlayDetails({
      title: "",
      note: "",
      highlight: false,
      start: null,
      end: null,
    });
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
        game_id: gameId,
        highlight: playDetails.highlight,
        title: playDetails.title,
        note: playDetails.note,
        start_time: playDetails.start!,
        end_time: playDetails.end!,
        author_role: `${user.currentAffiliation?.role}`,
        author_name: `${user.name}`,
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

  const checkValidPlay = () => {
    if (
      typeof playDetails.end !== "number" ||
      typeof playDetails.start !== "number" ||
      playDetails.note === "" ||
      playDetails.title === ""
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
    checkValidPlay();
  }, [playDetails]);

  useEffect(() => {
    if (user.currentAffiliation) void fetchAffiliatedPlayers();
  }, [gameId]);

  return isPlayModalOpen ? (
    <form
      onSubmit={handleSubmit}
      style={borderStyle}
      className="flex w-4/5 flex-col items-center justify-center gap-4 rounded-md border-solid p-4"
    >
      <TextField
        className="w-4/5"
        name="title"
        autoComplete="title"
        required
        id="title"
        label="Title (100 characters max)"
        onChange={handleInput}
        value={playDetails.title}
        inputProps={{ maxLength: 100 }}
      />
      <TextField
        className="w-full"
        name="note"
        autoComplete="note"
        required
        id="note"
        label="Note"
        onChange={handleInput}
        value={playDetails.note}
      />
      <Mentions
        players={affiliatedPlayers}
        mentions={mentions}
        setMentions={setMentions}
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={playDetails.highlight}
            onChange={() =>
              setPlayDetails({
                ...playDetails,
                highlight: !playDetails.highlight,
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
  ) : !isPlayStarted ? (
    <Button onClick={() => startPlay()} size="large">
      Start Play Clip
    </Button>
  ) : (
    <Button onClick={() => endPlay()} size="large">
      End Play Clip
    </Button>
  );
};

export default PlayModal;
