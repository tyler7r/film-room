import {
  Badge,
  Box,
  CircularProgress,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState, type SyntheticEvent } from "react";
import TeamAdmin from "~/components/teams/team-admin";
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
  const { user, affiliations } = useAuthContext();
  const { isDark } = useIsDarkContext();
  const { isMobile } = useMobileContext();

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
        </Box>
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
            {(role === "owner" || role === "coach") && (
              <Tab
                label={
                  <Badge
                    color="error" // Use "error" color for attention
                    badgeContent={requestCount > 0 ? requestCount : 0} // Show badge only if count > 0
                    max={99} // Cap the number displayed
                  >
                    Admin Tools
                  </Badge>
                }
                value="admin"
              />
            )}
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
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ textAlign: "center", mt: 4 }}
              >
                Join the team to view collections!
              </Typography>
            )}
          </Box>
        )}

        {(role === "owner" || role === "coach") && currentTab === "admin" && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: { xs: 4, md: 6 },
              width: "100%",
            }}
          >
            <TeamAdmin
              team={team}
              role={role ? role : "guest"}
              requestCount={requestCount}
              setRequestCount={setRequestCount}
              setRole={setRole}
            />
          </Box>
        )}
      </Box>
    )
  );
};

export default TeamHub;
