import CloseIcon from "@mui/icons-material/Close"; // Import CloseIcon for the dialog
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import {
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
import React, { useCallback, useEffect, useState } from "react"; // Add useCallback
import StandardPopover from "~/components/utils/standard-popover";
import { useAuthContext } from "~/contexts/auth"; // Assuming this context exists
import { supabase } from "~/utils/supabase"; // Assuming Supabase client is initialized here
import type { PlayPreviewType, TagType } from "~/utils/types"; // Assuming these types exist

type PlayPreviewTagProps = {
  play: PlayPreviewType;
  activePlay?: PlayPreviewType;
  handleMentionAndTagClick?: (e: React.MouseEvent, topic: string) => void;
  playId?: string;
};

const PlayPreviewTags = ({
  play,
  activePlay,
  playId,
  handleMentionAndTagClick,
}: PlayPreviewTagProps) => {
  const { affIds } = useAuthContext();

  const [tags, setTags] = useState<TagType[] | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null); // For the Chip's popover
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

  // Memoize fetchTags to prevent unnecessary re-creation and infinite loops in useEffect
  const fetchTags = useCallback(async () => {
    const tags = supabase
      .from("plays_via_tag")
      .select("*")
      .eq("play->>id", play.play.id);
    if (affIds && affIds.length > 0) {
      void tags.or(`tag->>private.eq.false, tag->>exclusive_to.in.(${affIds})`);
    } else {
      void tags.eq("tag->>private", false);
    }
    const { data } = await tags;
    if (data) {
      const tags: TagType[] = data.map((tag) => tag.tag);
      setTags(tags);
    } else setTags(null);
  }, [play.play.id, affIds]); // Dependencies for useCallback: play.play.id and affIds

  const handleClick = (
    e: React.MouseEvent,
    tagTitle: string,
    closeDialog = true, // Optional parameter to close dialog
  ) => {
    if (handleMentionAndTagClick) {
      handleMentionAndTagClick(e, tagTitle);
    }
    // No router.push here for tags, as per your initial description (tags don't create a feed)
    if (closeDialog) {
      handleCloseDialog();
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel(`play_tags_${play.play.id}_changes`) // Unique channel name for specific play's tags
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "play_tags",
          filter: `play_id=eq.${play.play.id}`,
        }, // Filter for relevant plays
        () => {
          void fetchTags(); // Use void to explicitly ignore the promise
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [play.play.id, fetchTags]); // Dependencies for the effect: play.play.id and fetchTags

  // Initial fetch and refetch on relevant prop changes (now including fetchTags)
  useEffect(() => {
    void fetchTags(); // Use void to explicitly ignore the promise
  }, [activePlay, play, playId, fetchTags]);

  return (
    <Box className="px-1 py-2">
      {tags && tags.length > 0 && (
        <Chip
          icon={<LocalOfferIcon fontSize="small" />}
          label={`Tags (${tags.length})`}
          onClick={handleOpenDialog}
          onMouseEnter={handlePopoverOpen} // Keep popover for initial quick info
          onMouseLeave={handlePopoverClose}
          variant="outlined"
          sx={{ cursor: "pointer", fontWeight: "bold" }}
        />
      )}
      <StandardPopover
        content="View all play tags"
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
            Play Tags
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
            {tags?.map((tag) => (
              <ListItem
                key={tag.id} // Use tag.id for key, as tag.title might not be unique globally
                onClick={(e) => handleClick(e, tag.title)}
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "action.hover", // Material UI hover state
                  },
                  borderRadius: 2, // Rounded corners for list items
                  mb: 1, // Margin bottom for spacing between items
                }}
              >
                <LocalOfferIcon sx={{ mr: 2 }} /> {/* Icon for tags */}
                <ListItemText
                  primary={
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                      {tag.title.toLocaleUpperCase()}
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

export default PlayPreviewTags;
