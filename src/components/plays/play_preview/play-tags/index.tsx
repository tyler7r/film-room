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
  const [openDialog, setOpenDialog] = useState<boolean>(false); // State to control the dialog

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

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
    tags &&
    tags.length > 0 && (
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 0.5,
          py: 0.5,
        }}
      >
        <Chip
          icon={<LocalOfferIcon sx={{ fontSize: "14px" }} />}
          label={`Tags (${tags.length})`}
          onClick={handleOpenDialog}
          variant="outlined"
          sx={{
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "0.75rem", // Smaller font size
            height: "24px", // Smaller height}}
          }}
        />
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle sx={{ m: 0, p: 1, px: 2 }}>
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
          <DialogContent dividers sx={{ padding: 0.5 }}>
            <List dense>
              {tags?.map((tag) => (
                <ListItem
                  key={tag.id} // Use tag.id for key, as tag.title might not be unique globally
                  onClick={(e) => handleClick(e, tag.title)}
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
                  <LocalOfferIcon sx={{ mr: 1 }} /> {/* Icon for tags */}
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        {tag.title}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </DialogContent>
        </Dialog>
      </Box>
    )
  );
};

export default PlayPreviewTags;
