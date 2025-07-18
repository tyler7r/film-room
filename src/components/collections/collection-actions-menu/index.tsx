import AddIcon from "@mui/icons-material/Add"; // For 'Add Plays'
import ContentCopyIcon from "@mui/icons-material/ContentCopy"; // For 'Copy Link'
import EditIcon from "@mui/icons-material/Create"; // Using CreateIcon as EditIcon from PlayActionsMenu
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "~/utils/supabase";
import type { CollectionType } from "~/utils/types";
import DeleteMenu from "../../utils/delete-menu";
import PlaysToCollectionModal from "../add-plays-to-collection";
import EditCollection from "../edit-collection"; // Import the updated EditCollection

type CollectionActionsMenuProps = {
  collection: CollectionType;
  userIsAuthor: boolean;
  userCanEdit: boolean;
  accessDenied: boolean; // Used for Add Plays button visibility
  setReload: (reload: boolean) => void; // To trigger reload in parent after modal actions
  playIds: string[]; // Passed to PlaysToCollectionModal
  copyToClipboard: () => void; // Function to copy link
  isCopied: boolean; // State for copy feedback (used in parent to display popover)
};

const CollectionActionsMenu = ({
  collection,
  userIsAuthor,
  userCanEdit,
  accessDenied,
  setReload,
  playIds, // Although passed, this component doesn't directly use playIds, the modal does.
  copyToClipboard, // Although passed, this component doesn't directly display the popover.
}: CollectionActionsMenuProps) => {
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [isAddPlaysOpen, setIsAddPlaysOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false); // State to control EditCollection modal
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    // Only close the menu. Modals (delete/edit) manage their own open/close state.
    setAnchorEl(null);
  };

  const handleDelete = async () => {
    const { data } = await supabase
      .from("collections")
      .delete()
      .eq("id", collection.id)
      .select();
    if (data) {
      void router.push("/"); // Redirect after successful deletion
    }
    setIsDeleteOpen(false); // Close delete confirmation
    handleClose(); // Close the main menu
  };

  const handleAddPlaysClick = () => {
    setIsAddPlaysOpen(true); // Open the PlaysToCollectionModal in the parent (Collection.tsx)
    handleClose(); // Close the CollectionActionsMenu
  };

  const handleCopyLinkClick = () => {
    copyToClipboard(); // Call the passed function to copy the link
    handleClose(); // Close the CollectionActionsMenu
  };

  const handleEditCollectionClick = () => {
    setIsEditOpen(true); // Set state to open the EditCollection modal
    handleClose(); // Close the CollectionActionsMenu
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={handleClick}
        sx={{ display: "flex", padding: 0 }}
      >
        <MoreHorizIcon color="primary" />
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
          {/* Option: Add Plays to Collection */}
          {userCanEdit && !accessDenied && (
            <MenuItem
              onClick={handleAddPlaysClick}
              sx={{ px: 1, py: 0.5, minHeight: "auto" }}
            >
              <ListItemIcon sx={{ minWidth: "12px" }}>
                <AddIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight={"bold"}>
                    Add Plays
                  </Typography>
                }
              />
            </MenuItem>
          )}

          {/* Option: Copy Collection Link */}
          <MenuItem
            onClick={handleCopyLinkClick}
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

          {/* Option: Edit Collection (if user is author) */}
          {userIsAuthor && (
            <MenuItem
              onClick={handleEditCollectionClick} // This triggers the modal
              sx={{ px: 1, py: 0.5, minHeight: "auto" }}
            >
              <ListItemIcon sx={{ minWidth: "12px" }}>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight={"bold"}>
                    Edit Collection
                  </Typography>
                }
              />
            </MenuItem>
          )}

          {/* Option: Delete Collection (if user is author) */}
          {userIsAuthor && (
            <MenuItem
              onClick={() => {
                setIsDeleteOpen(true); // This triggers the DeleteMenu confirmation
                // handleClose() is not called here, DeleteMenu itself typically handles closure
                // or the menu re-renders and closes if isDeleteOpen changes state
              }}
              sx={{ px: 1, py: 0.5, minHeight: "auto" }}
            >
              <DeleteMenu
                isOpen={isDeleteOpen}
                setIsOpen={setIsDeleteOpen}
                handleDelete={handleDelete}
                actionMenu={true}
                deleteType="Collection"
              />
            </MenuItem>
          )}
        </Menu>
      )}

      {/* Render the EditCollection modal component here, OUTSIDE the Menu,
          but within the same parent component that renders CollectionActionsMenu.
          Its visibility is controlled by the isEditOpen state. */}
      {userIsAuthor && ( // Only render if the user is the author
        <EditCollection
          collection={collection}
          isEditOpen={isEditOpen}
          setIsEditOpen={setIsEditOpen}
          // setReload={setReload} // Pass setReload if EditCollection needs to trigger a parent reload
        />
      )}
      {userCanEdit &&
        !accessDenied && ( // Only render if the user is the author
          <PlaysToCollectionModal
            collectionId={collection.id}
            isOpen={isAddPlaysOpen}
            setIsOpen={setIsAddPlaysOpen}
            playIds={playIds}
            setReload={setReload}
          />
        )}
    </>
  );
};

export default CollectionActionsMenu;
