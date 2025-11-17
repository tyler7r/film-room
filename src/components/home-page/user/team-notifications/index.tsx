import { Box, Button, Card, Stack, Typography, useTheme } from "@mui/material";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import TeamLogo from "~/components/teams/team-logo";
import EmptyMessage from "~/components/utils/empty-msg";
import PageTitle from "~/components/utils/page-title";
import { supabase } from "~/utils/supabase";
import { type TeamNotificationType, type TeamType } from "~/utils/types";

type TeamActivitySectionProps = {
  teamAffiliations: TeamType[];
};

const TeamActivitySection = ({
  teamAffiliations,
}: TeamActivitySectionProps) => {
  const router = useRouter();
  const theme = useTheme();

  const [notifications, setNotifications] = useState<TeamNotificationType[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);

  const fetchTeamNotifications = useCallback(async () => {
    if (teamAffiliations.length === 0) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    const teamIds = teamAffiliations.map((aff) => aff.id);

    // REAL: Supabase query targeting the new view
    const { data, error } = await supabase
      .from("team_notification_feed")
      .select("*")
      // Filter by any team ID the user belongs to
      .in("team_id", teamIds)
      .order("created_at", { ascending: false })
      .limit(5); // Show top 5 recent notifications

    if (error) {
      console.error("Error fetching team notifications:", error);
    } else if (data) {
      // Data is already correctly formatted from the view
      setNotifications(data as TeamNotificationType[]);
    }
    setIsLoading(false);
  }, [teamAffiliations]);

  useEffect(() => {
    void fetchTeamNotifications();
  }, [fetchTeamNotifications]);

  const getEntityPath = (notification: TeamNotificationType): string => {
    switch (notification.entity_type) {
      case "video":
        return `/film-room/${notification.entity_id}`;
      case "play":
        return `/play/${notification.entity_id}`;
      case "collection":
        return `/collections/${notification.entity_id}`;
      default:
        return `/`; // Fallback
    }
  };

  const formatActivityDescription = (
    notification: TeamNotificationType,
  ): string => {
    // 1. Define the styled actor name (Primary Color, bolded for emphasis)
    const actor = `<span style="color: var(--primary-main); font-weight: bold;">${notification.actor_name}</span>`;
    const title = notification.entity_title;

    let description: string;

    switch (notification.entity_type) {
      case "video":
        description = `${actor} uploaded a new video: *${title}*`;
        break;
      case "play":
        description = `${actor} created a new play: *${title}*`;
        break;
      case "collection":
        description = `${actor} created a new collection: *${title}*`;
        break;
      default:
        description = `${actor} performed an action on ${title}.`;
        break;
    }

    // 2. Wrap the entire description in a span set to var(--text-primary).
    // This ensures the remaining text is correctly themed (black in light mode, white in dark mode).
    return `<span>${description}</span>`;
  };

  return (
    <Card
      elevation={4}
      sx={{
        width: "100%",
        borderRadius: "12px",
        p: 2,
      }}
    >
      <PageTitle title="Team Activity Feed" size="small" />
      <Stack spacing={1} sx={{ mt: 1 }}>
        {isLoading ? (
          <Typography variant="body2" color="text.secondary">
            Loading team activities...
          </Typography>
        ) : notifications.length > 0 ? (
          <>
            {notifications.map((notification) => (
              <Button
                key={notification.entity_id + notification.created_at}
                onClick={() => router.push(getEntityPath(notification))}
                variant="text"
                color="info"
                sx={{
                  justifyContent: "flex-start",
                  textAlign: "left",
                  textTransform: "none",
                  py: 0.5,
                  px: 0,
                  borderBottom: `2px solid ${theme.palette.divider}`,
                }}
              >
                <Box sx={{ px: 1 }}>
                  <TeamLogo
                    tm={{
                      id: notification.team_id,
                      logo: notification.team_logo,
                      name: notification.team_name,
                    }}
                    size={25}
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <Typography
                    variant="body2"
                    component="div"
                    sx={{ display: "flex", gap: 1 }}
                  >
                    <Typography
                      component="span"
                      variant="body2"
                      dangerouslySetInnerHTML={{
                        __html: formatActivityDescription(notification),
                      }}
                    />
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(notification.created_at).toLocaleTimeString()} on{" "}
                    {new Date(notification.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </Button>
            ))}
            <Button
              size="small"
              variant="text"
              sx={{ justifyContent: "flex-start" }}
              // onClick={() => router.push("/team/notifications")}
            >
              View More Team Updates
            </Button>
          </>
        ) : (
          <Box
            sx={{ width: "100%", justifyContent: "center", display: "flex" }}
          >
            <EmptyMessage message="recent team activity" />
          </Box>
        )}
      </Stack>
    </Card>
  );
};

export default TeamActivitySection;
