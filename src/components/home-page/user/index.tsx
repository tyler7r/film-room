import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AddIcon from "@mui/icons-material/Add";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
// RESTORED: Relying on Next.js setup
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import AddContentBtn from "~/components/navbar/add-content-btn";
// RESTORED: Relying on local component and utility paths
import ProfileCollections from "~/components/profiles/profile-collections";
import ProfileEdit from "~/components/profiles/profile-edit";
import TeamLogo from "~/components/teams/team-logo";
import PageTitle from "~/components/utils/page-title";
import Video from "~/components/videos/video";
import { useAuthContext } from "~/contexts/auth";
import { useInboxContext } from "~/contexts/inbox"; // RESTORED
import { useIsDarkContext } from "~/pages/_app";
import { getDisplayName } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import { type LastWatchedType, type UserType } from "~/utils/types";
import TeamActivitySection from "./team-notifications";

// --- TEAM ACTIVITY SECTION (Used for dedicated feed) ---
// Note: This section currently uses hardcoded mock data for the feed content
// until we implement the actual data fetching from the proposed unified view.

const Home = () => {
  const router = useRouter();
  const { user, affiliations } = useAuthContext();
  const { backgroundStyle, hoverBorder } = useIsDarkContext();
  //   const { isMobile } = useMobileContext();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  // REAL: Using the actual InboxContext for notification count and toggle
  const { unreadCount, toggleOpen } = useInboxContext();

  const [profile, setProfile] = useState<UserType | null>(null);
  const [lastWatched, setLastWatched] = useState<LastWatchedType | null>(null);

  const teamAffiliations = affiliations
    ? affiliations.map((aff) => aff.team)
    : [];

  // REAL: Restoring original Supabase fetching logic
  const fetchProfile = useCallback(async () => {
    const profileIdToFetch = user.userId;

    if (profileIdToFetch) {
      // 1. Fetch Profile Data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileIdToFetch)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        setProfile(null);
        return;
      }

      setProfile(profileData as UserType);
    }
  }, [user.userId]);

  // REAL: Restoring original Supabase fetching logic
  const fetchLastWatched = useCallback(async () => {
    if (user.userId) {
      const { data, error } = await supabase
        .from("last_watched_view")
        .select()
        .eq("profile->>id", `${user.userId}`)
        .single();

      if (error) {
        console.error("Error fetching last watched:", error);
        setLastWatched(null);
        return;
      }
      if (data?.video) setLastWatched(data as LastWatchedType);
      else setLastWatched(null);
    }
  }, [user.userId]);

  useEffect(() => {
    const initializeData = async () => {
      if (user.userId) {
        await fetchProfile();
        await fetchLastWatched();
      }
    };
    void initializeData();
  }, [user, fetchProfile, fetchLastWatched]);

  if (!profile) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography>Loading Dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        p: 2,
        pb: 4,
      }}
    >
      {/* 1. Unified Profile Header and Team Affiliations */}
      <Card
        elevation={4}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: { xs: "100%", sm: "90%", md: "70%" },
          maxWidth: "800px",
          p: 2,
          borderRadius: "12px",
          boxShadow: 3,
          ...backgroundStyle,
          position: "relative",
          border: `3px solid ${theme.palette.divider}`, // Strong border
        }}
      >
        {/* Name, Join Date, Notifications, Edit Button */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            width: "100%",
          }}
        >
          <PageTitle
            size={!isDesktop ? "medium" : "large"}
            title={getDisplayName(profile)}
          />

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 2, fontWeight: "light", letterSpacing: "-0.025em" }}
          >
            Member since {profile.join_date.substring(0, 4)}
          </Typography>

          {/* New Notification Badge (Option A) */}
          <Tooltip title="View Inbox">
            <Button
              onClick={toggleOpen}
              sx={{
                position: "absolute",
                top: 5,
                left: 5,
                p: 1,
                minWidth: "auto",
                borderRadius: "50%",
              }}
            >
              <Badge
                badgeContent={unreadCount}
                color="error"
                overlap="circular"
              >
                <NotificationsIcon color="action" />
              </Badge>
            </Button>
          </Tooltip>

          {/* Profile Edit Button */}
          <Box
            sx={{
              position: "absolute",
              top: 5,
              right: 5,
            }}
          >
            <ProfileEdit profile={profile} />
          </Box>
        </Box>

        {/* 2. Team Affiliations (Restyled to be clean/unboxed) */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          {affiliations && affiliations.length > 0 && (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 0.25,
                width: "100%",
                borderTop: `1px solid ${theme.palette.primary.main}`,
                pt: 1,
              }}
            >
              {affiliations.map((aff) => (
                <Box
                  key={aff.team.id}
                  onClick={() => void router.push(`/team-hub/${aff.team.id}`)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    gap: 1, // Slightly increased gap for better spacing
                    // Conditional styling for hover effect, only if not in listItem mode
                    cursor: "pointer",
                    borderRadius: "8px", // Apply some border radius
                    p: 0.5, // Add padding for visual comfort
                    transition:
                      "background-color 0.3s ease-in-out, border-color 0.3s ease-in-out", // Smooth transition
                    border: `1px solid transparent`, // Initial transparent border
                    "&:hover": {
                      borderColor: hoverBorder, // Apply hover border color
                      backgroundColor: "action.hover", // Subtle background on hover
                    },
                  }}
                >
                  <TeamLogo tm={aff.team} size={25} />
                  <Divider flexItem orientation="vertical" variant="middle" />
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start", // Align text to start
                      justifyContent: "center",
                      lineHeight: 1.2, // Tighter line height for compactness
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Typography
                        variant={"body2"} // Use body2 for smaller text
                        sx={{
                          fontWeight: "bold",
                          letterSpacing: "-0.025em", // Converted from tracking-tight
                          lineHeight: "inherit", // Inherit from parent Box
                        }}
                      >
                        {aff.team.full_name}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          {/* New Button Action Area */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: isDesktop ? 2 : 1, // Space between buttons
              width: "100%",
              mt: 1, // Margin top to separate from affiliations/info
              borderTop:
                affiliations && affiliations.length > 0
                  ? "none"
                  : `1px solid ${theme.palette.primary.main}`, // Optional divider if no affiliations are present
              pt: affiliations && affiliations.length > 0 ? 0 : 2,
            }}
          >
            {/* Go To Your Profile Button */}
            <Button
              onClick={() => void router.push(`/profile/${user.userId}`)}
              variant="outlined"
              size="small"
              startIcon={<AccountCircleIcon />}
              sx={{ fontSize: isDesktop ? 14 : 10, fontWeight: "bold" }}
            >
              VIEW YOUR PROFILE
            </Button>

            {/* Join New Team Button (Replaced original logic) */}
            <Button
              onClick={() => void router.push("/team-select")}
              variant="contained" // Made this 'contained' to distinguish it as the primary action
              size="small"
              startIcon={<AddIcon />}
              sx={{ fontSize: isDesktop ? 14 : 10, fontWeight: "bold" }}
            >
              JOIN NEW TEAM
            </Button>
          </Box>
        </Box>
      </Card>

      {/* 3. Optional: Continue Watching (Personalized) */}
      {lastWatched && (
        <Card
          elevation={4}
          sx={{
            width: { xs: "100%", sm: "90%", md: "70%" },
            maxWidth: "800px",
            p: 2,
            borderRadius: "16px",
            backgroundColor: theme.palette.background.paper, // Highlight color
            // ...backgroundStyle,
            border: `3px solid ${theme.palette.primary.main}`, // Strong border
            display: "flex",
            flexDirection: "column",
            gap: 2,
            transition: "transform 0.2s, box-shadow 0.2s",
            "&:hover": {
              transform: "translateY(-2px)", // Lift the card slightly
              boxShadow: theme.shadows[6], // Enhance the shadow on hover
            },
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
            <PlayArrowIcon
              fontSize="large"
              sx={{ color: theme.palette.primary.main }}
            />
            <PageTitle size="small" title="Continue Watching" />
          </Box>
          <Box sx={{ width: "100%" }}>
            <Video
              video={lastWatched.video}
              startTime={`${lastWatched.profile.last_watched_time}`}
              disableHover={true}
            />
          </Box>
        </Card>
      )}

      {/* 4. Team Activity Feed (Dedicated Section) */}
      <Box
        sx={{
          width: { xs: "100%", sm: "90%", md: "70%" },
          maxWidth: "800px",
        }}
      >
        {/* Pass the array of team IDs to fetch relevant events */}
        <TeamActivitySection teamAffiliations={teamAffiliations} />
      </Box>

      {/* 5. Collections Section */}
      <Card
        elevation={4}
        sx={{
          width: { xs: "100%", sm: "90%", md: "70%" },
          maxWidth: "800px",
          borderRadius: "16px",
          backgroundColor: theme.palette.background.paper, // Use paper color
          p: 0, // Padding is handled inside ProfileCollections mock
        }}
      >
        <ProfileCollections profileId={profile.id} />
      </Card>

      {/* Floating Action Buttons */}
      <AddContentBtn />
    </Box>
  );
};

export default Home;
