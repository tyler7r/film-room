import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Box,
  Button,
  Checkbox,
  IconButton,
  Modal,
  TextField,
  Tooltip,
} from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { YouTubePlayer } from "react-youtube";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { PlayerType, VideoType } from "~/utils/types";
import PageTitle from "../page-title";
import Mentions from "../play-mentions";
import PlayTags from "../play-tags";

type PlayModalProps = {
  player: YouTubePlayer | null;
  video: VideoType;
  isPlayModalOpen: boolean;
  setIsPlayModalOpen: (status: boolean) => void;
};

type PlayDetailsType = {
  start: number | null | undefined;
  end: number | null | undefined;
  title: string;
  note: string;
  highlight: boolean;
  private: boolean;
};

export type CreateNewTagType = {
  title: string;
  id?: string;
  create?: boolean;
  label?: string;
};

const PlayModal = ({
  player,
  video,
  setIsPlayModalOpen,
  isPlayModalOpen,
}: PlayModalProps) => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { backgroundStyle } = useIsDarkContext();
  const [isPlayStarted, setIsPlayStarted] = useState(false);
  const [playDetails, setPlayDetails] = useState<PlayDetailsType>({
    title: "",
    note: "",
    highlight: false,
    start: null,
    end: null,
    private: false,
  });
  const [mentions, setMentions] = useState<PlayerType[]>([]);
  const [players, setPlayers] = useState<PlayerType[] | null>(null);
  const [playTags, setPlayTags] = useState<CreateNewTagType[]>([]);
  const [tags, setTags] = useState<CreateNewTagType[] | null>(null);
  const [isValidPlay, setIsValidPlay] = useState<boolean>(false);

  const fetchPlayers = async () => {
    const affiliatedPlayers = supabase
      .from("user_view")
      .select()
      .match({
        team_id: user.currentAffiliation?.team.id,
        role: "player",
        verified: true,
      });
    const allPlayers = supabase
      .from("user_view")
      .select("*")
      .eq("role", "player");
    const { data } =
      video.private && user.currentAffiliation?.team.id
        ? await affiliatedPlayers
        : await allPlayers;
    if (data) {
      const uniquePlayers = [
        ...new Map(data.map((x) => [x.profile_id, x])).values(),
      ];
      setPlayers(uniquePlayers);
    }
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
      private: false,
    });
    setMentions([]);
    setPlayTags([]);
  };

  const handleMention = async (player: string, name: string, play: string) => {
    await supabase.from("play_mentions").insert({
      play_id: play,
      sender_id: `${user.userId}`,
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
      .from("profiles")
      .update({
        last_watched: video.id,
        last_watched_time: playDetails.end,
      })
      .eq("id", `${user.userId}`);
  };

  const createPlay = async (isPrivate: boolean) => {
    const { data } = await supabase
      .from("plays")
      .insert({
        exclusive_to:
          isPrivate && user.currentAffiliation?.team.id
            ? user.currentAffiliation.team.id
            : null,
        author_id: `${user.userId}`,
        video_id: video.id,
        highlight: playDetails.highlight,
        title: playDetails.title,
        note: playDetails.note === "" ? null : playDetails.note,
        start_time: playDetails.start!,
        end_time: playDetails.end!,
        author_role: user.currentAffiliation?.role ?? "guest",
        author_name: `${user.name}`,
        private: isPrivate ? true : false,
      })
      .select()
      .single();
    if (data) {
      mentions?.forEach((mention) => {
        void handleMention(mention.profile_id, mention.name, data.id);
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
      playDetails.title === ""
    ) {
      setIsValidPlay(false);
    } else {
      setIsValidPlay(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (video.private || playDetails.private) void createPlay(true);
    else {
      void createPlay(false);
    }
    void resetPlay();
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
    if (user.isLoggedIn && user.userId) void fetchPlayers();
    void fetchTags();
  }, [video]);

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
        <PageTitle title="Create New Play" size="medium" />
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
            id="note"
            label="Note"
            onChange={handleInput}
            value={playDetails.note}
            multiline
            maxRows={5}
          />
          <PlayTags tags={playTags} setTags={setPlayTags} allTags={tags} />
          <Mentions players={players} setMentions={setMentions} />
          <div className="flex w-full justify-around">
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
                name="highlight-play"
                id="highlight-play"
              />
            </div>
            {!video.private && user.currentAffiliation && (
              <div className="flex items-center justify-center">
                <div className="text-xl font-bold tracking-tight">
                  Private Play?
                </div>
                <Tooltip
                  title="Private plays are only viewable by teammates and coaches. Public plays are viewable by all users."
                  slotProps={{
                    popper: {
                      modifiers: [
                        {
                          name: "offset",
                          options: {
                            offset: [0, -14],
                          },
                        },
                      ],
                    },
                  }}
                >
                  <IconButton size="small">
                    <InfoOutlinedIcon />
                  </IconButton>
                </Tooltip>
                <Checkbox
                  checked={playDetails.private}
                  onChange={() =>
                    setPlayDetails({
                      ...playDetails,
                      private: !playDetails.private,
                    })
                  }
                  size="medium"
                  name="private-only"
                  id="private-only"
                />
              </div>
            )}
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
    <div>
      <Button
        sx={{ marginRight: "-8px" }}
        onClick={() => startPlay()}
        size="large"
      >
        Start Recording
      </Button>
      <Tooltip
        title="Start your play recording, once your play ends make sure to click END RECORDING to complete your note!"
        slotProps={{
          popper: {
            modifiers: [
              {
                name: "offset",
                options: {
                  offset: [0, -14],
                },
              },
            ],
          },
        }}
      >
        <IconButton size="small">
          <InfoOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </div>
  ) : (
    <div>
      <Button onClick={() => endPlay()} size="large">
        End Recording
      </Button>
      <Tooltip
        title="End your play recording, once clicked you will be prompted to fill out the details of your play!"
        slotProps={{
          popper: {
            modifiers: [
              {
                name: "offset",
                options: {
                  offset: [0, -14],
                },
              },
            ],
          },
        }}
      >
        <IconButton size="small">
          <InfoOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default PlayModal;
