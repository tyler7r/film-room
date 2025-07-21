import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PublicIcon from "@mui/icons-material/Public";
import ReplayIcon from "@mui/icons-material/Replay";
import StarIcon from "@mui/icons-material/Star";
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  Snackbar,
  Typography,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/router";
import React, { useCallback, useState, type SyntheticEvent } from "react"; // Added useCallback, SyntheticEvent
import type { YouTubePlayer } from "react-youtube";
import CommentBtn from "~/components/interactions/comments/comment-btn";
import LikeBtn from "~/components/interactions/likes/like-btn";
import TeamLogo from "~/components/teams/team-logo";
import StandardPopover from "~/components/utils/standard-popover";
import type { PlaySearchOptions } from "~/components/videos/video-play-index";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { convertYouTubeTimestamp, getDisplayName } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { PlayPreviewType } from "~/utils/types";
import ExpandedPlay from "../expanded-play";
import PlayActionsMenu from "../play-actions-menu";
import PlayPreviewCollections from "../play-collections";
import PlayPreviewMentions from "../play-mentions";
import PlayPreviewTags from "../play-tags";

type PlayProps = {
  player: YouTubePlayer | null;
  play: PlayPreviewType;
  scrollToPlayer: () => void;
  activePlay?: PlayPreviewType;
  setSeenActivePlay: (seenActivePlay: boolean) => void;
  setActivePlay: (play: PlayPreviewType) => void;
  searchOptions: PlaySearchOptions;
  setSearchOptions: (options: PlaySearchOptions) => void;
  setIsFiltersOpen: (isFiltersOpen: boolean) => void;
  index: number;
  handlePlayDeleted: () => void;
};

