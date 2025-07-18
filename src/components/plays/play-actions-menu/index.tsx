// components/plays/play-actions-menu/index.tsx (NO CHANGES NEEDED)

import ClearIcon from "@mui/icons-material/Clear";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CreateIcon from "@mui/icons-material/Create";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ShortcutIcon from "@mui/icons-material/Shortcut";
import VideocamIcon from "@mui/icons-material/Videocam";
import {
  Box,
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
import EditPlay from "../edit-play";

type PlayActionsMenuProps = {
  preview: PlayPreviewType;
  collectionId?: string;
  setReload?: (reload: boolean) => void;
  collectionAuthor?: string;
  onCopyLink: () => void;
  onGoToFilmRoom?: () => void;
  onPlayClick?: () => void;
  handlePlayDeleted?: () => void;
};

const PlayActionsMenu = ({
  preview,
  collectionId,
  setReload,
  collectionAuthor,
  onCopyLink,
  onGoToFilmRoom,
  onPlayClick,
  handlePlayDeleted,
}: PlayActionsMenuProps) => {
  const { user } = useAuthContext();

  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState<boolean>(false);
  const [isEditPlayModalOpen, setIsEditPlayModalOpen] =
    useState<boolean>(false);

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
    if (handlePlayDeleted) {
      handlePlayDeleted();
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

  const handleEditPlayClick = () => {
    setIsEditPlayModalOpen(true);
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
          slotProps={{
            paper: {
              sx: {
                borderRadius: "8px",
                boxShadow: 3,
                py: 0,
              },
            },
          }}
        >
          {/* Option: Add Play to Collections */}
          <MenuItem sx={{ px: 1, py: 0.5, minHeight: "auto" }}>
            <AddPlayToCollection
              playId={preview.play.id}
              // handleMenuClose={handleClose}
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
          {onPlayClick && (
            <MenuItem
              onClick={() => {
                onPlayClick();
                handleClose();
              }}
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
          )}
          {/* Option: Remove from Collection (if in a collection and user is author) */}
          {collectionId && collectionAuthor === user.userId && (
            <MenuItem sx={{ px: 1, py: 0.5, minHeight: "auto" }}>
              {isRemoveOpen ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Button
                    color="primary"
                    onClick={handleRemoveCollection}
                    endIcon={<DeleteIcon fontSize="small" />}
                    variant="contained"
                    size="small"
                    sx={{ textTransform: "none" }}
                  >
                    Remove
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => setIsRemoveOpen(false)}
                  >
                    <ClearIcon fontSize="small" color="action" />
                  </IconButton>
                </Box>
              ) : (
                <Box
                  sx={{ display: "flex", width: "100%", alignItems: "center" }}
                  onClick={() => setIsRemoveOpen(true)}
                >
                  <ListItemIcon sx={{ minWidth: "12px" }}>
                    <DeleteIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={"bold"}>
                        Remove from Collection
                      </Typography>
                    }
                  />
                </Box>
              )}
            </MenuItem>
          )}

          {/* Option: Edit Play (if user is author) */}
          {preview.play.author_id === user.userId && (
            <MenuItem
              onClick={handleEditPlayClick}
              sx={{ px: 1, py: 0.5, minHeight: "auto" }}
            >
              <ListItemIcon sx={{ minWidth: "12px" }}>
                <CreateIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight={"bold"}>
                    Edit Play
                  </Typography>
                }
              />
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

      {/* Render the EditPlay modal component here, outside the Menu */}
      {preview.play.author_id === user.userId && (
        <EditPlay
          play={preview.play}
          video={preview.video}
          isOpen={isEditPlayModalOpen}
          setIsOpen={setIsEditPlayModalOpen}
        />
      )}
    </>
  );
};

export default PlayActionsMenu;
