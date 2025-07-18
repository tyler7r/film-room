import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import LinkIcon from "@mui/icons-material/Link";
import LockIcon from "@mui/icons-material/Lock";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Fab,
  IconButton,
  Snackbar,
  Typography,
  useTheme,
} from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type SyntheticEvent,
} from "react";
import YouTube, { type YouTubeEvent, type YouTubePlayer } from "react-youtube";
import CreatePlay from "~/components/plays/create-play";
import Team from "~/components/teams/team";
import VideoPlayIndex from "~/components/videos/video-play-index";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import type { PlayPreviewType, TeamType, VideoType } from "~/utils/types";

const FilmRoom = () => {
  const router = useRouter();
  const { user, affIds } = useAuthContext();
  const theme = useTheme();
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [accessDenied, setAccessDenied] = useState<boolean>(true);

  // State to track if the video player is in view
  const [isPlayerInView, setIsPlayerInView] = useState<boolean>(false);

  // Snackbar states for copy to clipboard feedback
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success",
  );

  // NEW: State to trigger refresh for VideoPlayIndex
  const [refreshPlaysKey, setRefreshPlaysKey] = useState(0);

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
      setAccessDenied(true);
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
    setIsLoading(false);
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

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        interval.current = setInterval(() => void checkTime(), 1000);
      } else if (currentTime >= endTime && seenActivePlay) {
        void player.seekTo(activePlay.play.start_time, true);
        void player.pauseVideo();
        if (interval.current) {
          void clearInterval(interval.current);
          interval.current = null;
        }
      }
    } else if (interval.current) {
      void clearInterval(interval.current);
      interval.current = null;
    }
  }, [player, activePlay, seenActivePlay, getCurrentTime]);

  const copyToClipboard = useCallback(async () => {
    const origin = window.location.origin;
    const linkToCopy = `${origin}${router.asPath}`;
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

  // NEW: Callback to increment refreshPlaysKey, triggering VideoPlayIndex refresh
  const handlePlayCreated = useCallback(() => {
    setRefreshPlaysKey((prev) => prev + 1);
  }, []);

  const handlePlayDeleted = useCallback(() => {
    setRefreshPlaysKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (router.query.video) {
      void fetchVideo();
      void fetchAffiliatedTeams();
    }
  }, [router.query.video, affIds, fetchVideo, fetchAffiliatedTeams]);

  useEffect(() => {
    void fetchActivePlay();
  }, [playParam, player, fetchActivePlay]);

  useEffect(() => {
    if (interval.current) {
      clearInterval(interval.current);
      interval.current = null;
    }
    if (activePlay && player) {
      interval.current = setInterval(() => void checkTime(), 1000);
    }

    return () => {
      if (interval.current) {
        clearInterval(interval.current);
        interval.current = null;
      }
    };
  }, [activePlay, player, checkTime]);

  // Intersection Observer to detect when playerRef is in view
  useEffect(() => {
    const currentRef = playerRef.current;

    // Only set up observer if the element exists
    if (!currentRef) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          // Update state based on whether the player is intersecting
          setIsPlayerInView(entry.isIntersecting);
        }
      },
      {
        root: null, // Default to the viewport. If your page has a specific scrollable container,
        // you'd set this to the ref of that container (e.g., root: scrollContainerRef.current)
        rootMargin: "0px",
        threshold: 0.5, // NEW: Increased threshold to 50% visibility
      },
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [playerRef, video]); // Depend on playerRef to re-run if it changes

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
          gap: 2,
          p: 2,
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
            maxWidth: "800px",
            width: "100%",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography
              variant="subtitle1"
              color="text.secondary"
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
              size="small"
              aria-label="copy-video-link"
            >
              <LinkIcon fontSize="small" />
            </IconButton>
          </Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            {" "}
            {/* Changed to h4 for semantic importance */}
            {video.title}
          </Typography>
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
              gap: { xs: 2, md: 3 },
              maxWidth: "1200px",
            }}
          >
            {video.link && !isLoading ? (
              <Box
                ref={playerRef}
                sx={{
                  position: "relative",
                  aspectRatio: "16 / 9",
                  width: "100%",
                  overflow: "hidden",
                  borderRadius: "8px",
                  boxShadow: 3,
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
                      origin: window.location.origin,
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
                  maxHeight: "400px",
                  borderRadius: "8px",
                  backgroundColor: theme.palette.action.hover,
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

            {/* Conditional Button/FAB */}
            <Box
              sx={{
                position: "fixed",
                bottom: { xs: 16, sm: 24 },
                right: { xs: 16, sm: 24 },
                zIndex: 10,
              }}
            >
              {isPlayerInView ? (
                <CreatePlay
                  player={player}
                  video={video}
                  isNewPlayOpen={isNewPlayOpen}
                  setIsNewPlayOpen={setIsNewPlayOpen}
                  scrollToPlayer={scrollToPlayer}
                  onPlayCreated={handlePlayCreated}
                />
              ) : (
                <Fab
                  color="primary"
                  aria-label="scroll to top"
                  onClick={scrollToTop}
                >
                  <ArrowUpwardIcon fontSize="large" />
                </Fab>
              )}
            </Box>

            {/* Video Play Index */}
            <VideoPlayIndex
              key={refreshPlaysKey}
              player={player}
              videoId={video.id}
              scrollToPlayer={scrollToPlayer}
              setActivePlay={setActivePlay}
              activePlay={activePlay}
              setSeenActivePlay={setSeenActivePlay}
              handlePlayDeleted={handlePlayDeleted}
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
              backgroundColor: theme.palette.background.paper,
              maxWidth: "600px",
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
          autoHideDuration={3000}
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