const Play = ({
  play,
  player,
  scrollToPlayer,
  activePlay,
  setActivePlay,
  searchOptions,
  setSearchOptions,
  setSeenActivePlay,
  setIsFiltersOpen,
  index,
  handlePlayDeleted,
}: PlayProps) => {
  const { user } = useAuthContext();
  const { isDark, hoverText, backgroundStyle } = useIsDarkContext();
  const theme = useTheme(); // Use theme to access palette colors

  const router = useRouter();

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [commentCount, setCommentCount] = useState<number>(0);

  // Snackbar states for copy to clipboard feedback
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success",
  );

  const exclusiveTeam = play.team; // Renamed from exclusiveTeam to match usage pattern

  const updateLastWatched = useCallback(
    async (time: number) => {
      if (user.userId) {
        await supabase
          .from("profiles")
          .update({
            last_watched: play.video.id,
            last_watched_time: time,
          })
          .eq("id", user.userId);
      }
    },
    [play.video.id, user.userId],
  );

  const handleClick = useCallback(async () => {
    scrollToPlayer();
    setSeenActivePlay(false);
    setActivePlay(play);
    void player?.seekTo(play.play.start_time, true);
    void player?.playVideo();
    void updateLastWatched(play.play.start_time);
  }, [
    play,
    player,
    scrollToPlayer,
    setSeenActivePlay,
    setActivePlay,
    updateLastWatched,
  ]);

  const handleMentionAndTagClick = useCallback(
    (e: React.MouseEvent, topic: string) => {
      e.stopPropagation(); // Stop propagation to prevent triggering play click
      setIsFiltersOpen(true);
      setSearchOptions({ ...searchOptions, topic: topic });
    },
    [setIsFiltersOpen, setSearchOptions, searchOptions],
  );

  const handleHighlightClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Stop propagation
      setIsFiltersOpen(true);
      setSearchOptions({
        ...searchOptions,
        only_highlights: !searchOptions.only_highlights,
      });
    },
    [setIsFiltersOpen, setSearchOptions],
  );

  const handlePrivateClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Stop propagation
      setIsFiltersOpen(true);
      setSearchOptions({
        ...searchOptions,
        private_only: exclusiveTeam?.id ? exclusiveTeam.id : "all",
      });
    },
    [setIsFiltersOpen, setSearchOptions, exclusiveTeam?.id],
  );

  const handlePlayClick = useCallback(() => {
    const playId = play.play.id;
    void router.push(`/play/${playId}`);
  }, [play.play.id, router]);

  const copyToClipboard = useCallback(async () => {
    const origin = window.location.origin;
    const linkToCopy = `${origin}/play/${play.play.id}`;
    console.log(linkToCopy);
    try {
      await navigator.clipboard.writeText(linkToCopy);
      setSnackbarMessage("Link copied!");
      setSnackbarSeverity("success");
    } catch (err) {
      console.error("Failed to copy link:", err);
      setSnackbarMessage("Failed to copy link.");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true); // Always open snackbar on copy attempt
    }
  }, [play.play.id]);

  const handleSnackbarClose = useCallback(
    (_event?: SyntheticEvent | Event, reason?: string) => {
      if (reason === "clickaway") {
        return;
      }
      setSnackbarOpen(false);
    },
    [],
  );

  const getBackgroundColor = () => {
    if (activePlay && activePlay.play.id === play.play.id) {
      return backgroundStyle.backgroundColor; // Use provided active background color
    }
    if (typeof index === "number") {
      // Alternate light/darker shades based on theme
      return index % 2 !== 0
        ? isDark
          ? theme.palette.grey[900]
          : theme.palette.grey[50] // Even rows
        : isDark
          ? theme.palette.grey[800]
          : theme.palette.grey[100]; // Odd rows
    }
    return "transparent"; // Default transparent if no index
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        flexDirection: "column",
        gap: 1, // Gap between sections within the play
        p: 1, // Padding around the entire play card
        borderRadius: "8px", // Slightly rounded corners
        backgroundColor: getBackgroundColor(),
        transition: "background-color 0.3s ease-in-out", // Smooth transition for background change
      }}
    >
      {/* Clickable Area for Main Play Interaction */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1, // Gap between rows in the clickable area
          cursor: "pointer",
        }}
        onClick={handleClick}
      >
        {/* Top Bar: Highlight, Privacy, Timestamp & Actions */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          {/* Left Group: Highlight, Privacy/Team, Timestamp */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {play.play.highlight && (
              <StandardPopover
                content="Highlight"
                children={
                  <IconButton
                    size="small"
                    sx={{ padding: 0 }}
                    onClick={handleHighlightClick}
                    aria-label="highlight"
                  >
                    <StarIcon color="secondary" fontSize="small" />
                  </IconButton>
                }
              />
            )}
            <StandardPopover
              content={
                play.team
                  ? `Play is private to ${play.team.full_name}`
                  : "Public Play"
              }
              children={
                play.team ? (
                  <IconButton
                    size="small"
                    onClick={handlePrivateClick}
                    aria-label="team-privacy"
                    sx={{ padding: 0 }}
                  >
                    <TeamLogo size={20} tm={play.team} inactive={true} />
                    {/* Adjusted size */}
                  </IconButton>
                ) : (
                  <PublicIcon fontSize="small" color="action" />
                )
              }
            />
            <Divider orientation="vertical" flexItem />
            <Typography
              variant="body2"
              sx={{ fontWeight: "bold", lineHeight: 1 }}
            >
              {convertYouTubeTimestamp(play.play.start_time)}
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontWeight: "light", lineHeight: 1 }}
            >
              ({play.play.end_time - play.play.start_time}s)
            </Typography>
          </Box>

          {/* Right Group: Action Buttons */}
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {activePlay && (
              <IconButton
                size="small"
                onClick={handleClick}
                aria-label="restart-play"
              >
                <ReplayIcon color="primary" />
              </IconButton>
            )}
            <PlayActionsMenu
              preview={play}
              onCopyLink={copyToClipboard}
              onPlayClick={handlePlayClick}
              handlePlayDeleted={handlePlayDeleted}
            />
          </Box>
        </Box>

        {/* Author and Title */}
        <Typography
          variant="body2"
          sx={{
            display: "block", // Ensures it takes full width
            fontWeight: "normal",
            "& strong": {
              fontWeight: "bold",
              color: "text.primary", // Ensure good contrast
              cursor: "pointer",
              "&:hover": {
                color: hoverText,
              },
              fontSize: "14px",
            },
          }}
        >
          <Box
            component="strong"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              void router.push(`/profile/${play.play.author_id}`);
            }}
          >
            {getDisplayName(play.author)}:
          </Box>{" "}
          {play.play.title}
        </Typography>

        {/* Mentions, Tags, Collections */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 0.75,
          }}
        >
          <PlayPreviewMentions
            activePlay={activePlay}
            play={play}
            handleMentionAndTagClick={handleMentionAndTagClick}
          />
          <PlayPreviewTags
            activePlay={activePlay}
            play={play}
            handleMentionAndTagClick={handleMentionAndTagClick}
          />
          <PlayPreviewCollections play={play} />
        </Box>
      </Box>

      {/* Likes, Comments, Expand Button Row */}
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()} // Prevent triggering main play click
      >
        <LikeBtn playId={play.play.id} />
        <CommentBtn
          isOpen={isExpanded}
          setIsOpen={setIsExpanded}
          playId={play.play.id}
          commentCount={commentCount}
          setCommentCount={setCommentCount}
          activePlay={null}
        />
        {isExpanded ? (
          <IconButton
            size="small"
            onClick={() => setIsExpanded(false)}
            aria-label="collapse-comments"
          >
            <KeyboardArrowUpIcon color="primary" fontSize="small" />
          </IconButton>
        ) : play.play.note ? (
          <Button
            size="small"
            variant="text"
            onClick={() => setIsExpanded(true)}
            endIcon={<KeyboardArrowDownIcon color="primary" fontSize="small" />}
            sx={{ fontWeight: "bold" }}
          >
            See note
          </Button>
        ) : (
          <IconButton
            size="small"
            onClick={() => setIsExpanded(true)}
            aria-label="expand-comments"
          >
            <KeyboardArrowDownIcon color="primary" fontSize="small" />
          </IconButton>
        )}
      </Box>

      {isExpanded && (
        <ExpandedPlay
          play={play}
          handleMentionAndTagClick={handleMentionAndTagClick}
          setCommentCount={setCommentCount}
        />
      )}

      {/* Snackbar for copy feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000} // Shorter duration for quick feedback
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Play;
