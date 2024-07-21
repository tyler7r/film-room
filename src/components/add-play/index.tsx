import StarIcon from "@mui/icons-material/Star";
import { Box, Button, IconButton, Modal, TextField } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { YouTubePlayer } from "react-youtube";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { NewPlayType, PlayerType, VideoType } from "~/utils/types";
import PageTitle from "../page-title";
import PlayMentions from "../play-mentions";
import PlayTags from "../play-tags";
import StandardPopover from "../standard-popover";
import PlayModalBtn from "./button";
import PrivacyStatus from "./privacy-status";

type NewPlayModalProps = {
  player: YouTubePlayer | null;
  video: VideoType;
  isNewPlayOpen: boolean;
  setIsNewPlayOpen: (status: boolean) => void;
};

export type CreateNewTagType = {
  title: string;
  id?: string;
  create?: boolean;
  label?: string;
};

const NewPlayModal = ({
  player,
  video,
  setIsNewPlayOpen,
  isNewPlayOpen,
}: NewPlayModalProps) => {
  const router = useRouter();
  const { user, affIds } = useAuthContext();
  const { backgroundStyle } = useIsDarkContext();

  const [isPlayStarted, setIsPlayStarted] = useState(false);
  const [playDetails, setPlayDetails] = useState<NewPlayType>({
    title: "",
    note: "",
    highlight: false,
    start: null,
    end: null,
    private: false,
    exclusive_to: video.exclusive_to ? video.exclusive_to : "public",
  });
  const [mentions, setMentions] = useState<PlayerType[] | null>(null);
  const [players, setPlayers] = useState<PlayerType[] | null>(null);
  const [playTags, setPlayTags] = useState<CreateNewTagType[]>([]);
  const [tags, setTags] = useState<CreateNewTagType[] | null>(null);
  const [isValidPlay, setIsValidPlay] = useState<boolean>(false);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handlePopoverOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const fetchPlayers = async () => {
    const players = supabase.from("user_view").select();
    if (video.exclusive_to) {
      void players.match({
        team_id: video.exclusive_to,
        role: "player",
        verified: true,
      });
    } else {
      void players.eq("role", "player");
    }
    const { data } = await players;
    if (data) {
      const uniquePlayers = [
        ...new Map(data.map((x) => [x.profile_id, x])).values(),
      ];
      setPlayers(uniquePlayers);
    }
  };

  const fetchTags = async () => {
    const tags = supabase.from("tags").select("title, id");
    if (affIds) {
      void tags.or(`private.eq.false, exclusive_to.in.(${affIds})`);
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
    setIsNewPlayOpen(true);
  };

  const resetPlay = async () => {
    setIsNewPlayOpen(false);
    setPlayDetails({
      title: "",
      note: "",
      highlight: false,
      start: null,
      end: null,
      private: false,
      exclusive_to: video.exclusive_to ? video.exclusive_to : "public",
    });
    setMentions(null);
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
    if (user.userId) {
      await supabase
        .from("profiles")
        .update({
          last_watched: video.id,
          last_watched_time: playDetails.end,
        })
        .eq("id", user.userId);
    }
  };

  const createPlay = async (isPrivate: boolean) => {
    if (user.userId) {
      const { data } = await supabase
        .from("plays")
        .insert({
          exclusive_to: isPrivate ? playDetails.exclusive_to : null,
          author_id: user.userId,
          video_id: video.id,
          highlight: playDetails.highlight,
          title: playDetails.title,
          note: playDetails.note === "" ? null : playDetails.note,
          start_time: playDetails.start!,
          end_time: playDetails.end!,
          author_name: `${user.name}`,
          private: isPrivate,
        })
        .select()
        .single();
      if (data) {
        mentions?.forEach((mention) => {
          void handleMention(mention.profile_id, mention.name, data.id);
        });
        if (playTags.length > 0) {
          playTags.forEach((tag) => {
            void handleTag(data.id, `${tag.id}`);
          });
        }
        void updateLastWatched();
        void resetPlay();
      }
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
    void fetchPlayers();
    void fetchTags();
  }, [video]);

  return !isNewPlayOpen ? (
    <PlayModalBtn
      isPlayStarted={isPlayStarted}
      startPlay={startPlay}
      endPlay={endPlay}
    />
  ) : (
    <Modal open={isNewPlayOpen} onClose={resetPlay}>
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
          <div className="flex w-full items-center justify-center gap-2">
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
            <IconButton
              size="small"
              onClick={() =>
                setPlayDetails({
                  ...playDetails,
                  highlight: !playDetails.highlight,
                })
              }
              onMouseEnter={handlePopoverOpen}
              onMouseLeave={handlePopoverClose}
            >
              <StarIcon
                fontSize="large"
                color={playDetails.highlight ? "secondary" : "action"}
              />
              <StandardPopover
                content="Highlight Play?"
                open={open}
                anchorEl={anchorEl}
                handlePopoverClose={handlePopoverClose}
              />
            </IconButton>
          </div>
          <PlayTags tags={playTags} setTags={setPlayTags} allTags={tags} />
          <PlayMentions players={players} setMentions={setMentions} />
          <PrivacyStatus
            video={video}
            newDetails={playDetails}
            setNewDetails={setPlayDetails}
          />
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
  );
};

export default NewPlayModal;
