import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Modal,
  Switch,
  TextField,
  Tooltip,
} from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { YouTubePlayer } from "react-youtube";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import sendEmail from "~/utils/send-email";
import { supabase } from "~/utils/supabase";
import {
  type CollectionType,
  type NewPlayType,
  type PlayType,
  type TeamType,
  type UserType,
  type VideoType,
} from "~/utils/types";
import PageTitle from "../../utils/page-title";
import AddCollectionsToPlay from "../add-collections-to-play";
import AddMentionsToPlayProps from "../add-mentions-to-play";
import AddTagsToPlay from "../add-tags-to-play";
import PlayModalBtn from "./button";
import PrivacyStatus from "./privacy-status";

type CreatePlayProps = {
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

export type CreateNewCollectionType = {
  title: string;
  id?: string;
  create?: boolean;
  label?: string;
  collection?: CollectionType;
  team?: TeamType | null;
  profile?: UserType;
};

const CreatePlay = ({
  player,
  video,
  setIsNewPlayOpen,
  isNewPlayOpen,
}: CreatePlayProps) => {
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
    post_to_feed: true,
  });
  const [mentions, setMentions] = useState<UserType[]>([]);
  const [players, setPlayers] = useState<UserType[] | null>(null);
  const [playTags, setPlayTags] = useState<CreateNewTagType[]>([]);
  const [tags, setTags] = useState<CreateNewTagType[] | null>(null);
  const [playCollections, setPlayCollections] = useState<
    CreateNewCollectionType[]
  >([]);
  const [collections, setCollections] = useState<
    CreateNewCollectionType[] | null
  >(null);

  const [isValidPlay, setIsValidPlay] = useState<boolean>(false);

  const fetchPlayers = async () => {
    const players = supabase.from("user_view").select("profile").match({
      "team->>id": video.exclusive_to,
      "affiliation->>verified": true,
    });
    const allPlayers = supabase.from("profiles").select();
    if (video.exclusive_to) {
      const { data } = await players;
      if (data) {
        const uniquePlayers = [
          ...new Map(data.map((x) => [x.profile.id, x])).values(),
        ];
        setPlayers(uniquePlayers.map((p) => p.profile));
      }
    } else {
      const { data } = await allPlayers;
      if (data) {
        const uniquePlayers = [...new Map(data.map((x) => [x.id, x])).values()];
        setPlayers(uniquePlayers);
      }
    }
  };

  const fetchTags = async () => {
    const tags = supabase.from("tags").select("title, id");
    if (affIds && affIds.length > 0) {
      void tags.or(`private.eq.false, exclusive_to.in.(${affIds})`);
    } else {
      void tags.eq("private", false);
    }

    const { data } = await tags;
    if (data) setTags(data);
  };

  const fetchCollections = async () => {
    if (user.userId) {
      const collections = supabase
        .from("collection_view")
        .select("*, id:collection->>id, title:collection->>title");
      if (affIds && affIds.length > 0) {
        void collections.or(
          `collection->>author_id.eq.${user.userId}, collection->>exclusive_to.in.(${affIds})`,
        );
      } else {
        void collections.eq("collection->>author_id", user.userId);
      }
      const { data } = await collections;
      if (data) setCollections(data);
    }
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
      post_to_feed: true,
    });
    setMentions([]);
    setPlayTags([]);
    setPlayCollections([]);
  };

  const handleMention = async (mention: UserType, play: PlayType) => {
    await supabase.from("play_mentions").insert({
      play_id: play.id,
      sender_id: `${user.userId}`,
      receiver_id: mention.id,
      receiver_name: mention.name,
      sender_name: user.name ? user.name : `${user.email}`,
    });
    if (mention.email !== user.email && mention.send_notifications) {
      await sendEmail({
        video: video,
        play: play,
        author: {
          name: `${user.name ? user.name : user.email!}`,
          email: user.email!,
        },
        title: `${
          user.name ? user.name : user.email!
        } mentioned you in a play!`,
        recipient: mention,
      });
    }
  };

  const handleTag = async (play: string, tag: string) => {
    await supabase.from("play_tags").insert({
      play_id: play,
      tag_id: tag,
    });
  };

  const handleCollection = async (play: string, collection: string) => {
    await supabase.from("collection_plays").insert({
      play_id: play,
      collection_id: collection,
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
          private: isPrivate,
          end_time_sort: playDetails.end!.toString().padStart(6, "0"),
          start_time_sort: playDetails.start!.toString().padStart(6, "0"),
          post_to_feed: playDetails.post_to_feed,
        })
        .select()
        .single();
      if (data) {
        mentions?.forEach((mention) => {
          void handleMention(mention, data);
        });
        if (playTags.length > 0) {
          playTags.forEach((tag) => {
            void handleTag(data.id, `${tag.id}`);
          });
        }
        if (playCollections.length > 0) {
          playCollections.forEach((col) => {
            void handleCollection(data.id, `${col.id}`);
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
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "collections" },
        () => {
          void fetchCollections();
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
    void fetchCollections();
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
          <AddTagsToPlay tags={playTags} setTags={setPlayTags} allTags={tags} />
          <AddMentionsToPlayProps
            players={players}
            setMentions={setMentions}
            mentions={mentions}
          />
          <AddCollectionsToPlay
            collections={playCollections}
            setCollections={setPlayCollections}
            allCollections={collections}
          />
          <div className="flex w-full justify-around gap-2">
            <div className="flex flex-col items-center justify-center md:flex-row md:gap-2">
              <div className="text-sm font-bold tracking-tight md:text-base">
                Highlight Play
              </div>
              <Switch
                checked={playDetails.highlight}
                className="items-center justify-center"
                color="secondary"
                sx={{ fontSize: { lg: "20px" }, lineHeight: { lg: "28px" } }}
                onChange={() =>
                  setPlayDetails({
                    ...playDetails,
                    highlight: !playDetails.highlight,
                  })
                }
              />
            </div>
            <Divider orientation="vertical" flexItem />
            <div className="flex flex-col items-center justify-center md:flex-row md:gap-2">
              <div className="text-sm font-bold tracking-tight md:text-base">
                Post to Home Page
              </div>
              <div className="flex items-center justify-center">
                <Switch
                  checked={playDetails.post_to_feed}
                  className="items-center justify-center"
                  sx={{ fontSize: { lg: "20px" }, lineHeight: { lg: "28px" } }}
                  onChange={() =>
                    setPlayDetails({
                      ...playDetails,
                      post_to_feed: !playDetails.post_to_feed,
                    })
                  }
                />
                <Tooltip
                  title={`Indicates whether this play will be posted to your feed. If not clicked the play will be indexed to this video but will not clog your feed.`}
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
            </div>
          </div>
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

export default CreatePlay;
