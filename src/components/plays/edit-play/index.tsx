import CreateIcon from "@mui/icons-material/Create";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Box, // Import Box
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react"; // Import useCallback
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
import PrivacyStatus from "../create-play/privacy-status"; // Keep PrivacyStatus import

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

  const fetchInitialMentions = useCallback(async () => {
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
  }, [play]); // Dependency: play

  const fetchPlayers = useCallback(async () => {
    const playersQuery = supabase.from("user_view").select("profile").match({
      "team->>id": video.exclusive_to,
      "affiliation->>role": "player",
      "affiliation->>verified": true,
    });
    const allPlayersQuery = supabase.from("profiles").select();
    if (video.exclusive_to) {
      const { data } = await playersQuery;
      if (data) {
        const uniquePlayers = [
          ...new Map(data.map((x) => [x.profile.id, x])).values(),
        ];
        setPlayers(uniquePlayers.map((p) => p.profile));
      }
    } else {
      const { data } = await allPlayersQuery;
      if (data) {
        const uniquePlayers = [...new Map(data.map((x) => [x.id, x])).values()];
        setPlayers(uniquePlayers);
      }
    }
  }, [video.exclusive_to]); // Dependency: video.exclusive_to

  const fetchInitialTags = useCallback(async () => {
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
  }, [play]); // Dependency: play

  const fetchTags = useCallback(async () => {
    const tagsQuery = supabase.from("tags").select("title, id");
    if (affIds && affIds.length > 0) {
      void tagsQuery.or(
        `private.eq.false, exclusive_to.in.(${affIds.join(",")})`,
      );
    } else {
      void tagsQuery.eq("private", false);
    }

    const { data } = await tagsQuery;
    if (data) setTags(data);
  }, [affIds]); // Dependency: affIds

  const fetchInitialCollections = useCallback(async () => {
    if (play) {
      const { data } = await supabase
        .from("collection_plays")
        .select("collections!inner(title, id)")
        .eq("play_id", play.id);
      if (data) {
        setInitialPlayCollections(
          data.map((p) => ({
            title: p.collections!.title,
            id: p.collections!.id,
            // Add other required properties for CreateNewCollectionType if missing from select
            // For example, if you need `collection`, `team`, `profile` here, you'd need to adjust the select or
            // fetch additional data to fully construct these objects.
          })),
        );
        setPlayCollections(
          data.map((p) => ({
            title: p.collections!.title,
            id: p.collections!.id,
            // Same note as above
          })),
        );
      } else {
        setInitialPlayCollections([]);
        setPlayCollections([]);
      }
    }
  }, [play]); // Dependency: play

  const fetchCollections = useCallback(async () => {
    if (user.userId) {
      const collectionsQuery = supabase
        .from("collection_view")
        .select("*, id:collection->>id, title:collection->>title");
      if (affIds && affIds.length > 0) {
        void collectionsQuery.or(
          `collection->>author_id.eq.${
            user.userId
          }, collection->>exclusive_to.in.(${affIds.join(",")})`,
        );
      } else {
        void collectionsQuery.eq("collection->>author_id", user.userId);
      }
      const { data } = await collectionsQuery;
      if (data) setCollections(data);
    }
  }, [user.userId, affIds]); // Dependencies: user.userId, affIds

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPlayDetails({
      ...playDetails,
      [name]: value,
    });
  };

  const resetPlay = useCallback(async () => {
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
    setMentions([]); // Resetting these here is fine for UI but actual reset happens after fetchInitial*
    setPlayTags([]);
    setPlayCollections([]);
    // Re-fetch initial state to truly reset to the original play data
    await fetchInitialMentions();
    await fetchInitialTags();
    await fetchInitialCollections();
  }, [play, fetchInitialMentions, fetchInitialTags, fetchInitialCollections]); // Dependencies for useCallback

  const handleMention = async (mention: UserType, currentPlay: PlayType) => {
    await supabase.from("play_mentions").insert({
      play_id: currentPlay.id,
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
        play: currentPlay,
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

  const handleRemoveMentions = useCallback(() => {
    initialMentions.forEach((m1) => {
      const isIncluded = mentions.find((m2) => m2.id === m1.id);
      if (!isIncluded) {
        void handleDeleteMention(m1.id);
      }
    });
  }, [initialMentions, mentions, play.id]); // Dependencies for useCallback

  const handleTag = async (playId: string, tagId: string) => {
    await supabase.from("play_tags").insert({
      play_id: playId,
      tag_id: tagId,
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

  const handleRemoveTags = useCallback(() => {
    initialPlayTags.forEach((t1) => {
      const isIncluded = playTags.find((t2) => t2.id === t1.id);
      if (!isIncluded) {
        void handleDeleteTag(t1.id);
      }
    });
  }, [initialPlayTags, playTags, play.id]); // Dependencies for useCallback

  const handleCollection = async (playId: string, collectionId: string) => {
    await supabase.from("collection_plays").insert({
      play_id: playId,
      collection_id: collectionId,
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

  const handleRemoveCollections = useCallback(() => {
    initialPlayCollections.forEach((c1) => {
      const isIncluded = playCollections.find((c2) => c2.id === c1.id);
      if (!isIncluded) {
        void handleDeleteCollection(c1.id);
      }
    });
  }, [initialPlayCollections, playCollections, play.id]); // Dependencies for useCallback

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
      const { data, error } = await supabase
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
      if (error) {
        console.error("Error updating play:", error);
        setMessage({ status: "error", text: "Failed to update play." });
        return;
      }
      if (data) {
        handleRemoveMentions();
        mentions.forEach((mention) => {
          void handleMention(mention, data); // Pass 'data' (updated play)
        });
        handleRemoveTags();
        if (playTags.length > 0) {
          playTags.forEach((tag) => {
            void handleTag(data.id, `${tag.id}`); // Pass 'data.id'
          });
        }
        handleRemoveCollections();
        if (playCollections.length > 0) {
          playCollections.forEach((col) => {
            void handleCollection(data.id, `${col.id}`); // Pass 'data.id'
          });
        }
        void updateLastWatched();
        void resetPlay();
      }
    }
  };

  const checkForUnEdited = useCallback(() => {
    const note = playDetails.note === "" ? null : playDetails.note;
    const exclusive =
      playDetails.exclusive_to === "public" ? null : playDetails.exclusive_to;
    const sameMentions =
      JSON.stringify(mentions.map((m) => m.id).sort()) ===
      JSON.stringify(initialMentions.map((m) => m.id).sort()); // Added sort for consistent comparison
    const sameTags =
      JSON.stringify(playTags.map((t) => t.id).sort()) ===
      JSON.stringify(initialPlayTags.map((t) => t.id).sort()); // Added sort
    const sameCollections =
      JSON.stringify(playCollections.map((c) => c.id).sort()) ===
      JSON.stringify(initialPlayCollections.map((c) => c.id).sort()); // Added sort
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
  }, [
    playDetails,
    play,
    mentions,
    initialMentions,
    playTags,
    initialPlayTags,
    playCollections,
    initialPlayCollections,
  ]); // Dependencies for useCallback

  const updateErrorMessage = useCallback(() => {
    const { title } = playDetails;
    const isUnedited = checkForUnEdited();

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
  }, [playDetails.title, checkForUnEdited]); // Dependencies for useCallback

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Only attempt to edit if the form is valid
    if (isValidPlay) {
      if (video.private || playDetails.private) void editPlay(true);
      else {
        void editPlay(false);
      }
      // fetchTags and fetchCollections are handled by the realtime subscription already
      // resetPlay is called within editPlay on success
    } else {
      updateErrorMessage(); // Show the message if submission is attempted when invalid
    }
  };

  useEffect(() => {
    // These channels are likely handled in a more global context (e.g., in CreatePlay)
    // or need to be specific to this component's needs if not updating globally.
    // Given the request, keeping them as is for now.
    const channel = supabase
      .channel("edit_play_tags_and_collections") // Unique channel name
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
  }, [fetchTags, fetchCollections]); // Dependencies: memoized fetch functions

  useEffect(() => {
    void fetchPlayers();
    void fetchTags();
    void fetchCollections();
  }, [video, fetchPlayers, fetchTags, fetchCollections]); // Dependencies: video, and memoized fetch functions

  useEffect(() => {
    // These fetches are only needed when the modal opens
    if (isEditPlayOpen) {
      void fetchInitialCollections();
      void fetchInitialTags();
      void fetchInitialMentions();
    }
  }, [
    isEditPlayOpen,
    fetchInitialCollections,
    fetchInitialTags,
    fetchInitialMentions,
  ]); // Dependencies

  useEffect(() => {
    updateErrorMessage();
  }, [playDetails, playTags, playCollections, mentions, updateErrorMessage]); // Added updateErrorMessage as dependency

  return !isEditPlayOpen ? (
    <Box
      sx={{ display: "flex", alignItems: "center", cursor: "pointer" }} // Added cursor pointer
      onClick={() => setIsEditPlayOpen(true)}
    >
      <ListItemIcon sx={{ minWidth: "12px" }}>
        <CreateIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography variant="body2" fontWeight={"bold"}>
            Edit Play
          </Typography>
        }
      />
    </Box>
  ) : (
    <ModalSkeleton
      title="Edit Play"
      isOpen={isEditPlayOpen}
      setIsOpen={setIsEditPlayOpen}
      handleClose={resetPlay}
    >
      <Box
        component="form" // Use Box as a form element
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          width: "100%",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            width: { xs: "100%", sm: "80%" }, // w-full / w-4/5
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            p: 2,
            textAlign: "center",
          }}
        >
          <TextField
            sx={{ width: "100%" }} // w-full
            name="title"
            autoComplete="title"
            required
            id="title"
            label="Title (100 characters max)"
            onChange={handleInput}
            value={playDetails.title}
            inputProps={{ maxLength: 100 }}
            size="small"
          />
          <TextField
            sx={{ width: "100%" }} // w-full
            name="note"
            autoComplete="note"
            id="note"
            label="Note"
            onChange={handleInput}
            value={playDetails.note}
            multiline
            maxRows={5}
          />
          <AddTagsToPlay
            tags={playTags}
            setTags={setPlayTags}
            allTags={tags}
            refetchTags={fetchTags} // Pass refetch callback
          />
          <AddMentionsToPlayProps
            players={players}
            setMentions={setMentions}
            mentions={mentions}
          />
          <AddCollectionsToPlay
            collections={playCollections}
            setCollections={setPlayCollections}
            allCollections={collections}
            refetchCollections={fetchCollections} // Pass refetch callback
          />
          <Box
            sx={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: { xs: "center", md: "space-around" }, // justify-center md:justify-around
              gap: { xs: 4, md: 0 }, // gap-4 md:gap-0
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" }, // flex-col md:flex-row
                alignItems: "center",
                justifyContent: "center",
                gap: { xs: 0, md: 2 }, // gap-2
              }}
            >
              <Typography
                variant="body2" // text-sm md:text-base
                sx={{
                  fontWeight: "bold", // font-bold
                  letterSpacing: "-0.025em", // tracking-tight
                }}
              >
                Highlight Play
              </Typography>
              <Switch
                checked={playDetails.highlight}
                color="secondary"
                sx={{ fontSize: { lg: "20px" }, lineHeight: { lg: "28px" } }}
                onChange={() =>
                  setPlayDetails({
                    ...playDetails,
                    highlight: !playDetails.highlight,
                  })
                }
                size="small"
              />
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" }, // flex-col md:flex-row
                  alignItems: "center",
                  justifyContent: "center",
                  gap: { xs: 0, md: 2 }, // gap-2
                }}
              >
                <Typography
                  variant="body2" // text-sm md:text-base
                  sx={{
                    fontWeight: "bold", // font-bold
                    letterSpacing: "-0.025em", // tracking-tight
                  }}
                >
                  Post to Home Page
                </Typography>
                <Switch
                  checked={playDetails.post_to_feed}
                  color="primary"
                  sx={{ fontSize: { lg: "20px" }, lineHeight: { lg: "28px" } }}
                  onChange={() =>
                    setPlayDetails({
                      ...playDetails,
                      post_to_feed: !playDetails.post_to_feed,
                    })
                  }
                  size="small"
                />
              </Box>
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
            </Box>
          </Box>
          <PrivacyStatus
            video={video}
            newDetails={playDetails}
            setNewDetails={setPlayDetails}
          />
        </Box>
        <FormMessage message={message} />
        <FormButtons
          handleCancel={resetPlay}
          submitTitle="SUBMIT"
          isValid={isValidPlay}
        />
      </Box>
    </ModalSkeleton>
  );
};

export default EditPlay;
