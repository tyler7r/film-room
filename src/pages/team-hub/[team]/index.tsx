import AddIcon from "@mui/icons-material/Add";
import LockIcon from "@mui/icons-material/Lock";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState, type SyntheticEvent } from "react";
import TeamCollections from "~/components/teams/team-collections";
import TeamLogo from "~/components/teams/team-logo";
import Roster from "~/components/teams/team-roster";
import TeamVideos from "~/components/teams/team-videos";
import PageTitle from "~/components/utils/page-title";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { TeamType } from "~/utils/types";

const TeamHub = () => {
  const router = useRouter();
  const theme = useTheme();
  const { user, affiliations } = useAuthContext();
  const { isDark } = useIsDarkContext();
  const { isMobile } = useMobileContext();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const teamId = router.query.team as string;

  const [team, setTeam] = useState<TeamType | null>(null);
  const [requestCount, setRequestCount] = useState<number>(0);

  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [currentTab, setCurrentTab] = useState<string>("film");

  const handleTabChange = useCallback(
    (_event: SyntheticEvent, newValue: string) => {
      setCurrentTab(newValue);
    },
    [],
  );

  const handleAdminClick = useCallback(() => {
    if (teamId) {
      // Navigate to the new dedicated admin route
      void router.push(`/team-hub/${teamId}/admin`);
    }
  }, [router, teamId]);

  // NEW: Function to fetch pending join request count
  const fetchRequestCount = useCallback(async () => {
    // Only fetch for authorized roles
    if (!teamId || (role !== "owner" && role !== "coach")) {
      setRequestCount(0);
      return;
    }

    // Assumes a 'join_requests' table with 'team_id' and 'status' columns
    const { count, error } = await supabase
      .from("affiliations")
      .select("*", { count: "exact", head: true }) // Using head: true for count only
      .eq("team_id", teamId)
      .eq("verified", "false");

    if (error) {
      console.error("Error fetching request count:", error);
    } else {
      setRequestCount(count ?? 0);
    }
  }, [teamId, role]);

  const fetchUserRole = useCallback(() => {
    const affRole = affiliations?.find((aff) => aff.team.id === team?.id)?.role;
    if (team?.owner === user.userId) {
      setRole("owner");
    } else {
      setRole(affRole ? affRole : "guest");
    }
  }, [affiliations, team, user.userId]);

  const fetchTeam = useCallback(async () => {
    if (!teamId) return;
    const { data, error } = await supabase
      .from("teams")
      .select()
      .eq("id", teamId)
      .single();
    if (error) {
      console.error("Error fetching team:", error);
    }
    if (data) setTeam(data);
    else setTeam(null);
  }, [teamId]);

  // useEffect(() => {
  //   const channel = supabase
  //     .channel(`team_hub_${team?.id}_changes`)
  //     .on(
  //       "postgres_changes",
  //       {
  //         event: "*",
  //         schema: "public",
  //         table: "teams",
  //         filter: `id=eq.${team?.id}`,
  //       },
  //       () => {
  //         if (team) {
  //           void fetchTeam();
  //           void fetchUserRole();
  //         }
  //       },
  //     )
  //     .subscribe();

  //   return () => {
  //     void supabase.removeChannel(channel);
  //   };
  // }, [team, fetchTeam, fetchUserRole]);

  useEffect(() => {
    if (team) {
      setLoading(false);
      fetchUserRole();
    }
  }, [user, team, fetchUserRole]);

  useEffect(() => {
    setLoading(true);
    void fetchTeam();
  }, [router.query.team, fetchTeam]);

  // NEW: Effect to fetch request count when team/role changes
  useEffect(() => {
    if (team && (role === "owner" || role === "coach")) {
      void fetchRequestCount();
    }
  }, [team, role, fetchRequestCount]);

  return loading ? (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "50vh",
        flexDirection: "column",
        width: "100%",
      }}
    >
      <CircularProgress size={80} />
      <PageTitle size="small" title="Loading Team Hub..." />
    </Box>
  ) : (
    team && (
      <Box
        sx={{
          display: "flex",
          width: "100%",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: { xs: 2, md: 4 },
          p: { xs: 1, md: 2 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: "center",
            gap: { xs: 1, md: 2 },
            width: "100%",
            textAlign: "center",
            position: "relative",
          }}
        >
          <TeamLogo size={100} tm={team} />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              textAlign: "center",
            }}
          >
            <PageTitle size="medium" title={team.full_name} />
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                letterSpacing: "-0.025em",
                color: isDark ? "secondary.main" : "primary.main",
              }}
            >
              {team.division.toLocaleUpperCase()}
            </Typography>
          </Box>

          {/* Admin Tools Button (Settings Icon) */}
          {(role === "owner" || role === "coach") && (
            <IconButton
              // This onClick now routes to the dedicated admin page
              onClick={handleAdminClick}
              color={"default"}
              size="large"
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                mt: { xs: 0, md: 1 },
                mr: { xs: 0, md: 1 },
              }}
            >
              <Badge
                badgeContent={requestCount > 0 ? requestCount : 0}
                color="error"
                max={99}
                overlap="circular"
                sx={{
                  "& .MuiBadge-badge": {
                    minWidth: 16,
                    height: 16,
                    padding: "0 4px",
                    fontSize: "0.7rem",
                  },
                }}
              >
                <SettingsIcon fontSize="inherit" />
              </Badge>
            </IconButton>
          )}
        </Box>

        {/* Normal Tabs and Content View */}
        <>
          <Box sx={{ borderBottom: 1, borderColor: "divider", width: "100%" }}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              textColor="primary"
              indicatorColor="primary"
              variant={isMobile ? "scrollable" : "fullWidth"}
              sx={{
                width: "100%",
              }}
            >
              <Tab label="Film" value="film" />
              <Tab label="Roster" value="roster" />
              <Tab label="Collections" value="collections" />
            </Tabs>
          </Box>

          {currentTab === "film" && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: { xs: 4, md: 6 },
                width: "100%",
              }}
            >
              <TeamVideos teamId={team.id} />
            </Box>
          )}

          {currentTab === "roster" && (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Roster team={team} role={role ? role : "guest"} />
            </Box>
          )}

          {currentTab === "collections" && (
            <Box sx={{ width: "100%" }}>
              {role !== "guest" && <TeamCollections teamId={team.id} />}
              {role === "guest" && (
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                  }}
                >
                  <LockIcon fontSize="large" color="info" />
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      color: "text.disabled",
                      my: 1,
                    }}
                  >
                    — Private to members of {team.full_name} —
                  </Typography>
                  <Button
                    onClick={() => void router.push("/team-select")}
                    variant="contained" // Made this 'contained' to distinguish it as the primary action
                    size="small"
                    startIcon={<AddIcon />}
                    sx={{
                      fontSize: isDesktop ? 14 : 10,
                      fontWeight: "bold",
                      mt: 1,
                    }}
                  >
                    JOIN NEW TEAM
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </>
      </Box>
    )
  );
};

export default TeamHub;
