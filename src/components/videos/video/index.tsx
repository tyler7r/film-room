import PublicIcon from "@mui/icons-material/Public";
import { Alert, Box, IconButton, Snackbar, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react"; // Import useCallback
import TeamLogo from "~/components/teams/team-logo";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { TeamType, VideoType } from "~/utils/types";
import PageTitle from "../../utils/page-title";
import VideoActionsMenu from "../video-actions-menu";
import VideoAffiliatedTeamsChip from "../video-teams";

type VideoProps = {
  video: VideoType | null;
  startTime?: string | null;
};

const Video = ({ video, startTime }: VideoProps) => {
  const { backgroundStyle, isDark, hoverBorder } = useIsDarkContext();
  const { user, affiliations } = useAuthContext();
  const router = useRouter();
  const [affiliatedTeams, setAffiliatedTeams] = useState<TeamType[] | null>(
    null,
  );
  const [exclusiveTeam, setExclusiveTeam] = useState<
    TeamType | null | undefined
  >(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success",
  );

  const fetchExclusiveToTeam = useCallback(() => {
    if (video?.exclusive_to) {
      const tm = affiliations?.find((t) => t.team.id === video.exclusive_to);
      setExclusiveTeam(tm?.team);
    } else setExclusiveTeam(null);
  }, [video?.exclusive_to, affiliations]); // Dependencies for useCallback

  const fetchAffiliatedTeams = useCallback(async () => {
    if (video) {
      const { data, error } = await supabase
        .from("team_video_view")
        .select("team")
        .eq("video->>id", video.id);
      if (error) {
        console.error("Error fetching affiliated teams:", error);
        setAffiliatedTeams(null);
        return;
      }
      if (data) setAffiliatedTeams(data.map((tm) => tm.team));
      else setAffiliatedTeams(null);
    }
  }, [video]); // Dependencies for useCallback

  const handleClick = async (id: string) => {
    if (!startTime) {
      if (user.userId) {
        await supabase
          .from("profiles")
          .update({
            last_watched: id,
            last_watched_time: 0,
          })
          .eq("id", user.userId);
      }
      void router.push(`/film-room/${id}`);
    } else {
      void router.push(`/film-room/${id}?start=${startTime}`);
    }
  };

  const copyToClipboard = async () => {
    if (!video) return;
    const origin = window.location.origin;
    const linkToCopy = `${origin}/${video.id}`;
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
    void fetchExclusiveToTeam();
    void fetchAffiliatedTeams();
  }, [video, fetchExclusiveToTeam, fetchAffiliatedTeams]); // Dependencies for useEffect

  return (
    video && (
      <Box
        sx={{
          ...backgroundStyle,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px", // rounded-md
          p: 1, // increased padding slightly
          cursor: "pointer", // Indicate clickability
          border: `1px solid transparent`, // Initial transparent border
          transition:
            "border-color 0.3s ease-in-out, background-color 0.3s ease-in-out",
          // Hover styles for non-list items
          "&:hover": {
            borderColor: hoverBorder,
            backgroundColor: isDark
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.05)",
          },
          width: "100%",
          gap: 1,
        }}
        onClick={() => handleClick(video.id)}
      >
        {/* Top bar: Privacy/Exclusive Team, Timestamp/Season Info, Action Buttons */}
        <Box
          sx={{
            display: "flex",
            width: "100%",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: { xs: "wrap", sm: "nowrap" }, // Allow wrapping on small screens
            flexGrow: 1,
          }}
        >
          {/* Left: Privacy/Exclusive Icon */}
          <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            {!video.private && (
              <IconButton size="small" sx={{ padding: 0 }}>
                <PublicIcon fontSize="small" color="action" />
              </IconButton>
            )}
            {video.private && exclusiveTeam && (
              <IconButton size="small" sx={{ padding: 0 }}>
                <TeamLogo tm={exclusiveTeam} size={25} inactive={true} />
                {/* Popover handled by parent */}
              </IconButton>
            )}
          </Box>

          {/* Middle: Video Metadata (Timestamp, Season/Division) */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center", // Center content if it wraps
              gap: 1,
              flexGrow: 1, // Allows it to take available space
              minWidth: 0, // Allow text to shrink/wrap
              flexWrap: "wrap", // Allow text to wrap if too long
              textAlign: "center", // Center text if wrapped
            }}
          >
            <Typography
              variant="caption" // Use caption for smaller, more compact info
              sx={{
                fontWeight: "bold",
                letterSpacing: "-0.025em",
                color: isDark ? "secondary.main" : "primary.main", // Dynamic color
                flexShrink: 0, // Prevent shrinking
                whiteSpace: "nowrap", // Prevent wrapping
                // border: "1px solid black",
              }}
            >
              {video.season}
              {video.week
                ? ` ${video.week.toLocaleUpperCase()}`
                : video.tournament
                  ? ` ${video.tournament.toLocaleUpperCase()}`
                  : null}
              {` - ${video.division}`}
            </Typography>
          </Box>

          {/* Right: Copy Link and Video Actions Menu */}
          <Box
            onClick={(e) => e.stopPropagation()} // Prevent card click when clicking this section
            sx={{
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <VideoActionsMenu video={video} onCopyLink={copyToClipboard} />
          </Box>
        </Box>

        {/* Video Title */}
        <Box
          sx={{
            width: "100%",

            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PageTitle size="x-small" title={video.title} />
        </Box>

        {/* Affiliated Teams */}
        <VideoAffiliatedTeamsChip affiliatedTeams={affiliatedTeams} />
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

export default Video;
