import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import {
  Box,
  Divider,
  IconButton,
  Switch,
  TextField, // Import Box
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react"; // Import useCallback
import type { YouTubePlayer } from "react-youtube";
import ModalSkeleton from "~/components/utils/modal";
import FormButtons from "~/components/utils/modal/form-buttons";
import { useAuthContext } from "~/contexts/auth";
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
  scrollToPlayer: () => void;
  onPlayCreated: () => void;
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
  scrollToPlayer,
  onPlayCreated,
}: CreatePlayProps) => {
  const router = useRouter();
  const { user, affIds } = useAuthContext();

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

  const [draftedPlay, setDraftedPlay] = useState<boolean>(false);
  const [isValidPlay, setIsValidPlay] = useState<boolean>(false);

  // Memoized fetchPlayers
  const fetchPlayers = useCallback(async () => {
    const playersQuery = supabase.from("user_view").select("profile").match({
      "team->>id": video.exclusive_to,
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

  // Memoized fetchTags
  const fetchTags = useCallback(async () => {
    const tagsQuery = supabase
      .from("tags")
      .select("title, id, private, exclusive_to"); // Select needed fields
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

  // Memoized fetchCollections
  const fetchCollections = useCallback(async () => {
    if (user.userId) {
      const collectionsQuery = supabase
        .from("collection_view")
        .select(
          "*, id:collection->>id, title:collection->>title, private:collection->>private, exclusive_to:collection->>exclusive_to",
        ); // Select needed fields
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

  const startPlay = async () => {
    scrollToPlayer();
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

  const handleClose = () => {
    void resetPlay();
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
        void onPlayCreated();
      }
    }
  };

  const checkValidPlay = useCallback(() => {
    if (
      typeof playDetails.end !== "number" ||
      typeof playDetails.start !== "number" ||
      playDetails.title === ""
    ) {
      setIsValidPlay(false);
    } else {
      setIsValidPlay(true);
    }
  }, [playDetails.end, playDetails.start, playDetails.title]);

  const checkDraftedPlay = useCallback(() => {
    if (
      typeof playDetails.end === "number" &&
      typeof playDetails.start === "number"
    ) {
      setDraftedPlay(true);
    } else {
      setDraftedPlay(false);
    }
  }, [playDetails.end, playDetails.start]);

  const handleTimeAdjustment = async (
    time: "start" | "end",
    increment: boolean,
  ) => {
    const videoLength = await player?.getDuration();
    const playStart = playDetails.start;
    const playEnd = playDetails.end;
    const adjustEnd = playStart! + 1 === playEnd;
    const adjustStart = playEnd! - 1 === playStart;
    const startMin = playStart === 0;
    const startMax = playStart === videoLength! - 1;
    const endMin = playEnd === 1;
    const endMax = playEnd === videoLength!;

    if (time === "start") {
      if (increment) {
        if (startMax) return;
        if (adjustEnd) {
          setPlayDetails({
            ...playDetails,
            end: playEnd ? playEnd + 1 : 1,
            start: playStart ? playStart + 1 : 1,
          });
        } else {
          setPlayDetails({
            ...playDetails,
            start: playStart ? playStart + 1 : 1,
          });
        }
      } else {
        if (startMin) return;
        else
          setPlayDetails({
            ...playDetails,
            start: playStart ? playStart - 1 : 0,
          });
      }
    } else {
      if (!increment) {
        if (endMin) return;
        if (adjustStart) {
          setPlayDetails({
            ...playDetails,
            end: playEnd ? playEnd - 1 : 1,
            start: playStart ? playStart - 1 : 0,
          });
        } else {
          setPlayDetails({
            ...playDetails,
            end: playEnd ? playEnd - 1 : 1,
          });
        }
      } else {
        if (endMax) return;
        else
          setPlayDetails({
            ...playDetails,
            end: playEnd ? playEnd + 1 : 1,
          });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (video.private || playDetails.private) void createPlay(true);
    else {
      void createPlay(false);
    }
    // After creating a play, ensure all dropdowns are refreshed
    void fetchTags();
    void fetchCollections();
    void resetPlay();
  };

  useEffect(() => {
    const channel = supabase
      .channel("tag_and_collection_changes") // Combined channel for tags and collections
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
    checkValidPlay();
    checkDraftedPlay();
  }, [playDetails, checkValidPlay, checkDraftedPlay]);

  useEffect(() => {
    void fetchPlayers();
    void fetchTags();
    void fetchCollections();
  }, [video, fetchPlayers, fetchTags, fetchCollections]);

  return !isNewPlayOpen ? (
    <PlayModalBtn
      isPlayStarted={isPlayStarted}
      startPlay={startPlay}
      endPlay={endPlay}
      scrollToPlayer={scrollToPlayer}
      setIsOpen={setIsNewPlayOpen}
      draftedPlay={draftedPlay}
    />
  ) : (
    <ModalSkeleton
      isOpen={isNewPlayOpen}
      setIsOpen={setIsNewPlayOpen}
      handleClose={handleClose}
      title="Create New Play"
      minimize={true}
    >
      <Box
        component="form" // Use Box as a form element
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          width: "100%",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            width: { xs: "100%", sm: "80%" }, // Equivalent to w-4/5
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            px: 2,
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                START
              </Typography>
              <Typography variant="body1">
                {playDetails.start
                  ? playDetails.start < 3600
                    ? new Date(playDetails.start * 1000)
                        .toISOString()
                        .substring(14, 19)
                    : new Date(playDetails.start * 1000)
                        .toISOString()
                        .substring(11, 19)
                  : "00:00"}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <IconButton
                  onClick={() => handleTimeAdjustment("start", true)}
                  size="small"
                  sx={{ padding: "0px", margin: "0px" }}
                >
                  <ArrowDropUpIcon />
                </IconButton>
                <IconButton
                  sx={{ padding: "0px", margin: "0px" }}
                  size="small"
                  onClick={() => handleTimeAdjustment("start", false)}
                >
                  <ArrowDropDownIcon />
                </IconButton>
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                END
              </Typography>
              <Typography variant="body1">
                {playDetails.end
                  ? playDetails.end < 3600
                    ? new Date(playDetails.end * 1000)
                        .toISOString()
                        .substring(14, 19)
                    : new Date(playDetails.end * 1000)
                        .toISOString()
                        .substring(11, 19)
                  : "00:00"}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <IconButton
                  onClick={() => handleTimeAdjustment("end", true)}
                  size="small"
                  sx={{ padding: "0px", margin: "0px" }}
                >
                  <ArrowDropUpIcon />
                </IconButton>
                <IconButton
                  sx={{ padding: "0px", margin: "0px" }}
                  size="small"
                  onClick={() => handleTimeAdjustment("end", false)}
                >
                  <ArrowDropDownIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>
          <TextField
            sx={{ width: "100%" }} // Equivalent to w-full
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
            sx={{ width: "100%" }} // Equivalent to w-full
            name="note"
            autoComplete="note"
            id="note"
            label="Note"
            onChange={handleInput}
            value={playDetails.note}
            multiline
            maxRows={5}
            size="small"
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
              justifyContent: { xs: "center", md: "space-around" }, // Equivalent to justify-center md:justify-around
              gap: { xs: 4, md: 0 }, // Equivalent to gap-4 md:gap-0
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" }, // Equivalent to flex-col md:flex-row
                alignItems: "center",
                justifyContent: "center",
                gap: { xs: 0, md: 2 }, // Equivalent to gap-2
              }}
            >
              <Typography
                variant="body2" // Changed to body2 for text-sm/text-base
                sx={{
                  fontWeight: "bold",
                  letterSpacing: "-0.025em", // Equivalent to tracking-tight
                }}
              >
                Highlight Play
              </Typography>
              <Switch
                checked={playDetails.highlight}
                color="secondary"
                sx={{ fontSize: { lg: "20px" }, lineHeight: { lg: "28px" } }} // This sx might be problematic for Switch size
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
                  variant="body2" // Changed to body2 for text-sm/text-base
                  sx={{
                    fontWeight: "bold",
                    letterSpacing: "-0.025em",
                  }}
                >
                  Post to Home Page
                </Typography>
                <Switch
                  checked={playDetails.post_to_feed}
                  color="primary" // Changed color for contrast
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
        <Typography
          sx={{
            fontWeight: "bold",
            letterSpacing: "-0.025em",
            px: 2,
            textAlign: "center",
            fontSize: "10px",
          }}
          variant="button"
        >
          *Once submitted you will not be able to adjust the timestamp of the
          clip!*
        </Typography>
        <FormButtons
          isValid={isValidPlay}
          handleCancel={handleClose}
          submitTitle="SUBMIT"
        />
      </Box>
    </ModalSkeleton>
  );
};

export default CreatePlay;
