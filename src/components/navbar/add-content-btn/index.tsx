import AddIcon from "@mui/icons-material/Add";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import {
  Box,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { useRef, useState } from "react";
import CreateCollection, {
  type CreateCollectionRef,
} from "~/components/collections/create-collection";
import CreateVideo, {
  type CreateVideoRef,
} from "~/components/videos/create-video";

const AddContentBtn = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isCreateVideoModalOpen, setIsCreateVideoModalOpen] =
    useState<boolean>(false);
  const [isCreateCollectionModalOpen, setIsCreateCollectionModalOpen] =
    useState<boolean>(false);

  const createVideoRef = useRef<CreateVideoRef>(null);
  const createCollectionRef = useRef<CreateCollectionRef>(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleCreateVideoClick = () => {
    // Only open the modal if the user is logged in. Otherwise, navigate to login.
    // This logic should ideally be in CreateVideo itself, but keeping it here for demonstration
    // if a general login check is needed before even attempting to open the modal.
    // However, the CreateVideo component already has user.isLoggedIn check, so this might be redundant here.
    // For now, let's just trigger the modal directly.
    createVideoRef.current?.openModal();
    handleCloseMenu();
  };

  const handleCreateCollectionClick = () => {
    // Similar logic for CreateCollection if needed
    createCollectionRef.current?.openModal();
    handleCloseMenu();
  };

  return (
    <Box>
      <IconButton
        onClick={handleClick}
        sx={{
          fontWeight: "bold",
          padding: 0,
        }}
        size="small"
      >
        <AddIcon color="primary" />
      </IconButton>
      <Menu
        open={open}
        anchorEl={anchorEl}
        onClose={handleCloseMenu}
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
        <MenuItem
          onClick={handleCreateVideoClick}
          sx={{ px: 1, py: 0.5, minHeight: "auto" }}
        >
          <ListItemIcon sx={{ minWidth: "32px" }}>
            <VideoLibraryIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2" fontWeight={"bold"}>
            Add New Video
          </Typography>
        </MenuItem>
        <MenuItem
          onClick={handleCreateCollectionClick}
          sx={{ px: 1, py: 0.5, minHeight: "auto" }}
        >
          <ListItemIcon sx={{ minWidth: "32px" }}>
            <LibraryBooksIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2" fontWeight={"bold"}>
            Create New Collection
          </Typography>
        </MenuItem>
      </Menu>

      {/* Render the modal components. They will only display their content
          when their 'isOpen' prop is true. */}
      <CreateVideo
        ref={createVideoRef}
        isOpen={isCreateVideoModalOpen}
        setIsOpen={setIsCreateVideoModalOpen}
      />
      <CreateCollection
        ref={createCollectionRef}
        isOpen={isCreateCollectionModalOpen}
        setIsOpen={setIsCreateCollectionModalOpen}
      />
    </Box>
  );
};

export default AddContentBtn;
