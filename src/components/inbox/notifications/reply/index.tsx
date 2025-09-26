import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked"; // Added for read status icon
import { Box, Divider, IconButton, Typography } from "@mui/material"; // Added useTheme
import { formatDistanceToNowStrict } from "date-fns";
import { useRouter } from "next/router";
import React from "react";
import { useInboxContext } from "~/contexts/inbox";
import { supabase } from "~/utils/supabase";
import { type UnifiedNotificationType } from "~/utils/types";

type InboxReplyProps = {
  notification: UnifiedNotificationType;
};

// Removed styled component definition
const InboxReply = ({ notification }: InboxReplyProps) => {
  // Destructuring updateSingleNotificationViewStatus from context
  const { setIsOpen, updateSingleNotificationViewStatus } = useInboxContext();
  const router = useRouter();

  // ✅ FIX 1: Force the prop value to a strict boolean for reliable logic. (Copied from InboxComment)
  const isViewedBoolean =
    typeof notification.viewed === "string"
      ? notification.viewed.toLowerCase() === "true"
      : !!notification.viewed; // Fallback for standard boolean or null/undefined

  // Use the strictly-typed boolean for calculations
  const isUnread = !isViewedBoolean;

  const handleUpdate = async (isViewed: boolean) => {
    try {
      const { data, error } = await supabase
        .from("replies") // Target table is 'replies'
        .update({ viewed: isViewed })
        .eq("id", notification.source_id)
        .select();

      if (error) {
        throw error;
      }

      // ✅ FIX 2: Update local context state immediately (Copied from InboxComment)
      if (data && data.length > 0) {
        updateSingleNotificationViewStatus(
          notification.source_id,
          isViewed.toString(), // Pass boolean directly
        );
      }
    } catch (error) {
      console.error("Error updating reply status:", error);
    }
  };

  const handleCardClick = async () => {
    // ✅ FIX 3: Only mark as viewed (true) if it is currently UNREAD. (Copied from InboxComment)
    if (isUnread) {
      await handleUpdate(true);
    }
    // Note: The parent comment ID is passed as a query parameter
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
        gap: t.spacing(0.5),
        padding: t.spacing(1),
        // ✅ FIX 4: Apply conditional background styling (Copied from InboxComment)
        backgroundColor: isUnread
          ? t.palette.action.hover // Use a subtle color for unread
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
        {/* ✅ FIX 5: Icon logic (Copied from InboxComment) */}
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
          {/* ✅ FIX 6: Apply actor name hover style (Copied from InboxComment) */}
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
          replied to your comment:{" "}
          <Box component="strong">{notification.related_comment_title}</Box>
        </Typography>
      </Box>
    </Box>
  );
};

export default InboxReply;
