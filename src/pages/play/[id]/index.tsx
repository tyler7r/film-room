import ReplayIcon from "@mui/icons-material/Replay";
import StarIcon from "@mui/icons-material/Star";
import {
  Alert,
  Box,
  Divider,
  IconButton,
  Snackbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import YouTube, { type YouTubeEvent, type YouTubePlayer } from "react-youtube";
import CommentBtn from "~/components/interactions/comments/comment-btn";
import LikeBtn from "~/components/interactions/likes/like-btn";
import ExpandedPlay from "~/components/plays/expanded-play";
import PlayActionsMenu from "~/components/plays/play-actions-menu";
import PlayPreviewCollections from "~/components/plays/play-collections";
import PlayPreviewMentions from "~/components/plays/play-mentions";
import PlayPreviewTags from "~/components/plays/play-tags";
import TeamLogo from "~/components/teams/team-logo";
import PageTitle from "~/components/utils/page-title";
import StandardPopover from "~/components/utils/standard-popover";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { PlayPreviewType } from "~/utils/types";

const Play = () => {
  const router = useRouter();
  const { user, affiliations } = useAuthContext();
  const { hoverText } = useIsDarkContext();
  const { isMobile } = useMobileContext();
  const searchParams = useSearchParams();
  const playId = router.query.id as string;

  const [preview, setPreview] = useState<PlayPreviewType | null>(null);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [commentCount, setCommentCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success",
  );

  const activeComment = useSearchParams().get("comment") ?? undefined;

  const exclusiveTeam = affiliations?.find(
    (aff) => aff.team.id === preview?.play.exclusive_to,
  )?.team;

  const fetchPlay = async () => {
    const { data } = await supabase
      .from("play_preview")
      .select()
      .eq("play->>id", playId)
      .single();
    if (data) {
      setPreview(data);
      setIsLoading(false);
    } else setPreview(null);
  };

  const videoOnReady = (e: YouTubeEvent) => {
    if (!e.target) {
      console.warn("videoOnReady: Event target is null/undefined.");
      return;
    }
    const video = e.target;
    setPlayer(video);
    if (preview) {
      void video.cueVideoById({
        videoId: `${preview.video.link.split("v=")[1]?.split("&")[0]}`,
        startSeconds: preview.play.start_time,
        endSeconds: preview.play.end_time,
      });
      setIsLoading(false);
    }
  };

  const resetClip = useCallback(async () => {
    // Defensive check: ensure player instance exists before attempting to interact with it.
    if (!player || !preview) {
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
    } catch (error) {
      console.error("Error resetting clip:", error);
    }
  }, [player, preview?.play.start_time]);

  const onPlayerStateChange = (e: YouTubeEvent) => {
    if (typeof YT !== "undefined") {
      // Defensive check: ensure the target is valid before proceeding
      if (!e.target || typeof e.target.getCurrentTime !== "function") {
        console.warn(
          "onPlayerStateChange: Event target or getCurrentTime is null/undefined.",
        );
        return;
      }
      if (e.data === YT.PlayerState.ENDED) {
        void resetClip();
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

  const handleVideoClick = () => {
    if (preview) {
      const videoId = preview.video.id;
      const playId = preview.play.id;
      const playStart = preview.play.start_time;

      const params = new URLSearchParams(searchParams);
      params.set("play", playId);
      params.set("start", `${playStart}`);

      if (user.userId) void updateLastWatched(videoId, playStart);
      void router.push(`/film-room/${videoId}?${params.toString()}`);
    }
  };

  const copyToClipboard = async () => {
    if (!preview) {
      console.warn("Preview is null, can not copy link.");
      return;
    }
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
    setIsLoading(true);
    if (playId) {
      void fetchPlay();
    }
  }, [playId]);

  return (
    preview && (
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box
          className="flex w-full flex-col justify-center rounded-md p-2"
          sx={{ width: isMobile ? "100%" : "80%" }}
        >
          <Box className="flex items-center justify-between gap-2 px-1 py-3">
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
                  onClick={() => void resetClip()}
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
                onCopyLink={copyToClipboard} // Pass the copy link function
                onGoToFilmRoom={handleVideoClick} // Pass the go to film room function
              />
            </Box>
          </Box>
          <Box className="relative aspect-video w-full overflow-hidden rounded-md">
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
          <Box className="flex flex-wrap" sx={{ p: 0.5 }}>
            <Typography variant="body1">{preview.play.title}</Typography>
          </Box>
          {isLoading && <PageTitle size="small" title="Loading..." />}
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
                playId={preview.play.id}
                commentCount={commentCount}
                setCommentCount={setCommentCount}
                activePlay={null}
              />
            </Box>
          </Box>
          <Divider
            flexItem
            orientation="horizontal"
            variant="fullWidth"
            sx={{ my: 2, mx: 0.5 }}
          />
          <Box sx={{ display: "flex", width: "100%", p: 0.5 }}>
            <ExpandedPlay
              play={preview}
              setCommentCount={setCommentCount}
              activeComment={activeComment}
            />
          </Box>
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
      </Box>
    )
  );
};

export default Play;
