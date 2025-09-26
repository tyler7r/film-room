import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord"; // Re-added for completeness
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked"; // Re-added for read status
import { Box, Divider, IconButton, Typography } from "@mui/material"; // Added IconButton
import { formatDistanceToNowStrict } from "date-fns";
import { useRouter } from "next/router";
import React from "react";
import { useInboxContext } from "~/contexts/inbox";
import { supabase } from "~/utils/supabase";
import { type UnifiedNotificationType } from "~/utils/types";

type InboxMentionProps = {
  notification: UnifiedNotificationType;
};

const InboxMention = ({ notification }: InboxMentionProps) => {
  const { setIsOpen, updateSingleNotificationViewStatus } = useInboxContext();
  const router = useRouter();

  // ✅ FIX: Force the prop value to a strict boolean for reliable logic.
  // This handles the case where notification.viewed is the string "false" or "true".
  const isViewedBoolean =
    typeof notification.viewed === "string"
      ? notification.viewed.toLowerCase() === "true"
      : !!notification.viewed; // Fallback for standard boolean or null/undefined

  // Use the strictly-typed boolean for calculations
  const isUnread = !isViewedBoolean;

  const handleUpdate = async (isViewed: boolean) => {
    try {
      // Logic for updating the database table specific to mentions
      const { data, error } = await supabase
        .from("play_mentions")
        .update({ viewed: isViewed })
        .eq("id", notification.source_id)
        .select();

      if (error) {
        throw error;
      }

      // CRITICAL: Update the local context state immediately
      if (data && data.length > 0) {
        // We use source_id here, which is stable, and rely on the context to update the list item.
        updateSingleNotificationViewStatus(
          notification.source_id,
          isViewed.toString(),
        );
        // We no longer need to update local state here as we rely on context/prop updates.
      }
    } catch (error) {
      console.error("Error updating mention status:", error);
    }
  };

  const handleCardClick = async () => {
    // ✅ FIX 1: Only mark as viewed (true) if it is currently UNREAD.
    if (isUnread) {
      await handleUpdate(true);
    }
    void router.push(`/play/${notification.related_play_id}`);
    setIsOpen(false);
  };

  const handleActorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    void router.push(`/profile/${notification.actor_id}`);
    setIsOpen(false);
  };

  const handleMarkAsUnread = async (e: React.MouseEvent, status: boolean) => {
    e.stopPropagation();
    // Logic for updating the database table specific to mentions
    await handleUpdate(status);
  };

  return (
    <Box
      onClick={handleCardClick}
      // All styling moved here to the sx prop
      sx={(t) => ({
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: t.spacing(1),
        padding: t.spacing(1),
        // ✅ FIX 2: Apply conditional background styling to the whole card when unread.
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
            onClick={handleActorClick}
          >
            {notification.actor_name}
          </Box>{" "}
          mentioned you in{" "}
          <Box component="strong">{notification.related_play_title}</Box>
        </Typography>
      </Box>
    </Box>
  );
};

export default InboxMention;
