import {
  Box,
  Button,
  Checkbox,
  Divider,
  Modal,
  TextField,
} from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { YouTubePlayer } from "react-youtube";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { PlayerType } from "~/utils/types";
import Mentions from "../play-mentions";
import PlayTags from "../play-tags";

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

export type TagType = {
  title: string;
  id?: string;
  create?: boolean;
  label?: string;
};

const PlayModal = ({
  player,
  videoId,
  setIsPlayModalOpen,
  isPlayModalOpen,
}: PlayModalProps) => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { backgroundStyle } = useIsDarkContext();
  const [isPlayStarted, setIsPlayStarted] = useState(false);
  const [playDetails, setPlayDetails] = useState<PlayType>({
    title: "",
    note: "",
    highlight: false,
    start: null,
    end: null,
  });
  const [mentions, setMentions] = useState<PlayerType>([]);
  const [affiliatedPlayers, setAffiliatedPlayers] = useState<PlayerType | null>(
    null,
  );
  const [playTags, setPlayTags] = useState<TagType[]>([]);
  const [tags, setTags] = useState<TagType[] | null>(null);
  const [isValidPlay, setIsValidPlay] = useState<boolean>(false);

  const fetchAffiliatedPlayers = async () => {
    // const { data } = await supabase
    //   .from("affiliations")
    //   .select(`id, profiles (name)`)
    //   .match({ team_id: user.currentAffiliation?.team.id, role: "player" });
    const { data } = await supabase
      .from("player_view")
      .select()
      .match({
        team_id: user.currentAffiliation?.team.id,
        role: "player",
        verified: true,
      });
    console.log(data);
    if (data) setAffiliatedPlayers(data);
  };

  const fetchTags = async () => {
    const tags = supabase.from("tags").select("title, id");
    if (user.currentAffiliation?.team.id) {
      void tags.or(
        `private.eq.false, exclusive_to.eq.${user.currentAffiliation.team.id}`,
      );
    } else {
      void tags.eq("private", false);
    }

    const { data } = await tags;
    if (data) setTags(data);
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
    setPlayTags([]);
  };

  const handleMention = async (player: string, name: string, play: string) => {
    await supabase.from("play_mentions").insert({
      play_id: play,
      sender_id: `${user.currentAffiliation?.affId}`,
      receiver_id: player,
      receiver_name: name,
      sender_name: `${user.name}`,
    });
  };

  const handleTag = async (play: string, tag: string) => {
    await supabase.from("play_tags").insert({
      play_id: play,
      tag_id: tag,
    });
  };

  const updateLastWatched = async () => {
    await supabase
      .from("affiliations")
      .update({
        last_watched: videoId,
        last_watched_time: playDetails.end,
      })
      .eq("id", `${user.currentAffiliation?.affId}`);
  };

  const createPlay = async () => {
    const { data } = await supabase
      .from("plays")
      .insert({
        team_id: `${user.currentAffiliation?.team.id}`,
        author_id: `${user.currentAffiliation?.affId}`,
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
      mentions?.forEach((mention) => {
        void handleMention(mention.id, mention.name, data.id);
      });
      playTags.forEach((tag) => {
        void handleTag(data.id, `${tag.id}`);
      });
      void updateLastWatched();
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
    const channel = supabase
      .channel("tag_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tags" },
        () => {
          void fetchTags();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    checkValidPlay();
  }, [playDetails]);

  useEffect(() => {
    if (user.currentAffiliation) void fetchAffiliatedPlayers();
    void fetchTags();
  }, [videoId]);

  return isPlayModalOpen ? (
    <Modal open={isPlayModalOpen} onClose={resetPlay}>
      <Box
        className="border-1 relative inset-1/2 flex w-4/5 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-md border-solid p-4"
        sx={backgroundStyle}
      >
        <Button
          variant="text"
          size="large"
          sx={{
            position: "absolute",
            right: "0",
            top: "0",
            fontWeight: "bold",
            fontSize: "24px",
            lineHeight: "32px",
          }}
          onClick={resetPlay}
        >
          X
        </Button>
        <Divider
          flexItem
          variant="middle"
          sx={{ margin: "8px", marginLeft: "64px", marginRight: "64px" }}
        >
          <div className="text-3xl font-bold">CREATE NEW PLAY</div>
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
          <PlayTags tags={playTags} setTags={setPlayTags} allTags={tags} />
          <Mentions players={affiliatedPlayers} setMentions={setMentions} />
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
