import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ReplayIcon from "@mui/icons-material/Replay";
import StarIcon from "@mui/icons-material/Star";
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  Snackbar,
  Tooltip,
} from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import YouTube, { type YouTubeEvent, type YouTubePlayer } from "react-youtube";
import TeamLogo from "~/components/teams/team-logo";
import PageTitle from "~/components/utils/page-title";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { PlayPreviewType } from "~/utils/types";
import CommentBtn from "../../interactions/comments/comment-btn";
import LikeBtn from "../../interactions/likes/like-btn";
import StandardPopover from "../../utils/standard-popover";
import ExpandedPlay from "../expanded-play";
import PlayActionsMenu from "../play-actions-menu"; // Updated import
import PlayPreviewCollections from "../play-collections";
import PlayPreviewMentions from "../play-mentions";
import PlayPreviewTags from "../play-tags";

type PlayPreviewProps = {
  preview: PlayPreviewType;
  collectionId?: string;
  setReload?: (reload: boolean) => void;
  collectionAuthor?: string;
};

const PlayPreview = ({
  preview,
  collectionId,
  setReload,
  collectionAuthor,
}: PlayPreviewProps) => {
  const { hoverText } = useIsDarkContext();
  const { user, affiliations } = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [player, setPlayer] = useState<YouTubePlayer | null>(null);

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [commentCount, setCommentCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasStartedPlaying, setHasStartedPlaying] = useState<boolean>(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success",
  );

  const videoPlayerRef = useRef<HTMLDivElement>(null); // Ref for Intersection Observer

  const exclusiveTeam = affiliations?.find(
    (aff) => aff.team.id === preview.play.exclusive_to,
  )?.team;

  const videoOnReady = async (e: YouTubeEvent) => {
    // Defensive check: ensure the target is valid before proceeding
    if (!e.target) {
      console.warn("videoOnReady: Event target is null/undefined.");
      return;
    }
    const video = e.target;
    setPlayer(video);
    void video.cueVideoById({
      videoId: `${preview.video.link.split("v=")[1]?.split("&")[0]}`,
      startSeconds: preview.play.start_time,
      endSeconds: preview.play.end_time,
    });
    setHasStartedPlaying(false);
  };

  const resetClip = useCallback(
    async (scrollAway: boolean) => {
      // Defensive check: ensure player instance exists before attempting to interact with it.
      if (!player) {
        console.warn("resetClip: player instance is null, cannot reset.");
        return;
      }
      try {
        const iframeElement = await player.getIframe(); // Await the iframe element
        if (!iframeElement) {
          return;
        }
        void player.cueVideoById({
          videoId: `${preview.video.link.split("v=")[1]?.split("&")[0]}`,
          startSeconds: preview.play.start_time,
          endSeconds: preview.play.end_time,
        });
        setHasStartedPlaying(false);
        if (scrollAway) setIsExpanded(false);
      } catch (error) {
        console.error("Error resetting clip:", error);
      }
    },
    [player, preview.play.start_time],
  );

  const onPlayerStateChange = (e: YouTubeEvent) => {
    if (typeof YT !== "undefined") {
      // Defensive check: ensure the target is valid before proceeding
      if (!e.target || typeof e.target.getCurrentTime !== "function") {
        console.warn(
          "onPlayerStateChange: Event target or getCurrentTime is null/undefined.",
        );
        return;
      }
      if (e.data === YT.PlayerState.PLAYING) {
        setHasStartedPlaying(true);
      }

      if (e.data === YT.PlayerState.ENDED) {
        void resetClip(false);
      }
    }
  };

  const updateLastWatched = async (video: string, time: number) => {
    if (user.userId) {
      await supabase
        .from("profiles")
        .update({ last_watched: video, last_watched_time: time })
        .eq("id", user.userId);
    }
  };

  // This function is now passed to PlayActionsMenu
  const handleVideoClick = () => {
    const videoId = preview.video.id;
    const playId = preview.play.id;
    const playStart = preview.play.start_time;

    const params = new URLSearchParams(searchParams);
    params.set("play", playId);
    params.set("start", `${playStart}`);

    if (user.userId) void updateLastWatched(videoId, playStart);
    void router.push(`/film-room/${videoId}?${params.toString()}`);
  };

  const handlePlayClick = () => {
    const playId = preview.play.id;
    void router.push(`/play/${playId}`);
  };

  // This function is now passed to PlayActionsMenu
  const copyToClipboard = async () => {
    const origin = window.location.origin;
    const linkToCopy = `${origin}/play/${preview.play.id}`;
    try {
      await navigator.clipboard.writeText(linkToCopy);
      setSnackbarMessage("Link copied to clipboard!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Failed to copy link: ", err);
      setSnackbarMessage("Failed to copy link. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  }, []);

  // Effect for Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (player) {
            if (!entry.isIntersecting && hasStartedPlaying) {
              void resetClip(true);
            }
          }
        });
      },
      { threshold: 0.2 }, // Trigger when 50% of the video is visible
    );

    if (videoPlayerRef.current) {
      observer.observe(videoPlayerRef.current);
    }
    return () => {
      if (videoPlayerRef.current) {
        observer.unobserve(videoPlayerRef.current);
      }
    };
  }, [player, resetClip, hasStartedPlaying]); // Dependencies: player and resetClip

  return (
    <Box className="flex w-full flex-col justify-center rounded-md">
      <Box className="flex items-center justify-between gap-2 px-1 py-2">
        <Box className="flex items-center gap-1.5">
          {preview.play.private && exclusiveTeam && (
            <StandardPopover
              content={`Play is private to ${exclusiveTeam?.full_name}`}
              children={
                <IconButton
                  size="small"
                  sx={{ padding: 0 }}
                  onClick={() =>
                    void router.push(`/team-hub/${exclusiveTeam.id}`)
                  }
                >
                  <TeamLogo tm={exclusiveTeam} size={25} inactive={true} />
                </IconButton>
              }
            />
          )}
          {preview.play.highlight && (
            <StandardPopover
              content="Highlight!"
              children={
                <Box
                  sx={{
                    display: "flex",
                    cursor: "pointer",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <StarIcon color="secondary" />
                </Box>
              }
            />
          )}
          <Box
            className={`text-center font-bold tracking-tighter md:text-lg ${hoverText}`}
            onClick={() =>
              void router.push(`/profile/${preview.play.author_id}`)
            }
          >
            {preview.author.name}
          </Box>
          <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />
          <Box className="text-xs font-bold leading-3 tracking-tight">
            ({preview.play.end_time - preview.play.start_time}s)
          </Box>
        </Box>
        <Box className="flex items-center gap-2">
          {/* Reset Clip Button */}
          <Tooltip title="Reset Clip" arrow>
            <IconButton
              onClick={() => void resetClip(false)}
              size="small"
              color="primary" // Changed color for prominence
              sx={{ padding: 0 }}
            >
              <ReplayIcon />
            </IconButton>
          </Tooltip>

          {/* PlayActionsMenu */}
          <PlayActionsMenu
            preview={preview}
            collectionId={collectionId}
            setReload={setReload}
            collectionAuthor={collectionAuthor}
            onCopyLink={copyToClipboard} // Pass the copy link function
            onGoToFilmRoom={handleVideoClick} // Pass the go to film room function
            onPlayClick={handlePlayClick} // Pass the go to play function
          />
        </Box>
      </Box>
      <Box
        ref={videoPlayerRef}
        className="relative aspect-video w-full overflow-hidden rounded-md"
      >
        {!isLoading && (
          <YouTube
            opts={{
              width: "100%",
              height: "100%",
              playerVars: {
                end: preview.play.end_time,
                enablejsapi: 1,
                playsinline: 1,
                disablekb: 0,
                controls: 1, // Show controls
                rel: 0,
                origin: window.location.origin,
                fs: 1, // Still useful for native fullscreen button on controls
              },
            }}
            onReady={videoOnReady}
            onStateChange={onPlayerStateChange}
            id="player"
            videoId={preview.video.link.split("v=")[1]?.split("&")[0]}
            className="absolute left-0 top-0 h-full w-full"
          />
        )}
      </Box>
      {isLoading && <PageTitle size="small" title="Loading..." />}
      <Box className="flex flex-wrap p-1 text-sm md:text-base">
        {preview.play.title}
      </Box>
      <Box
        sx={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          gap: 1,
        }}
      >
        <PlayPreviewMentions play={preview} />
        <PlayPreviewTags play={preview} />
        <PlayPreviewCollections play={preview} />
      </Box>
      {/* New PlayCollections component */}
      <Box className="mt-1 flex w-full items-center">
        <Box className="flex items-center justify-center gap-2">
          <LikeBtn playId={preview.play.id} />
          <CommentBtn
            isOpen={isExpanded}
            setIsOpen={setIsExpanded}
            playId={preview.play.id}
            commentCount={commentCount}
            setCommentCount={setCommentCount}
            activePlay={null}
          />
          {isExpanded ? (
            <Button
              size="small"
              style={{ fontWeight: "bold" }}
              variant="text"
              onClick={() => setIsExpanded(false)}
              endIcon={<KeyboardArrowUpIcon color="primary" />}
            >
              Hide
            </Button>
          ) : preview.play.note ? (
            <Button
              size="small"
              style={{ fontWeight: "bold" }}
              variant="text"
              onClick={() => setIsExpanded(true)}
              endIcon={<KeyboardArrowDownIcon color="primary" />}
            >
              See note
            </Button>
          ) : (
            <IconButton size="small" onClick={() => setIsExpanded(true)}>
              <KeyboardArrowDownIcon color="primary" />
            </IconButton>
          )}
        </Box>
      </Box>
      {isExpanded && (
        <ExpandedPlay play={preview} setCommentCount={setCommentCount} />
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000} // Hide after 3 seconds
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

export default PlayPreview;
