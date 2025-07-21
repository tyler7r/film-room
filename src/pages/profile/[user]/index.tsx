import AddIcon from "@mui/icons-material/Add";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import {
  Box, // Added Typography for text styling
  Button,
  CircularProgress, // Import Tabs for navigation
  Tab, // Keep IconButton for edit
  Tabs,
  Typography,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/router";
import { type SyntheticEvent, useCallback, useEffect, useState } from "react"; // Added useCallback, SyntheticEvent
import ProfileCollections from "~/components/profiles/profile-collections";
import ProfileEdit from "~/components/profiles/profile-edit";
import CreatedFeed from "~/components/profiles/profile-feed/created";
import HighlightsFeed from "~/components/profiles/profile-feed/highlights";
import MentionsFeed from "~/components/profiles/profile-feed/mentions";
import ProfileStats from "~/components/profiles/profile-stats";
import TeamAffiliation from "~/components/teams/team-affiliation";
import PageTitle from "~/components/utils/page-title";
import Video from "~/components/videos/video";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { useIsDarkContext } from "~/pages/_app";
import { getDisplayName } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type {
  LastWatchedType, // Will adapt this or create new state for tabs
  TeamAffiliationType,
  UserType,
} from "~/utils/types";

type FetchOptions = {
  profileId: string;
};

const Profile = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { backgroundStyle } = useIsDarkContext();
  const { isMobile } = useMobileContext();
  const theme = useTheme();

  const [options, setOptions] = useState<FetchOptions>({
    profileId: router.query.user as string,
  });
  const [profile, setProfile] = useState<UserType | null>(null);
  const [profileAffiliations, setProfileAffiliations] = useState<
    TeamAffiliationType[] | null
  >(null);

  const [lastWatched, setLastWatched] = useState<LastWatchedType | null>(null);
  // Replaced actionBarStatus with selectedTab for Material UI Tabs
  const [selectedTab, setSelectedTab] = useState<
    "created" | "mentions" | "highlights"
  >("created");

  const handleChangeTab = (
    _event: SyntheticEvent,
    newValue: "created" | "mentions" | "highlights",
  ) => {
    setSelectedTab(newValue);
  };

  const fetchProfile = useCallback(
    async (currentOptions?: FetchOptions) => {
      const profileIdToFetch =
        currentOptions?.profileId ?? (router.query.user as string);

      if (profileIdToFetch) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", profileIdToFetch)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          setProfile(null);
          setProfileAffiliations(null);
          return;
        }

        if (profileData) {
          setProfile(profileData);

          const { data: userData, error: userError } = await supabase
            .from("user_view")
            .select("*")
            .eq("profile->>id", profileIdToFetch);

          if (userError) {
            console.error("Error fetching user affiliations:", userError);
            setProfileAffiliations(null);
            return;
          }

          if (userData) {
            const typedAffiliations: TeamAffiliationType[] = userData
              .filter((aff) => aff.affiliation.verified)
              .map((aff) => ({
                team: aff.team,
                role: aff.affiliation.role,
                number: aff.affiliation.number,
                affId: aff.affiliation.id,
              }));
            setProfileAffiliations(
              typedAffiliations.length > 0 ? typedAffiliations : null,
            );
          } else {
            setProfileAffiliations(null);
          }
        }
      }
    },
    [router.query.user],
  ); // Added router.query.user to dependencies

  const fetchLastWatched = useCallback(async () => {
    if (user.userId && user.userId === options.profileId) {
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
      if (data?.video) setLastWatched(data);
      else setLastWatched(null);
    }
  }, [user.userId, options.profileId]); // Added options.profileId to dependencies

  // Realtime subscription for profile updates
  // useEffect(() => {
  //   if (!supabase) {
  //     console.warn("Supabase client is not initialized for real-time.");
  //     return;
  //   }

  //   const channel = supabase
  //     .channel("profile_changes")
  //     .on(
  //       "postgres_changes",
  //       { event: "UPDATE", schema: "public", table: "profiles" },
  //       () => {
  //         void fetchProfile(); // Re-fetch profile on update
  //       },
  //     )
  //     .subscribe();

  //   return () => {
  //     void supabase.removeChannel(channel);
  //   };
  // }, [fetchProfile]); // Dependency on memoized fetchProfile

  // Effect for initial fetch of last watched
  useEffect(() => {
    if (user.userId) void fetchLastWatched();
  }, [user, fetchLastWatched]); // Dependencies on user and memoized fetchLastWatched

  // Effect to update options state when router query changes
  useEffect(() => {
    setOptions({
      ...options,
      profileId: router.query.user as string,
    });
  }, [router.query.user]); // Only depends on router.query.user

  // Effect to fetch profile when options change
  useEffect(() => {
    void fetchProfile(options);
  }, [options, fetchProfile]); // Depends on options and memoized fetchProfile

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
        <CircularProgress />
      </Box>
    ); // Or a loading spinner/skeleton
  }

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2, // Increased gap for overall spacing between major sections
        p: 2, // Responsive padding for the whole page
      }}
    >
      {/* 1. Unified Profile Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "column" },
          alignItems: { xs: "center", sm: "center" },
          justifyContent: { xs: "center", sm: "center" },
          width: { xs: "100%", sm: "90%", md: "70%" },
          maxWidth: "800px",
          p: 2,
          borderRadius: "12px",
          boxShadow: 3,
          ...backgroundStyle,
          position: "relative",
        }}
      >
        {/* Name, Join Date, Edit Button */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: { xs: "center", sm: "center" },
            // flexShrink: 0, // <-- REMOVE or adjust this, it prevents shrinking
            textAlign: { xs: "center", sm: "center" },
            width: "100%", // Take full width of its direct parent flex item
            // Max width to ensure it doesn't push out of the parent Box
            maxWidth: { xs: "100%", sm: "calc(100% - 48px)" }, // Example: 48px for p:2 (16px left + 16px right) + some buffer
          }}
        >
          <PageTitle
            size={isMobile ? "medium" : "large"}
            title={getDisplayName(profile)}
            // No additional sx needed here as PageTitle itself has the truncation logic
          />

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 2, fontWeight: "light", letterSpacing: "-0.025em" }}
          >
            Member since {profile.join_date.substring(0, 4)}
          </Typography>
          {user.userId === router.query.user && (
            <Box
              sx={{
                position: "absolute",
                top: 5,
                right: 5,
              }}
            >
              <ProfileEdit profile={profile} />
            </Box>
          )}
        </Box>

        {/* Profile Stats */}
        <ProfileStats profileId={options.profileId} />
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center", // Center content vertically within this section
          gap: 1,
          p: 2,
          borderRadius: "12px",
          boxShadow: 2,
          ...backgroundStyle,
          width: { xs: "100%", sm: "90%", md: "70%" },
          maxWidth: "800px",
        }}
      >
        <PageTitle title="Team Affiliations" size="small" />
        {profileAffiliations && profileAffiliations.length > 0 ? (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center", // Always center affiliations for better mobile look
              width: "100%",
            }}
          >
            {profileAffiliations.map((aff) => (
              <TeamAffiliation key={aff.affId} aff={aff} />
            ))}
          </Box>
        ) : (
          router.query.user === user.userId && (
            <Button
              onClick={() => void router.push("/team-select")}
              variant="outlined"
              startIcon={<AddIcon />}
              sx={{
                ...backgroundStyle,
                py: 1,
                px: 2,
                borderRadius: "8px",
                fontWeight: "bold",
                textTransform: "none",
                border: `1px solid ${theme.palette.divider}`,
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  boxShadow: 1,
                },
              }}
            >
              JOIN A NEW TEAM!
            </Button>
          )
        )}
      </Box>
      {/* </Box> */}

      {/* 5. Optional: Continue Watching (Personalized) */}
      {router.query.user === user.userId && lastWatched && (
        <Box
          sx={{
            display: "flex",
            width: { xs: "100%", sm: "90%", md: "70%" },
            maxWidth: "800px",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
            borderRadius: "12px",
            boxShadow: 2,
            ...backgroundStyle,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PlayArrowIcon fontSize="large" color="primary" />
            <PageTitle size="small" title="Continue Watching" />
          </Box>
          <Box sx={{ width: "100%" }}>
            <Video
              video={lastWatched.video}
              startTime={`${lastWatched.profile.last_watched_time}`}
            />
          </Box>
        </Box>
      )}

      {/* 4. Collections Section */}
      <Box
        sx={{
          width: { xs: "100%", sm: "90%", md: "70%" },
          maxWidth: "800px",
          p: 2,
          borderRadius: "12px",
          boxShadow: 2,
          ...backgroundStyle,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <ProfileCollections profileId={profile.id} />
      </Box>

      {/* 3. Tabbed Activity Feeds */}
      <Tabs
        value={selectedTab}
        onChange={handleChangeTab}
        textColor="primary"
        indicatorColor="primary"
        variant="fullWidth"
        sx={{
          width: "100%",
          borderBottom: 1, // Add a subtle bottom border
          borderColor: "divider",
          "& .MuiTabs-indicator": {
            height: "3px", // Thicker indicator
            borderRadius: "2px", // Rounded indicator
          },
        }}
      >
        <Tab value="created" label="Created" sx={{ fontWeight: "bold" }} />
        <Tab value="mentions" label="Mentions" sx={{ fontWeight: "bold" }} />
        <Tab
          value="highlights"
          label="Highlights"
          sx={{ fontWeight: "bold" }}
        />
      </Tabs>

      {selectedTab === "created" && (
        <CreatedFeed profileId={options.profileId} />
      )}
      {selectedTab === "mentions" && (
        <MentionsFeed profileId={options.profileId} /> // Pass mentionedUserId prop
      )}
      {selectedTab === "highlights" && (
        <HighlightsFeed profileId={options.profileId} />
      )}
    </Box>
  );
};

export default Profile;
