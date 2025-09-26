import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import MailIcon from "@mui/icons-material/Mail";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import {
  Box,
  CircularProgress,
  Fab,
  IconButton,
  Typography,
} from "@mui/material";
import InfiniteScroll from "react-infinite-scroll-component";
import EmptyMessage from "~/components/utils/empty-msg";
import PageTitle from "~/components/utils/page-title";
import StandardPopover from "~/components/utils/standard-popover";
import { useInboxContext } from "~/contexts/inbox";
// Assuming you have separate components for each notification type
import { type UnifiedNotificationType } from "~/utils/types";
import InboxComment from "./comment";
import InboxMention from "./mention";
import InboxReply from "./reply";

const InboxNotification = () => {
  const {
    notifications,
    notificationCount,
    unreadOnly,
    setUnreadOnly,
    isLoadingInitial,
    isLoadingMore,
    hasMoreNotifications,
    loadMoreNotifications,
    inboxScrollableRef,
  } = useInboxContext();

  const scrollToTop = () => {
    if (inboxScrollableRef.current) {
      inboxScrollableRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderNotification = (notification: UnifiedNotificationType) => {
    if (!notification) return null;
    switch (notification.notification_type) {
      case "mention":
        return <InboxMention notification={notification} />;
      case "comment":
        return <InboxComment notification={notification} />;
      case "reply":
        return <InboxReply notification={notification} />;
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        pb: 4,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          py: 1,
        }}
      >
        <PageTitle title="Notifications" size="small" />
        <StandardPopover
          content={`${
            unreadOnly ? "Show All Notifications" : "Show Unread Only"
          }`}
          children={
            <IconButton size="small" onClick={() => setUnreadOnly(!unreadOnly)}>
              {unreadOnly ? (
                <MailIcon color="primary" />
              ) : (
                <MailOutlineIcon color="primary" />
              )}
            </IconButton>
          }
        />
      </Box>

      {notificationCount !== null && (
        <Typography
          variant="body2"
          sx={{ fontWeight: "bold", textAlign: "center" }}
        >
          {notificationCount} results found
        </Typography>
      )}
      {notifications && (
        <Box ref={inboxScrollableRef} sx={{}}>
          {isLoadingInitial ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexGrow: 1,
              }}
            >
              <CircularProgress />
            </Box>
          ) : notifications.length === 0 ? (
            <Box
              sx={{ display: "flex", width: "100%", justifyContent: "center" }}
            >
              <EmptyMessage message="notifications" />
            </Box>
          ) : (
            <InfiniteScroll
              dataLength={notifications.length}
              next={loadMoreNotifications}
              hasMore={hasMoreNotifications}
              loader={
                isLoadingMore ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      my: 2,
                    }}
                  >
                    <CircularProgress size={24} />
                  </Box>
                ) : null
              }
              endMessage={
                !hasMoreNotifications &&
                notifications.length > 0 && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      textAlign: "center",
                      color: "text.disabled",
                      my: 2,
                    }}
                  >
                    — End of notifications —
                  </Typography>
                )
              }
              scrollableTarget="inbox-scrollable-container"
              scrollThreshold={0.9}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  px: { md: 2, lg: 4 },
                  py: 1,
                }}
              >
                {notifications.map((notification) => (
                  <Box key={notification.source_id}>
                    {renderNotification(notification)}
                  </Box>
                ))}
              </Box>
            </InfiniteScroll>
          )}
        </Box>
      )}

      {notifications && notifications.length > 0 && (
        <Fab
          color="primary"
          onClick={scrollToTop}
          size="small"
          sx={{
            position: "fixed",
            bottom: "16px",
            right: "16px",
            zIndex: 1000,
          }}
          aria-label="Scroll to top"
        >
          <ArrowUpwardIcon />
        </Fab>
      )}
    </Box>
  );
};

export default InboxNotification;
