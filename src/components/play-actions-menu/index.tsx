import ClearIcon from "@mui/icons-material/Clear";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Button, IconButton, Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import type { PlayPreviewType } from "~/utils/types";
import CollectionModal from "../collection-modal";
import DeleteMenu from "../delete-menu";

type PlayActionsMenuProps = {
  preview: PlayPreviewType;
  collectionId?: string;
  setReload?: (reload: boolean) => void;
  collectionAuthor?: string;
};

const PlayActionsMenu = ({
  preview,
  collectionId,
  setReload,
  collectionAuthor,
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
    <div>
      <IconButton size="small" onClick={handleClick} sx={{ display: "flex" }}>
        <MoreVertIcon fontSize="large" color="primary" />
      </IconButton>
      {open && (
        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          <MenuItem>
            <CollectionModal
              playId={preview.play.id}
              handleMenuClose={handleClose}
            />
          </MenuItem>
          {collectionAuthor === user.userId && (
            <MenuItem>
              {isRemoveOpen ? (
                <div className="flex gap-1">
                  <Button
                    color="primary"
                    onClick={handleRemoveCollection}
                    endIcon={<DeleteIcon fontSize="small" />}
                    variant="contained"
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
                  className="text-sm font-bold"
                  onClick={() => setIsRemoveOpen(true)}
                >
                  REMOVE FROM COLLECTION
                </div>
              )}
            </MenuItem>
          )}
          {preview.play.author_id === user.userId && (
            <MenuItem>
              <DeleteMenu
                isOpen={isDeleteOpen}
                setIsOpen={setIsDeleteOpen}
                handleDelete={handleDelete}
                actionMenu={true}
              />
            </MenuItem>
          )}
        </Menu>
      )}
    </div>
  );
};

export default PlayActionsMenu;
