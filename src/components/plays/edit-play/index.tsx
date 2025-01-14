import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Divider, IconButton, Switch, TextField, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import FormMessage from "~/components/utils/form-message";
import ModalSkeleton from "~/components/utils/modal";
import FormButtons from "~/components/utils/modal/form-buttons";
import { useAuthContext } from "~/contexts/auth";
import sendEmail from "~/utils/send-email";
import { supabase } from "~/utils/supabase";
import {
  type CollectionType,
  type MessageType,
  type NewPlayType,
  type PlayType,
  type TeamType,
  type UserType,
  type VideoType,
} from "~/utils/types";
import AddCollectionsToPlay from "../add-collections-to-play";
import AddMentionsToPlayProps from "../add-mentions-to-play";
import AddTagsToPlay from "../add-tags-to-play";
import PrivacyStatus from "../create-play/privacy-status";

type CreatePlayProps = {
  video: VideoType;
  play: PlayType;
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

const EditPlay = ({ play, video }: CreatePlayProps) => {
  const { user, affIds } = useAuthContext();

  const [playDetails, setPlayDetails] = useState<NewPlayType>({
    title: play.title,
    note: play.note ?? "",
    highlight: play.highlight,
    start: play.start_time,
    end: play.end_time,
    private: play.private,
    exclusive_to: play.exclusive_to ? play.exclusive_to : "public",
    post_to_feed: play.post_to_feed,
  });
  const [mentions, setMentions] = useState<UserType[]>([]);
  const [initialMentions, setInitialMentions] = useState<UserType[]>([]);
  const [players, setPlayers] = useState<UserType[] | null>(null);

  const [playTags, setPlayTags] = useState<CreateNewTagType[]>([]);
  const [initialPlayTags, setInitialPlayTags] = useState<CreateNewTagType[]>(
    [],
  );
  const [tags, setTags] = useState<CreateNewTagType[] | null>(null);

  const [playCollections, setPlayCollections] = useState<
    CreateNewCollectionType[]
  >([]);
  const [initialPlayCollections, setInitialPlayCollections] = useState<
    CreateNewCollectionType[]
  >([]);
  const [collections, setCollections] = useState<
    CreateNewCollectionType[] | null
  >(null);

  const [message, setMessage] = useState<MessageType>({
    text: undefined,
    status: "error",
  });
  const [isEditPlayOpen, setIsEditPlayOpen] = useState<boolean>(false);
  const [isValidPlay, setIsValidPlay] = useState<boolean>(false);

  const fetchInitialMentions = async () => {
    if (play) {
      const { data } = await supabase
        .from("play_mention_view")
        .select()
        .eq("play->>id", play.id);
      if (data) {
        setInitialMentions(data.map((p) => p.receiver));
        setMentions(data.map((p) => p.receiver));
      } else {
        setInitialMentions([]);
        setMentions([]);
      }
    }
  };

  const fetchPlayers = async () => {
    const players = supabase.from("user_view").select("profile").match({
      "team->>id": video.exclusive_to,
      "affiliation->>role": "player",
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

  const fetchInitialTags = async () => {
    if (play) {
      const { data } = await supabase
        .from("play_tags")
        .select("tags!inner(title, id)")
        .eq("play_id", play.id);
      if (data) {
        setInitialPlayTags(data.map((p) => p.tags!));
        setPlayTags(data.map((p) => p.tags!));
      } else {
        setInitialPlayTags([]);
        setPlayTags([]);
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

  const fetchInitialCollections = async () => {
    if (play) {
      const { data } = await supabase
        .from("collection_plays")
        .select("collections!inner(title, id)")
        .eq("play_id", play.id);
      if (data) {
        setInitialPlayCollections(data.map((p) => p.collections!));
        setPlayCollections(data.map((p) => p.collections!));
      } else {
        setInitialPlayCollections([]);
        setPlayCollections([]);
      }
    }
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

  const resetPlay = async () => {
    setIsEditPlayOpen(false);
    setPlayDetails({
      title: play.title,
      note: play.note ?? "",
      highlight: play.highlight,
      start: play.start_time,
      end: play.end_time,
      private: play.private,
      exclusive_to: play.exclusive_to ? play.exclusive_to : "public",
      post_to_feed: play.post_to_feed,
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
    const alreadyEmailed = initialMentions.find((v) => v.id === mention.id);
    if (
      mention.email !== user.email &&
      mention.send_notifications &&
      !alreadyEmailed
    ) {
      await sendEmail({
        video: video,
        play: play,
        title: `${mention.name} mentioned you in a play!`,
        author: {
          name: user.name ? user.name : user.email!,
          email: user.email!,
        },
        recipient: mention,
      });
    }
  };

  const handleDeleteMention = async (mentionId: string) => {
    await supabase.from("play_mentions").delete().match({
      play_id: play.id,
      receiver_id: mentionId,
    });
  };

  const handleRemoveMentions = () => {
    initialMentions.forEach((m1) => {
      const isIncluded = mentions.find((m2) => m2.id === m1.id);
      if (!isIncluded) {
        void handleDeleteMention(m1.id);
      }
    });
  };

  const handleTag = async (play: string, tag: string) => {
    await supabase.from("play_tags").insert({
      play_id: play,
      tag_id: tag,
    });
  };

  const handleDeleteTag = async (tagId: string | undefined) => {
    if (tagId) {
      await supabase.from("play_tags").delete().match({
        play_id: play.id,
        tag_id: tagId,
      });
    }
  };

  const handleRemoveTags = () => {
    initialPlayTags.forEach((t1) => {
      const isIncluded = playTags.find((t2) => t2.id === t1.id);
      if (!isIncluded) {
        void handleDeleteTag(t1.id);
      }
    });
  };

  const handleCollection = async (play: string, collection: string) => {
    await supabase.from("collection_plays").insert({
      play_id: play,
      collection_id: collection,
    });
  };

  const handleDeleteCollection = async (collectionId: string | undefined) => {
    if (collectionId) {
      await supabase.from("collection_plays").delete().match({
        play_id: play.id,
        collection_id: collectionId,
      });
    }
  };

  const handleRemoveCollections = () => {
    initialPlayCollections.forEach((c1) => {
      const isIncluded = playCollections.find((c2) => c2.id === c1.id);
      if (!isIncluded) {
        void handleDeleteCollection(c1.id);
      }
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

  const editPlay = async (isPrivate: boolean) => {
    if (user.userId) {
      const { data } = await supabase
        .from("plays")
        .update({
          exclusive_to: isPrivate ? playDetails.exclusive_to : null,
          author_id: user.userId,
          video_id: video.id,
          highlight: playDetails.highlight,
          title: playDetails.title,
          note: playDetails.note === "" ? null : playDetails.note,
          start_time: playDetails.start!,
          end_time: playDetails.end!,
          private: isPrivate,
          post_to_feed: playDetails.post_to_feed,
        })
        .eq("id", play.id)
        .select()
        .single();
      if (data) {
        handleRemoveMentions();
        mentions.forEach((mention) => {
          void handleMention(mention, play);
        });
        handleRemoveTags();
        if (playTags.length > 0) {
          playTags.forEach((tag) => {
            void handleTag(play.id, `${tag.id}`);
          });
        }
        handleRemoveCollections();
        if (playCollections.length > 0) {
          playCollections.forEach((col) => {
            void handleCollection(play.id, `${col.id}`);
          });
        }
        void updateLastWatched();
        void resetPlay();
      }
    }
  };

  const checkForUnEdited = () => {
    const note = playDetails.note === "" ? null : playDetails.note;
    const exclusive =
      playDetails.exclusive_to === "public" ? null : playDetails.exclusive_to;
    const sameMentions =
      JSON.stringify(mentions.map((m) => m.id)) ===
      JSON.stringify(initialMentions.map((m) => m.id));
    const sameTags =
      JSON.stringify(playTags.map((t) => t.id)) ===
      JSON.stringify(initialPlayTags.map((t) => t.id));
    const sameCollections =
      JSON.stringify(playCollections.map((c) => c.id)) ===
      JSON.stringify(initialPlayCollections.map((c) => c.id));
    if (
      note === play.note &&
      exclusive === play.exclusive_to &&
      playDetails.private === play.private &&
      playDetails.highlight === play.highlight &&
      playDetails.title === play.title &&
      playDetails.post_to_feed === play.post_to_feed &&
      sameMentions &&
      sameTags &&
      sameCollections
    ) {
      return true;
    } else return false;
  };

  const updateErrorMessage = () => {
    const { title } = playDetails;
    const isUnedited = checkForUnEdited();
    if (!isValidPlay) {
      if (title === "") {
        setMessage({
          status: "error",
          text: "Please enter a valid title!",
        });
        setIsValidPlay(false);
      } else if (isUnedited) {
        setMessage({
          status: "error",
          text: "Please make an edit before submitting!",
        });
        setIsValidPlay(false);
      } else {
        setMessage({ status: "error", text: undefined });
        setIsValidPlay(true);
      }
    } else {
      if (isUnedited) {
        setMessage({
          status: "error",
          text: "Please make an edit before submitting!",
        });
        setIsValidPlay(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (video.private || playDetails.private) void editPlay(true);
    else {
      void editPlay(false);
    }
    void resetPlay();
  };

  useEffect(() => {
    const channel = supabase
      .channel("tag_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "play_tags" },
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
    void fetchPlayers();
    void fetchTags();
    void fetchCollections();
  }, [video]);

  useEffect(() => {
    void fetchInitialCollections();
    void fetchInitialTags();
    void fetchInitialMentions();
  }, [isEditPlayOpen]);

  useEffect(() => {
    void updateErrorMessage();
  }, [playDetails, playTags, playCollections, mentions]);

  return !isEditPlayOpen ? (
    <div
      className="text-sm font-bold tracking-tight"
      onClick={() => setIsEditPlayOpen(true)}
    >
      EDIT PLAY
    </div>
  ) : (
    <ModalSkeleton
      title="Edit Play"
      isOpen={isEditPlayOpen}
      setIsOpen={setIsEditPlayOpen}
    >
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col items-center gap-2"
      >
        <div className="flex w-4/5 flex-col items-center justify-center gap-4 p-4 text-center">
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
          <div className="flex gap-2">
            <div className="flex items-center justify-center">
              <div className="text-lg font-bold tracking-tight">
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
            <div className="flex items-center justify-center gap-2">
              <div className="text-lg font-bold tracking-tight">
                Post to Home Page
              </div>
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
          <PrivacyStatus
            video={video}
            newDetails={playDetails}
            setNewDetails={setPlayDetails}
          />
        </div>
        <FormMessage message={message} />
        <FormButtons
          handleCancel={resetPlay}
          submitTitle="SUBMIT"
          isValid={isValidPlay}
        />
      </form>
    </ModalSkeleton>
  );
};

export default EditPlay;
