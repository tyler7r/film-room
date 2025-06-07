import CloseIcon from "@mui/icons-material/Close"; // Import CloseIcon for the dialog
import PersonIcon from "@mui/icons-material/Person";
import {
  Avatar, // Import Avatar
  Box,
  Chip, // Import Chip
  Dialog, // Import DialogTitle
  DialogContent, // Import Dialog
  DialogTitle,
  IconButton, // Import DialogContent
  List, // Import List
  ListItem, // Import ListItem
  ListItemText, // Import Box for layout
  Typography, // Import Typography for text
} from "@mui/material";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { supabase } from "~/utils/supabase"; // Assuming Supabase client is initialized here
import type { MentionType, PlayPreviewType } from "~/utils/types"; // Assuming these types exist

type PlayPreviewMentionsProps = {
  play: PlayPreviewType;
  activePlay?: PlayPreviewType;
  handleMentionAndTagClick?: (e: React.MouseEvent, topic: string) => void;
  playId?: string;
};

const PlayPreviewMentions = ({
  play,
  handleMentionAndTagClick,
  activePlay,
  playId,
}: PlayPreviewMentionsProps) => {
  const router = useRouter();
  const [mentions, setMentions] = useState<MentionType[] | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false); // State to control the dialog

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const fetchMentions = async () => {
    const { data } = await supabase
      .from("plays_via_user_mention")
      .select("*")
      .eq("play->>id", play.play.id);
    if (data && data.length > 0) {
      const mentions: MentionType[] = data.map((mention) => mention.mention);
      setMentions(mentions);
    } else setMentions(null);
  };

  const handleClick = (
    e: React.MouseEvent,
    name: string,
    id: string,
    closeDialog = true, // Optional parameter to close dialog
  ) => {
    if (handleMentionAndTagClick) {
      handleMentionAndTagClick(e, name);
    } else {
      void router.push(`/profile/${id}`);
    }
    if (closeDialog) {
      handleCloseDialog();
    }
  };

  useEffect(() => {
    // Check if the supabase client is available before subscribing
    if (!supabase) {
      console.warn("Supabase client is not initialized.");
      return;
    }

    const channel = supabase
      .channel(`play_mentions_${play.play.id}_changes`) // Unique channel name for specific play's mentions
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "play_mentions",
          filter: `play_id=eq.${play.play.id}`,
        }, // Filter for relevant plays
        () => {
          void fetchMentions();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [play.play.id, fetchMentions]); // Add play.play.id and fetchMentions to dependencies

  useEffect(() => {
    void fetchMentions();
  }, [activePlay, play, playId]); // Initial fetch and refetch on relevant prop changes

  // Memoize `fetchMentions` to prevent infinite loop if it's a dependency of `useEffect`
  // and `play.play.id` is stable.
  // const fetchMentionsMemoized = useCallback(fetchMentions, [play.play.id]); // Uncomment and use if needed

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
      {mentions && mentions.length > 0 && (
        <Chip
          icon={<PersonIcon sx={{ fontSize: "14px" }} />}
          label={`Mentions (${mentions.length})`}
          onClick={handleOpenDialog}
          variant="outlined"
          sx={{
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "0.75rem", // Smaller font size
            height: "24px", // Smaller height}}
          }}
        />
      )}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ m: 0, p: 1, px: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Player Mentions
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0.5 }}>
          <List dense>
            {mentions?.map((mention) => (
              <ListItem
                key={mention.id}
                onClick={(e) =>
                  handleClick(e, mention.receiver_name, mention.receiver_id)
                }
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                  borderRadius: 2,
                  mb: 0.5, // Slightly reduced margin bottom
                  px: 1.5, // Reduced horizontal padding
                  py: 0.5, // Reduced vertical padding
                }}
              >
                <Avatar sx={{ mr: 1, width: 30, height: 30 }}>
                  {/* You can use mention.profiles?.avatar_url if available, or fall back to first letter */}
                  {mention.receiver_name[0] ? (
                    mention.receiver_name[0].toLocaleUpperCase()
                  ) : (
                    <PersonIcon fontSize="small" />
                  )}
                </Avatar>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {mention.receiver_name}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default PlayPreviewMentions;
