import {
  Box,
  Divider, // Still needed for the ListItemText in PlayActionsMenu
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
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

type EditPlayProps = {
  video: VideoType;
  play: PlayType;
  // These props are now mandatory as EditPlay is always controlled by PlayActionsMenu
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
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

const EditPlay = ({
  play,
  video,
  isOpen, // Mandatory prop
  setIsOpen, // Mandatory prop
}: EditPlayProps) => {
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
  }, [play]);

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
  }, [video.exclusive_to]);

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
  }, [play]);

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
  }, [affIds]);

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
          })),
        );
        setPlayCollections(
          data.map((p) => ({
            title: p.collections!.title,
            id: p.collections!.id,
          })),
        );
      } else {
        setInitialPlayCollections([]);
        setPlayCollections([]);
      }
    }
  }, [play]);

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
  }, [user.userId, affIds]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPlayDetails({
      ...playDetails,
      [name]: value,
    });
  };

  const resetPlay = useCallback(async () => {
    setIsOpen(false); // Use the prop setIsOpen to close the modal
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
    await fetchInitialMentions();
    await fetchInitialTags();
    await fetchInitialCollections();
    setMessage({ text: undefined, status: "error" });
  }, [
    play,
    setIsOpen,
    fetchInitialMentions,
    fetchInitialTags,
    fetchInitialCollections,
  ]);

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
  }, [initialMentions, mentions, play.id]);

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
  }, [initialPlayTags, playTags, play.id]);

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
  }, [initialPlayCollections, playCollections, play.id]);

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
          void handleMention(mention, data);
        });
        handleRemoveTags();
        if (playTags.length > 0) {
          playTags.forEach((tag) => {
            void handleTag(data.id, `${tag.id}`);
          });
        }
        handleRemoveCollections();
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

  const checkForUnEdited = useCallback(() => {
    const note = playDetails.note === "" ? null : playDetails.note;
    const exclusive =
      playDetails.exclusive_to === "public" ? null : playDetails.exclusive_to;
    const sameMentions =
      JSON.stringify(mentions.map((m) => m.id).sort()) ===
      JSON.stringify(initialMentions.map((m) => m.id).sort());
    const sameTags =
      JSON.stringify(playTags.map((t) => t.id).sort()) ===
      JSON.stringify(initialPlayTags.map((t) => t.id).sort());
    const sameCollections =
      JSON.stringify(playCollections.map((c) => c.id).sort()) ===
      JSON.stringify(initialPlayCollections.map((c) => c.id).sort());
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
  ]);

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
  }, [playDetails.title, checkForUnEdited]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isValidPlay) {
      if (video.private || playDetails.private) void editPlay(true);
      else {
        void editPlay(false);
      }
    } else {
      updateErrorMessage();
    }
  };

  // useEffect(() => {
  //   const channel = supabase
  //     .channel("edit_play_tags_and_collections")
  //     .on(
  //       "postgres_changes",
  //       { event: "*", schema: "public", table: "tags" },
  //       () => {
  //         void fetchTags();
  //       },
  //     )
  //     .on(
  //       "postgres_changes",
  //       { event: "*", schema: "public", table: "collections" },
  //       () => {
  //         void fetchCollections();
  //       },
  //     )
  //     .subscribe();

  //   return () => {
  //     void supabase.removeChannel(channel);
  //   };
  // }, [fetchTags, fetchCollections]);

  useEffect(() => {
    void fetchPlayers();
    void fetchTags();
    void fetchCollections();
  }, [video, fetchPlayers, fetchTags, fetchCollections]);

  useEffect(() => {
    // Only fetch initial data when modal opens
    if (isOpen) {
      // Use 'isOpen' prop directly
      void fetchInitialCollections();
      void fetchInitialTags();
      void fetchInitialMentions();
    }
  }, [
    isOpen, // Dependency
    fetchInitialCollections,
    fetchInitialTags,
    fetchInitialMentions,
  ]);

  useEffect(() => {
    updateErrorMessage();
  }, [playDetails, playTags, playCollections, mentions, updateErrorMessage]);

  // If the modal is not open, render null.
  // EditPlay will ONLY render its modal content when 'isOpen' is true.
  if (!isOpen) {
    return null;
  }

  // Otherwise (if isOpen is true), render the ModalSkeleton.
  return (
    <ModalSkeleton
      title="Edit Play"
      isOpen={isOpen} // Use the prop directly
      setIsOpen={setIsOpen} // Use the prop directly
      handleClose={resetPlay}
    >
      <Box
        component="form"
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
            width: { xs: "100%", sm: "80%" },
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            px: 2,
            pt: 2,
            textAlign: "center",
          }}
        >
          <TextField
            sx={{ width: "100%" }}
            name="title"
            autoComplete="title"
            required
            id="title"
            label="Title (100 characters max)"
            onChange={handleInput}
            value={playDetails.title}
            inputProps={{ maxLength: 100 }}
            size="small"
            multiline
          />
          <TextField
            sx={{ width: "100%" }}
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
            refetchTags={fetchTags}
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
            refetchCollections={fetchCollections}
          />
          <Box
            sx={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: { xs: "center", md: "space-around" },
              gap: { xs: 4, md: 0 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: "center",
                justifyContent: "center",
                gap: { xs: 0, md: 2 },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "bold",
                  letterSpacing: "-0.025em",
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
                  flexDirection: { xs: "column", md: "row" },
                  alignItems: "center",
                  justifyContent: "center",
                  gap: { xs: 0, md: 2 },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: "bold",
                    letterSpacing: "-0.025em",
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
