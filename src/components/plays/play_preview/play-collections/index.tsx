import CloseIcon from "@mui/icons-material/Close"; // Needed for Dialog close button
import CollectionsBookmarkIcon from "@mui/icons-material/CollectionsBookmark";
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography, // Import Typography for text styling
} from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react"; // Added useCallback
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import type { CollectionType, PlayPreviewType } from "~/utils/types";

type PlayCollectionsProps = {
  play: PlayPreviewType; // Only need playId to fetch collections
};

const PlayPreviewCollections = ({ play }: PlayCollectionsProps) => {
  const router = useRouter();
  const { affIds } = useAuthContext();
  const [collections, setCollections] = useState<CollectionType[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false); // State to control the dialog

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  useEffect(() => {
    const fetchCollections = async () => {
      const colls = supabase
        .from("collection_plays_view")
        .select()
        .eq("play->>id", play.play.id);
      if (affIds && affIds.length > 0) {
        void colls.or(
          `collection->>private.eq.false, collection->>exclusive_to.in.(${affIds})`,
        );
      } else {
        void colls.eq("collection->>private", false);
      }
      const { data } = await colls;
      if (data && data.length > 0) {
        const cols: CollectionType[] = data.map(
          (collection) => collection.collection,
        );
        setCollections(cols);
      } else setCollections([]);
    };

    void fetchCollections();
  }, [play.play.id]);

  const handleCollectionClick = (collectionId: string) => {
    void router.push(`/collection/${collectionId}`);
  };

  if (collections.length === 0) {
    return null; // Don't render if no collections
  }

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
      {collections.length > 0 && ( // Only render chip if there are collections
        <Chip
          icon={<CollectionsBookmarkIcon sx={{ fontSize: "12px" }} />}
          label={`Collections (${collections.length})`}
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
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 1, px: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Play Collections
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
        {/* Adjusted padding on DialogContent */}
        <DialogContent dividers sx={{ p: 0.5 }}>
          <List dense>
            {collections.map((collection) => (
              <ListItem
                key={collection.id}
                onClick={() => handleCollectionClick(collection.id)}
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
                <CollectionsBookmarkIcon sx={{ mr: 1 }} fontSize="small" />{" "}
                {/* Reduced right margin */}
                <ListItemText
                  primary={
                    // Using variant="body2" for smaller text, and bold
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {collection.title}
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

export default PlayPreviewCollections;
