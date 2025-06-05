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
import StandardPopover from "~/components/utils/standard-popover"; // Assuming this component exists
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
  //   const { hoverText } = useIsDarkContext();
  const router = useRouter();
  const [mentions, setMentions] = useState<MentionType[] | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null); // For the Chip's popover (if any)
  const [openDialog, setOpenDialog] = useState<boolean>(false); // State to control the dialog

  const handlePopoverOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const open = Boolean(anchorEl);

  const fetchMentions = async () => {
    // Ensure you're fetching the correct data for mentions here.
    // The previous schema suggestion included `receiver_name` and `receiver_id` directly in the `mentions` table,
    // which simplifies this. If `plays_via_user_mention` is a view, ensure it correctly joins
    // to get the `receiver_name` and `receiver_id` for each mention.
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
    <Box className="px-1 py-2">
      {mentions && mentions.length > 0 && (
        <Chip
          icon={<PersonIcon fontSize="small" />}
          label={`Mentions (${mentions.length})`}
          onClick={handleOpenDialog}
          onMouseEnter={handlePopoverOpen} // Keep popover for initial quick info
          onMouseLeave={handlePopoverClose}
          variant="outlined"
          sx={{ cursor: "pointer", fontWeight: "bold" }}
        />
      )}
      <StandardPopover
        content="View all player mentions"
        open={open}
        handlePopoverClose={handlePopoverClose}
        anchorEl={anchorEl}
      />
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
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
        <DialogContent dividers>
          <List>
            {mentions?.map((mention) => (
              <ListItem
                key={mention.id}
                onClick={(e) =>
                  handleClick(e, mention.receiver_name, mention.receiver_id)
                }
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "action.hover", // Material UI hover state
                  },
                  borderRadius: 2, // Rounded corners for list items
                  mb: 1, // Margin bottom for spacing between items
                }}
              >
                <Avatar sx={{ mr: 2 }}>
                  {/* You can use mention.profiles?.avatar_url if available, or fall back to first letter */}
                  {mention.receiver_name[0] ? (
                    mention.receiver_name[0].toLocaleUpperCase()
                  ) : (
                    <PersonIcon fontSize="small" />
                  )}
                </Avatar>
                <ListItemText
                  primary={
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
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
