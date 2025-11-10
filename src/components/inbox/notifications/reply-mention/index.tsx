import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked"; // Added for read status icon
import { Box, Divider, IconButton, Typography } from "@mui/material";
import { formatDistanceToNowStrict } from "date-fns";
import { useRouter } from "next/router";
import React from "react";
import { useInboxContext } from "~/contexts/inbox";
import { supabase } from "~/utils/supabase";
import { type UnifiedNotificationType } from "~/utils/types";

type InboxReplyMentionProps = {
  notification: UnifiedNotificationType;
};

const InboxReplyMention = ({ notification }: InboxReplyMentionProps) => {
  const { setIsOpen, updateSingleNotificationViewStatus } = useInboxContext();
  const router = useRouter();

  // Force the prop value to a strict boolean for reliable logic.
  const isViewedBoolean =
    typeof notification.viewed === "string"
      ? notification.viewed.toLowerCase() === "true"
      : !!notification.viewed;

  const isUnread = !isViewedBoolean;

  // IMPORTANT: This handles updating the source content's 'viewed' status,
  // not the notification row itself, mimicking the pattern in the provided example.
  const handleUpdate = async (isViewed: boolean) => {
    try {
      // Target table is 'comments' since the mention is in a comment
      const { data, error } = await supabase
        .from("notifications")
        .update({ is_read: isViewed })
        .eq("id", notification.source_id)
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // Update local context state immediately
        updateSingleNotificationViewStatus(
          notification.source_id,
          isViewed.toString(),
        );
      }
    } catch (error) {
      console.error("Error updating comment mention status:", error);
    }
  };

  const handleCardClick = async () => {
    // Only mark as viewed (true) if it is currently UNREAD.
    if (isUnread) {
      await handleUpdate(true);
    }

    // Use robust deep linking for mentions
    void router.push(
      `/play/${notification.related_play_id}?comment=${notification.related_comment_id}`,
    );
    setIsOpen(false);
  };

  const handleActorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    void router.push(`/profile/${notification.actor_id}`);
    setIsOpen(false);
  };

  const handleMarkAsUnread = async (e: React.MouseEvent, status: boolean) => {
    e.stopPropagation();
    await handleUpdate(status);
  };

  return (
    <Box
      onClick={handleCardClick}
      sx={(t) => ({
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: t.spacing(1),
        padding: t.spacing(1),
        backgroundColor: isUnread
          ? t.palette.action.hover
          : t.palette.background.paper,
        borderRadius: "4px",
        border: `1px solid ${t.palette.divider}`,
        transition: "all 0.2s ease-in-out",
        cursor: "pointer",
        "&:hover": {
          borderColor: t.palette.primary.main,
          boxShadow: t.shadows[2],
          transform: "translateY(-2px)",
        },
      })}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {isUnread ? (
          // UNREAD: Filled dot
          <IconButton
            size="small"
            onClick={(e) => handleMarkAsUnread(e, true)}
            aria-label="Mark as read"
            sx={{ p: 0 }}
          >
            <FiberManualRecordIcon
              fontSize="small"
              color="primary"
              aria-label="Unread indicator"
            />
          </IconButton>
        ) : (
          // READ: Hollow dot/Mark as Unread button
          <IconButton
            size="small"
            onClick={(e) => handleMarkAsUnread(e, false)}
            aria-label="Mark as unread"
            sx={{ p: 0 }}
          >
            <RadioButtonUncheckedIcon fontSize="small" color="action" />
          </IconButton>
        )}

        <Typography variant="caption" color="text.secondary" fontStyle="italic">
          {formatDistanceToNowStrict(new Date(notification.created_at), {
            addSuffix: true,
          })}
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, px: 0.5 }}>
        <Typography
          variant="body2"
          sx={{ flex: 1, overflowWrap: "break-word" }}
        >
          <Box
            component="strong"
            onClick={handleActorClick}
            sx={(t) => ({
              cursor: "pointer",
              transition: "color 0.1s ease-in-out",
              color: t.palette.text.primary,
              "&:hover": {
                color:
                  t.palette.mode === "dark"
                    ? t.palette.primary.dark
                    : t.palette.primary.light,
              },
            })}
          >
            {notification.actor_name}
          </Box>{" "}
          mentioned you in a reply on
          <Box component="strong" sx={{ p: 0.5 }}>
            {notification.related_comment_title}
          </Box>
          <br />
          <Typography variant="caption" color="text.secondary">
            "{notification.content_preview?.slice(0, 100)}..."
          </Typography>
        </Typography>
      </Box>
    </Box>
  );
};

export default InboxReplyMention;
