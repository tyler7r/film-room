import AddIcon from "@mui/icons-material/Add";
import LinkIcon from "@mui/icons-material/Link";
import LockIcon from "@mui/icons-material/Lock";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Snackbar,
  Typography,
  useTheme,
} from "@mui/material"; // Added Typography, CircularProgress, Snackbar, Alert, useTheme
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type SyntheticEvent,
} from "react"; // Added useCallback, SyntheticEvent
import YouTube, { type YouTubeEvent, type YouTubePlayer } from "react-youtube";
import CreatePlay from "~/components/plays/create-play";
import Team from "~/components/teams/team";
import PageTitle from "~/components/utils/page-title";
import VideoPlayIndex from "~/components/videos/video-play-index";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import type { PlayPreviewType, TeamType, VideoType } from "~/utils/types";

const FilmRoom = () => {
  const router = useRouter();
  const { user, affIds } = useAuthContext();
  const theme = useTheme(); // Access the Material UI theme
  const playParam = useSearchParams().get("play") ?? null;
  const startParam = useSearchParams().get("start") ?? null;
  const videoId = router.query.video as string;

  const [video, setVideo] = useState<VideoType | null>(null);
  const [affiliatedTeams, setAffiliatedTeams] = useState<TeamType[] | null>(
    null,
  );

  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const [activePlay, setActivePlay] = useState<PlayPreviewType | null>(null);
  const [seenActivePlay, setSeenActivePlay] = useState<boolean>(false);

  const [isNewPlayOpen, setIsNewPlayOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Controls video loading
  const [accessDenied, setAccessDenied] = useState<boolean>(true);

  // Snackbar states for copy to clipboard feedback
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success",
  );

  const interval = useRef<NodeJS.Timeout | null>(null);

  const fetchVideo = useCallback(async () => {
    if (!videoId) return;

    const { data, error } = await supabase
      .from("videos")
      .select(`*`)
      .eq("id", videoId)
      .single();

    if (error) {
      console.error("Error fetching video:", error);
      setVideo(null);
      setAccessDenied(true); // Default to access denied on error
      setIsLoading(false);
      return;
    }

    if (data) {
      setVideo(data);
      if (data.exclusive_to) {
        const accessAllowed = affIds?.includes(data.exclusive_to);
        if (!accessAllowed) {
          setAccessDenied(true);
        } else setAccessDenied(false);
      } else {
        setAccessDenied(false);
      }
    } else {
      setVideo(null);
      setAccessDenied(true);
    }
    setIsLoading(false); // Video data fetched, stop loading indicator
  }, [videoId, affIds]);

  const fetchAffiliatedTeams = useCallback(async () => {
    if (!videoId) return;
    const { data, error } = await supabase
      .from("team_video_view")
      .select("team")
      .eq("video->>id", videoId);
    if (error) {
      console.error("Error fetching affiliated teams:", error);
      setAffiliatedTeams(null);
      return;
    }
    if (data) setAffiliatedTeams(data.map((tm) => tm.team));
    else setAffiliatedTeams(null);
  }, [videoId]);

  const fetchActivePlay = useCallback(async () => {
    if (playParam) {
      const { data, error } = await supabase
        .from("play_preview")
        .select(`*`, {
          count: "exact",
        })
        .eq("play->>id", playParam)
        .single();
      if (error) {
        console.error("Error fetching active play:", error);
        setActivePlay(null);
        return;
      }
      if (data) setActivePlay(data);
      else setActivePlay(null);
    }
  }, [playParam]);

  const videoOnReady = useCallback(
    async (e: YouTubeEvent) => {
      const videoInstance = e.target;
      setPlayer(videoInstance);
      const time = Number(startParam);
      if (!isNaN(time)) {
        // Check if time is a valid number
        void videoInstance.seekTo(time, true);
        void videoInstance.playVideo();
      }
    },
    [startParam],
  );

  const scrollToPlayer = useCallback(() => {
    if (playerRef.current)
      playerRef.current.scrollIntoView({ behavior: "smooth" });
  }, []);

  const getCurrentTime = useCallback(async (player: YouTubePlayer) => {
    return Math.round(await player.getCurrentTime());
  }, []);

  const checkTime = useCallback(async () => {
    if (player && activePlay) {
      const currentTime = await getCurrentTime(player);
      const endTime = activePlay.play.end_time;

      if (currentTime >= endTime && interval.current && !seenActivePlay) {
        void player.pauseVideo();
        void clearInterval(interval.current);
        interval.current = null;
        setSeenActivePlay(true);
      } else if (currentTime < endTime && !interval.current) {
        // Re-start interval if not at end and not running
        interval.current = setInterval(() => void checkTime(), 1000);
      } else if (currentTime >= endTime && seenActivePlay) {
        // If already seen and at end, reset
        void player.seekTo(activePlay.play.start_time, true);
        void player.pauseVideo();
        if (interval.current) {
          void clearInterval(interval.current);
          interval.current = null;
        }
      }
    } else if (interval.current) {
      // Clear interval if activePlay or player become null
      void clearInterval(interval.current);
      interval.current = null;
    }
  }, [player, activePlay, seenActivePlay, getCurrentTime]);

  const copyToClipboard = useCallback(async () => {
    const origin = window.location.origin;
    const linkToCopy = `${origin}${router.asPath}`; // Copy the current URL
    try {
      await navigator.clipboard.writeText(linkToCopy);
      setSnackbarMessage("Link copied!");
      setSnackbarSeverity("success");
    } catch (err) {
      console.error("Failed to copy link:", err);
      setSnackbarMessage("Failed to copy link.");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
    }
  }, [router.asPath]);

  const handleSnackbarClose = useCallback(
    (_event?: SyntheticEvent | Event, reason?: string) => {
      if (reason === "clickaway") {
        return;
      }
      setSnackbarOpen(false);
    },
    [],
  );

  const handleNewTeamClick = useCallback(() => {
    if (user.isLoggedIn) {
      void router.push("/team-select");
    } else {
      void router.push("/login");
    }
  }, [user.isLoggedIn, router]);

  useEffect(() => {
    if (router.query.video) {
      void fetchVideo();
      void fetchAffiliatedTeams();
    }
  }, [router.query.video, affIds, fetchVideo, fetchAffiliatedTeams]); // Added fetchVideo/Teams as dependencies

  useEffect(() => {
    void fetchActivePlay();
  }, [playParam, player, fetchActivePlay]); // Added fetchActivePlay as dependency

  useEffect(() => {
    // Clear existing interval to prevent multiple intervals
    if (interval.current) {
      clearInterval(interval.current);
      interval.current = null;
    }
    // Start interval only if activePlay and player are available
    if (activePlay && player) {
      // Set initial interval to check time
      interval.current = setInterval(() => void checkTime(), 1000);
    }

    // Cleanup on unmount or if activePlay/player changes
    return () => {
      if (interval.current) {
        clearInterval(interval.current);
        interval.current = null;
      }
    };
  }, [activePlay, player, checkTime]); // Dependencies for this effect

  return (
    video && (
      <Box
        sx={{
          position: "relative",
          display: "flex",
          width: "100%",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2, // Responsive gap
          p: 2, // Responsive padding
        }}
      >
        {/* Video Header Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.5,
            textAlign: "center",
            maxWidth: "800px", // Constrain width for larger screens
            width: "100%",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography
              variant="subtitle1" // Use subtitle1 for season/week
              color="text.secondary" // Lighter text color
              sx={{ fontWeight: "bold", letterSpacing: "-0.025em" }}
            >
              {video.season} -{" "}
              {video.week
                ? video.week.toLocaleUpperCase()
                : video.tournament
                  ? video.tournament.toLocaleUpperCase()
                  : null}
            </Typography>
            <IconButton
              onClick={copyToClipboard}
              size="small" // Smaller icon button
              aria-label="copy-video-link"
            >
              <LinkIcon fontSize="small" /> {/* Smaller icon */}
            </IconButton>
          </Box>
          <PageTitle title={video.title} size="small" />
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              justifyContent: "center",
            }}
          >
            {affiliatedTeams?.map((tm) => (
              <Team team={tm} small={true} key={tm.id} />
            ))}
          </Box>
        </Box>

        {/* Conditional Content: Video Player or Access Denied */}
        {!accessDenied ? (
          <Box
            sx={{
              position: "relative",
              display: "flex",
              width: "100%",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: { xs: 2, md: 3 }, // Gap below video player
              maxWidth: "1200px", // Max width for video player area
            }}
          >
            {video.link && !isLoading ? (
              <Box
                ref={playerRef}
                sx={{
                  position: "relative",
                  aspectRatio: "16 / 9", // Maintain 16:9 aspect ratio
                  width: "100%",
                  overflow: "hidden",
                  borderRadius: "8px", // Rounded corners for the player
                  boxShadow: 3, // Subtle shadow for depth
                }}
              >
                <YouTube
                  opts={{
                    width: "100%",
                    height: "100%",
                    playerVars: {
                      enablejsapi: 1,
                      playsinline: 1,
                      disablekb: 0,
                      controls: 1,
                      rel: 0,
                      origin: window.location.origin, // Use current origin for security
                      fs: 1,
                    },
                  }}
                  onReady={videoOnReady}
                  id="player"
                  videoId={video.link.split("v=")[1]?.split("&")[0]}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    height: "100%",
                    width: "100%",
                  }}
                />
              </Box>
            ) : (
              // Loading spinner for video
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  aspectRatio: "16 / 9",
                  width: "100%",
                  maxHeight: "400px", // Limit height when loading
                  borderRadius: "8px",
                  backgroundColor: theme.palette.action.hover, // Placeholder background
                }}
              >
                <CircularProgress size={60} />
                <Typography
                  variant="h6"
                  sx={{ mt: 2, color: "text.secondary" }}
                >
                  Loading video...
                </Typography>
              </Box>
            )}

            {/* Create Play Button (Fixed Position) */}
            <Box sx={{ position: "fixed", bottom: 2, right: 2, zIndex: 10 }}>
              <CreatePlay
                player={player}
                video={video}
                isNewPlayOpen={isNewPlayOpen}
                setIsNewPlayOpen={setIsNewPlayOpen}
                scrollToPlayer={scrollToPlayer}
              />
            </Box>

            {/* Video Play Index */}
            <VideoPlayIndex
              player={player}
              videoId={video.id}
              scrollToPlayer={scrollToPlayer}
              setActivePlay={setActivePlay}
              activePlay={activePlay}
              setSeenActivePlay={setSeenActivePlay}
            />
          </Box>
        ) : (
          /* Access Denied Message */
          <Box
            sx={{
              display: "flex",
              width: "100%",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              p: 4,
              borderRadius: "12px",
              boxShadow: 3,
              backgroundColor: theme.palette.background.paper, // Use paper background
              maxWidth: "600px", // Constrain width for the message
              textAlign: "center",
            }}
          >
            <LockIcon sx={{ fontSize: "96px", color: "error.main" }} />
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", color: "text.primary" }}
            >
              This video is private!
            </Typography>
            <Button
              variant="contained"
              endIcon={<AddIcon />}
              onClick={handleNewTeamClick}
              sx={{
                textTransform: "none",
                px: 3,
                py: 1.5,
                borderRadius: "8px",
              }}
            >
              Join a new team
            </Button>
          </Box>
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
    )
  );
};

export default FilmRoom;
