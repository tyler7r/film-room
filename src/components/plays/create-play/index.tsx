import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import CloseIcon from "@mui/icons-material/Close";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import LaunchIcon from "@mui/icons-material/Launch";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import type { YouTubePlayer } from "react-youtube";
import FormButtons from "~/components/utils/modal/form-buttons";
import { useAuthContext } from "~/contexts/auth";
import { getDisplayName } from "~/utils/helpers";
import sendEmail from "~/utils/send-email";
import { supabase } from "~/utils/supabase";
import {
  type CollectionType,
  type NewPlayType,
  type PlayPreviewType,
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

// --- REUSABLE MODAL SKELETON COMPONENT ---

type ModalSkeletonProps = {
  isOpen: boolean;
  setIsOpen: (status: boolean) => void;
  handleClose?: () => void; // Discard action (X button)
  handleMinimize?: () => void; // Save Draft action (Minimize button)
  title: string;
  children: React.ReactNode;
};

/**
 * A reusable modal component using Material UI Dialog.
 */
const ModalSkeleton: React.FC<ModalSkeletonProps> = ({
  isOpen,
  handleClose, // Discard action (X button)
  handleMinimize, // Save Draft action (Minimize button)
  title,
  children,
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={handleClose} // Default close action is Discard
      fullWidth
      aria-labelledby="modal-title"
      sx={{
        "& .MuiBackdrop-root": { backdropFilter: "blur(3px)" },
        "& .MuiDialog-paper": {
          borderRadius: "12px",
          margin: { xs: "16px", sm: "32px" },
          width: { xs: "95%", sm: "100%" },
        },
      }}
    >
      <DialogTitle
        id="modal-title"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          borderBottom: "1px solid #e0eeef",
          backgroundColor: "#f7f9fa",
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: "600" }}>
          {title}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            justifyContent: "center",
          }}
        >
          {/* Minimize Button: Saves as Draft */}
          {handleMinimize && (
            <IconButton
              aria-label="minimize"
              onClick={handleMinimize}
              size="small"
              sx={{
                "&:hover": { color: "info.main" },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CloseFullscreenIcon fontSize="small" />
            </IconButton>
          )}
          {/* Close Button: Discards Progress */}
          {handleClose && (
            <IconButton
              aria-label="close"
              onClick={handleClose} // Discards progress and closes
              size="small"
              sx={{ "&:hover": { color: "error.main" } }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        {children}
      </DialogContent>
    </Dialog>
  );
};

// --- END MODAL SKELETON COMPONENT ---

type CreatePlayProps = {
  player: YouTubePlayer | null;
  video: VideoType;
  isNewPlayOpen: boolean;
  setIsNewPlayOpen: (status: boolean) => void;
  scrollToPlayer: () => void;
  onPlayCreated: () => void;
  setActivePlay: (play: PlayPreviewType) => void;
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
  setActivePlay,
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

  // State for Overlap Detection Feature
  const [isOverlapModalOpen, setIsOverlapModalOpen] = useState(false);
  const [overlappingPlays, setOverlappingPlays] = useState<
    PlayPreviewType[] | null
  >(null);
  const [overlapCheckMessage, setOverlapCheckMessage] = useState("");

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

  // Memoized fetch functions remain the same...

  const fetchPlayers = useCallback(async () => {
    // ... (fetchPlayers implementation omitted for brevity, remains unchanged)
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
  }, [video.exclusive_to]);

  const fetchTags = useCallback(async () => {
    // ... (fetchTags implementation omitted for brevity, remains unchanged)
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
  }, [affIds]);

  const fetchCollections = useCallback(async () => {
    // ... (fetchCollections implementation omitted for brevity, remains unchanged)
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
  }, [user.userId, affIds]);

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

  /**
   * Check overlap immediately after ending the play.
   */
  const endPlay = async () => {
    setIsPlayStarted(false);
    const time = await player?.getCurrentTime();
    const roundedTime = Math.round(time!);
    void player?.pauseVideo();

    const start = playDetails.start;
    if (typeof start !== "number") return; // Should always be true if started

    // 1. Temporarily set details in state (saves as draft)
    const newDetails = { ...playDetails, end: roundedTime };
    setPlayDetails(newDetails);

    // 2. Check for overlaps immediately using the new times
    const overlaps = await checkOverlap(start, roundedTime);

    if (overlaps.length > 0) {
      setOverlappingPlays(overlaps);
      setIsOverlapModalOpen(true); // Show overlap warning first
      setIsNewPlayOpen(false); // Close main modal if it was open
    } else {
      setIsNewPlayOpen(true); // No overlaps, go straight to play creation
    }
  };

  /**
   * Resets all state (clears draft) - Used by 'X' button and Discard/Cancel
   */
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
    setOverlappingPlays(null); // Clear overlaps on full reset
    setIsOverlapModalOpen(false);
  };

  /**
   * Action to discard the current draft and reset the form. (Used by 'X' button and Cancel button)
   */
  const handleDiscard = () => {
    void resetPlay();
  };

  /**
   * Action to close the modal while preserving the current state (save as draft). (Used by Minimize button)
   */
  const handleMinimize = () => {
    setIsNewPlayOpen(false); // Closes modal, state is preserved (drafted)
  };

  const handleMention = async (mention: UserType, play: PlayType) => {
    // ... (handleMention implementation omitted for brevity)
    await supabase.from("play_mentions").insert({
      play_id: play.id,
      sender_id: `${user.userId}`,
      receiver_id: mention.id,
      receiver_name: getDisplayName(mention),
      sender_name: getDisplayName(user),
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

  /**
   * Core function to create the play.
   */
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
        // Handle mentions, tags, and collections
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

  /**
   * Core Overlap Detection
   */
  const checkOverlap = useCallback(
    async (
      checkStart: number | null | undefined = playDetails.start,
      checkEnd: number | null | undefined = playDetails.end,
    ) => {
      if (typeof checkStart !== "number" || typeof checkEnd !== "number")
        return [];

      const { data } = await supabase
        .from("play_preview")
        .select("*")
        .eq("video->>id", video.id)
        .lt("play->>start_time", checkEnd) // Existing play starts before new play ends
        .gt("play->>end_time", checkStart); // Existing play ends after new play starts

      return data ?? [];
    },
    [video.id, playDetails.start, playDetails.end],
  );

  /**
   * Final submission: No overlap check here, as it was done upfront.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isValidPlay) return;

    if (video.private || playDetails.private) void createPlay(true);
    else {
      void createPlay(false);
    }
    // After creating a play, ensure all dropdowns are refreshed
    void fetchTags();
    void fetchCollections();
    // resetPlay is called inside createPlay
  };

  /**
   * Action to continue from overlap modal to the main creation modal.
   */
  const handleContinueToDetails = () => {
    setIsOverlapModalOpen(false); // Close overlap warning
    setIsNewPlayOpen(true); // Open main play creation form
  };

  /**
   * Action to manually re-run the check from the main creation modal.
   */
  const handleRecheckOverlap = async () => {
    if (!playDetails.start || !playDetails.end) {
      setOverlapCheckMessage("Please set both a start and end time first.");
      return;
    }

    const overlaps = await checkOverlap();

    if (overlaps.length > 0) {
      setOverlappingPlays(overlaps);
      setIsOverlapModalOpen(true);
      setIsNewPlayOpen(false); // User requested flow: Close main, open overlap
    } else {
      setOverlappingPlays(null);
      setOverlapCheckMessage(
        "No overlaps detected for the current time range!",
      );
    }
  };

  /**
   * NEW: Action when clicking an overlapping play.
   * 1. Closes modals (saving draft via minimize).
   * 2. Seeks video.
   * 3. Calls onSetActivePlay to update film room state.
   */
  const handleViewOverlap = (play: PlayPreviewType) => {
    // 1. Close both modals (preserves the current playDetails as a draft)
    handleMinimize(); // Use minimize logic to close and save draft
    setIsOverlapModalOpen(false);

    // 2. Seek and Play to the overlapping play's start time
    if (player) {
      void player.seekTo(play.play.start_time, true);
      void player.playVideo();
    }
    scrollToPlayer();

    // 3. Set the clicked play as the active play in the film room
    setActivePlay(play);
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
    // ... (handleTimeAdjustment implementation omitted for brevity)
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

  useEffect(() => {
    checkValidPlay();
    checkDraftedPlay();
  }, [playDetails, checkValidPlay, checkDraftedPlay]);

  useEffect(() => {
    void fetchPlayers();
    void fetchTags();
    void fetchCollections();
  }, [video, fetchPlayers, fetchTags, fetchCollections]);

  // Helper function to format seconds to time string
  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000).toISOString();
    return seconds < 3600 ? date.substring(14, 19) : date.substring(11, 19);
  };

  return (
    <>
      {/* ---------------------------------------------------- */}
      {/* Main Create Play Modal */}
      {/* ---------------------------------------------------- */}
      {!isNewPlayOpen && !isOverlapModalOpen ? (
        <PlayModalBtn
          isPlayStarted={isPlayStarted}
          startPlay={startPlay}
          endPlay={endPlay}
          scrollToPlayer={scrollToPlayer}
          setIsOpen={setIsNewPlayOpen}
          draftedPlay={draftedPlay}
        />
      ) : (
        isNewPlayOpen && ( // Only render the main modal if it's explicitly open
          <ModalSkeleton
            isOpen={isNewPlayOpen}
            setIsOpen={setIsNewPlayOpen}
            handleClose={handleDiscard} // X button discards progress
            handleMinimize={handleMinimize} // Minimize button saves draft
            title="Create New Play"
          >
            <Box
              component="form"
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
                  width: { xs: "100%", sm: "80%" },
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  px: 2,
                  textAlign: "center",
                }}
              >
                {/* Re-check Overlaps Button */}
                {draftedPlay && (
                  <Button
                    onClick={handleRecheckOverlap}
                    variant="outlined"
                    size="small"
                    startIcon={<SearchIcon />}
                    sx={{ mt: 1 }}
                  >
                    View Potential Overlaps ({overlappingPlays?.length ?? 0})
                  </Button>
                )}

                <Box
                  sx={{
                    display: "flex",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                    mt: overlappingPlays?.length ? 0 : 2,
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
                        ? formatTime(playDetails.start)
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
                      {playDetails.end ? formatTime(playDetails.end) : "00:00"}
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
                  size="small"
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
                *Once submitted you will not be able to adjust the timestamp of
                the clip!*
              </Typography>

              {/* Reverted Button Format */}
              <FormButtons
                isValid={isValidPlay}
                handleCancel={handleDiscard}
                submitTitle="SUBMIT"
              />
            </Box>
          </ModalSkeleton>
        )
      )}

      {/* ---------------------------------------------------- */}
      {/* Overlap Warning Modal */}
      {/* ---------------------------------------------------- */}
      <ModalSkeleton
        isOpen={isOverlapModalOpen}
        setIsOpen={setIsOverlapModalOpen}
        title="Potential Overlap Detected!"
      >
        <Box
          sx={{
            p: 2,
            textAlign: "center",
            maxWidth: "500px",
            width: "100%",
          }}
        >
          <Typography variant="body1" gutterBottom sx={{ fontWeight: "bold" }}>
            This clip overlaps with (
            {overlappingPlays?.length ? overlappingPlays.length : 0}) existing
            plays:
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Consider viewing these before creating a duplicate. Your current
            clip times are saved.
          </Typography>

          <List
            dense
            sx={{
              maxHeight: "200px",
              overflowY: "auto",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "8px",
              mb: 2,
              backgroundColor: "paper",
            }}
          >
            {overlappingPlays?.map((play) => (
              <ListItem
                key={play.play.id}
                sx={{ borderBottom: "1px solid #f0f0f0" }}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="view play"
                    onClick={() => handleViewOverlap(play)} // Calls new handler
                  >
                    <LaunchIcon fontSize="small" color="primary" />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {play.play.title}
                      </Typography>
                      <Typography variant="body2">
                        {play.author.name}
                      </Typography>
                    </Box>
                  }
                  secondary={`Times: ${formatTime(
                    play.play.start_time,
                  )} - ${formatTime(play.play.end_time)}`}
                />
              </ListItem>
            ))}
          </List>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              mt: 3,
            }}
          >
            <Button
              onClick={handleContinueToDetails}
              variant="contained"
              color="primary"
              sx={{ flexGrow: 1 }}
            >
              Continue to Play Details
            </Button>
            <Button
              onClick={handleDiscard}
              variant="outlined"
              color="error"
              sx={{ flexGrow: 1 }}
            >
              Discard
            </Button>
          </Box>
        </Box>
      </ModalSkeleton>

      {/* Simple Snackbar for non-alert messages */}
      <Snackbar
        open={!!overlapCheckMessage}
        autoHideDuration={4000}
        onClose={() => setOverlapCheckMessage("")}
        message={overlapCheckMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
};

export default CreatePlay;
