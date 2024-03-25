import {
  Box,
  Button,
  Checkbox,
  Divider,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { YouTubePlayer } from "react-youtube";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { PlayerType } from "~/utils/types";
import Mentions from "../play-mentions";

type PlayModalProps = {
  player: YouTubePlayer | null;
  videoId: string;
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
  videoId,
  setIsPlayModalOpen,
  isPlayModalOpen,
}: PlayModalProps) => {
  const router = useRouter();
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
    if (!user.isLoggedIn) {
      void router.push("/login");
      return;
    }
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

  const handleMention = async (player: string, name: string, play: string) => {
    await supabase
      .from("play_mentions")
      .insert({
        play_id: play,
        sender_id: `${user.userId}`,
        receiver_id: player,
        receiver_name: name,
        sender_name: `${user.name}`,
      })
      .select()
      .single();
  };

  const createPlay = async () => {
    const { data } = await supabase
      .from("plays")
      .insert({
        team_id: `${user.currentAffiliation?.team.id}`,
        profile_id: user.userId,
        video_id: videoId,
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
          void handleMention(player.user_id, mention, data.id);
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
  }, [videoId]);

  return isPlayModalOpen ? (
    <Modal open={isPlayModalOpen} onClose={resetPlay}>
      <Box className="border-1 relative inset-1/2 flex w-4/5 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-md border-solid bg-white p-4">
        <Button
          variant="text"
          size="large"
          className="absolute right-0 top-0 text-2xl font-bold"
          onClick={resetPlay}
        >
          X
        </Button>
        <Divider flexItem variant="middle" className="m-2 mx-16">
          <Typography className="text-3xl font-bold">
            CREATE NEW PLAY
          </Typography>
        </Divider>
        <form
          onSubmit={handleSubmit}
          className="flex w-4/5 flex-col items-center justify-center gap-4 p-4 text-center"
        >
          <TextField
            className="w-full"
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
            multiline
            maxRows={5}
          />
          <Mentions
            players={affiliatedPlayers}
            mentions={mentions}
            setMentions={setMentions}
          />
          <div className="flex items-center justify-center">
            <div className="text-xl font-bold tracking-tight">
              Highlight Play?
            </div>
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
          </div>
          <div className="flex items-center justify-center gap-2">
            <Button
              type="submit"
              variant="contained"
              disabled={!isValidPlay}
              size="large"
            >
              Submit
            </Button>
            <Button
              type="button"
              variant="text"
              onClick={() => resetPlay()}
              size="large"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Box>
    </Modal>
  ) : !isPlayStarted ? (
    <Button onClick={() => startPlay()} size="large">
      Start Recording
    </Button>
  ) : (
    <Button onClick={() => endPlay()} size="large">
      End Recording
    </Button>
  );
};

export default PlayModal;
