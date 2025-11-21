import NotificationsIcon from "@mui/icons-material/Notifications";
import {
  Badge,
  Box, // Added Typography for text styling
  Button,
  Card,
  CircularProgress, // Import Tabs for navigation
  Tab, // Keep IconButton for edit
  Tabs,
  Tooltip,
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
import { useAuthContext } from "~/contexts/auth";
import { useInboxContext } from "~/contexts/inbox";
import { useMobileContext } from "~/contexts/mobile";
import { useIsDarkContext } from "~/pages/_app";
import { getDisplayName } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { UserType } from "~/utils/types";

type FetchOptions = {
  profileId: string;
};

const Profile = () => {
  const router = useRouter();
  const { user, affiliations } = useAuthContext();
  const { backgroundStyle } = useIsDarkContext();
  const { isMobile } = useMobileContext();
  const theme = useTheme();
  const { unreadCount, toggleOpen } = useInboxContext();

  const [options, setOptions] = useState<FetchOptions>({
    profileId: router.query.user as string,
  });
  const [profile, setProfile] = useState<UserType | null>(null);
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
          return;
        }

        if (profileData) {
          setProfile(profileData);
        }
      }
    },
    [router.query.user],
  ); // Added router.query.user to dependencies

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
        pb: 8,
      }}
    >
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
            justifyContent: "center",
          }}
        >
          <PageTitle
            size={isMobile ? "medium" : "large"}
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
          {user.userId === router.query.user && (
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
          )}

          {/* Profile Edit Button */}
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

        <Box
          sx={{
            width: "100%",
            mb: 2,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <ProfileStats profileId={profile.id} />
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
                <TeamAffiliation key={aff.affId} aff={aff} />
              ))}
            </Box>
          )}
        </Box>
      </Card>

      {/* 4. Collections Section */}
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
