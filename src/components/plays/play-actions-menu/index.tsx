import ClearIcon from "@mui/icons-material/Clear";
import ContentCopyIcon from "@mui/icons-material/ContentCopy"; // New icon for 'Copy Link'
import DeleteIcon from "@mui/icons-material/Delete";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ShortcutIcon from "@mui/icons-material/Shortcut"; // Icon for 'Go to Play' / 'Theatre Mode'
import VideocamIcon from "@mui/icons-material/Videocam"; // New icon for 'Go to Film Room'
import {
  Button,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import type { PlayPreviewType } from "~/utils/types";
import AddPlayToCollection from "../../collections/add-play-to-collection";
import DeleteMenu from "../../utils/delete-menu";
import EditPlay from "../edit-play"; // Assuming EditPlay is still relevant for the author

// Add new props for actions that were previously in PlayPreview
type PlayActionsMenuProps = {
  preview: PlayPreviewType;
  collectionId?: string;
  setReload?: (reload: boolean) => void;
  collectionAuthor?: string;
  onCopyLink: () => void; // Callback for copy link
  onGoToFilmRoom?: () => void; // Callback for go to film room
  onPlayClick: () => void; // Callback for go to play's theatre mode
};

const PlayActionsMenu = ({
  preview,
  collectionId,
  setReload,
  collectionAuthor,
  onCopyLink,
  onGoToFilmRoom,
  onPlayClick,
}: PlayActionsMenuProps) => {
  const { user } = useAuthContext();

  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setIsDeleteOpen(false);
    setIsRemoveOpen(false);
    setAnchorEl(null);
  };

  const handleDelete = async () => {
    const { data } = await supabase
      .from("plays")
      .delete()
      .eq("id", preview.play.id)
      .select();
    if (data && setReload) {
      setReload(true);
    }
    handleClose();
  };

  const handleRemoveCollection = async () => {
    if (collectionId) {
      const { data } = await supabase
        .from("collection_plays")
        .delete()
        .match({ collection_id: collectionId, play_id: preview.play.id })
        .select();
      if (data && setReload) setReload(true);
    }
    handleClose();
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={handleClick}
        sx={{ display: "flex", padding: 0 }}
      >
        <MoreHorizIcon />
      </IconButton>
      {open && (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          // Added PaperProps for compact styling of the Menu itself
          slotProps={{
            paper: {
              sx: {
                borderRadius: "8px", // Slightly rounded corners for the menu
                boxShadow: 3, // Add some shadow
                py: 0, // Reduce vertical padding inside the menu
              },
            },
          }}
        >
          {/* Option: Add Play to Collections */}
          <MenuItem
            sx={{ px: 1, py: 0.5, minHeight: "auto" }} // Compact padding for MenuItem
          >
            <AddPlayToCollection
              playId={preview.play.id}
              // handleMenuClose={handleClose} // Pass handleClose to close menu and modal
            />
          </MenuItem>

          {/* Option: Copy Link */}
          <MenuItem
            onClick={() => {
              onCopyLink();
              handleClose();
            }}
            sx={{ px: 1, py: 0.5, minHeight: "auto" }}
          >
            <ListItemIcon sx={{ minWidth: "12px" }}>
              <ContentCopyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2" fontWeight={"bold"}>
                  Copy Link
                </Typography>
              }
            />
          </MenuItem>

          {/* Option: Go to Associated Video's Film Room */}
          {onGoToFilmRoom && (
            <MenuItem
              onClick={() => {
                onGoToFilmRoom();
                handleClose();
              }}
              sx={{ px: 1, py: 0.5, minHeight: "auto" }}
            >
              <ListItemIcon sx={{ minWidth: "12px" }}>
                <VideocamIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight={"bold"}>
                    View in Film Room
                  </Typography>
                }
              />
            </MenuItem>
          )}
          {/* Option: Go to Play's Theatre Mode */}
          <MenuItem
            onClick={() => {
              onPlayClick();
              handleClose();
            }} // Corrected onClick
            sx={{ px: 1, py: 0.5, minHeight: "auto" }}
          >
            <ListItemIcon sx={{ minWidth: "12px" }}>
              <ShortcutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2" fontWeight={"bold"}>
                  View in Theatre Mode
                </Typography>
              }
            />
          </MenuItem>

          {/* Option: Remove from Collection (if in a collection and user is author) */}
          {collectionId && collectionAuthor === user.userId && (
            <MenuItem sx={{ px: 1, py: 0.5, minHeight: "auto" }}>
              {isRemoveOpen ? (
                <div className="flex items-center gap-1">
                  <Button
                    color="primary"
                    onClick={handleRemoveCollection}
                    endIcon={<DeleteIcon fontSize="small" />}
                    variant="contained"
                    size="small"
                    sx={{ textTransform: "none" }} // Keep button text case as defined
                  >
                    Remove
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => setIsRemoveOpen(false)}
                  >
                    <ClearIcon fontSize="small" color="action" />
                  </IconButton>
                </div>
              ) : (
                <div
                  className="flex w-full items-center"
                  onClick={() => setIsRemoveOpen(true)}
                >
                  <ListItemIcon sx={{ minWidth: "12px" }}>
                    <DeleteIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Remove from Collection</ListItemText>
                </div>
              )}
            </MenuItem>
          )}

          {/* Option: Edit Play (if user is author) */}
          {preview.play.author_id === user.userId && (
            <MenuItem sx={{ px: 1, py: 0.5, minHeight: "auto" }}>
              <EditPlay play={preview.play} video={preview.video} />
            </MenuItem>
          )}

          {/* Option: Delete Play (if user is author) */}
          {preview.play.author_id === user.userId && (
            <MenuItem sx={{ px: 1, py: 0.5, minHeight: "auto" }}>
              <DeleteMenu
                isOpen={isDeleteOpen}
                setIsOpen={setIsDeleteOpen}
                handleDelete={handleDelete}
                actionMenu={true}
                deleteType="play"
              />
            </MenuItem>
          )}
        </Menu>
      )}
    </>
  );
};

export default PlayActionsMenu;
