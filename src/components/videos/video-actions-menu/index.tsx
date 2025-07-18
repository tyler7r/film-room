import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CreateIcon from "@mui/icons-material/Create";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import VideocamIcon from "@mui/icons-material/Videocam";
import {
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { useRef, useState } from "react"; // Import useRef
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import type { VideoType } from "~/utils/types";
import DeleteMenu from "../../utils/delete-menu";
import EditVideo, { type EditVideoRef } from "../video-edit"; // Import EditVideoRef

type VideoActionsMenuProps = {
  video: VideoType;
  setReload?: (reload: boolean) => void;
  onCopyLink: () => void;
};

const VideoActionsMenu = ({
  video,
  setReload,
  onCopyLink,
}: VideoActionsMenuProps) => {
  const { user } = useAuthContext();
  const router = useRouter();

  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false); // State for EditVideo modal
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const editVideoRef = useRef<EditVideoRef>(null); // Create a ref for EditVideo

  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    // Renamed from handleClose to avoid conflict
    setIsDeleteOpen(false); // Ensure delete menu is closed
    setAnchorEl(null);
  };

  const handleGoToVideo = () => {
    handleCloseMenu();
    void router.push(`/film-room/${video.id}`);
  };

  const handleDelete = async () => {
    const { data, error } = await supabase
      .from("videos")
      .delete()
      .eq("id", video.id)
      .select();
    if (error) {
      console.error("Error deleting video:", error);
    }
    if (data && setReload) {
      setReload(true);
    }
    handleCloseMenu();
  };

  return (
    <Box>
      <IconButton
        size="small"
        onClick={handleClick}
        sx={{ display: "flex", padding: 0 }}
      >
        <MoreHorizIcon color="primary" />
      </IconButton>
      {/* Menu is always rendered when anchorEl is set */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu} // Use the renamed handleCloseMenu
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
        {/* Option: Go to Film Room */}
        <MenuItem
          onClick={handleGoToVideo}
          sx={{ px: 1, py: 0.5, minHeight: "auto" }}
        >
          <ListItemIcon sx={{ minWidth: "32px" }}>
            <VideocamIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                View in Film Room
              </Typography>
            }
          />
        </MenuItem>

        {/* New Option: Copy Video Link */}
        <MenuItem
          onClick={() => {
            onCopyLink();
            handleCloseMenu(); // Close menu after copy
          }}
          sx={{ px: 1, py: 0.5, minHeight: "auto" }}
        >
          <ListItemIcon sx={{ minWidth: "32px" }}>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                Copy Link
              </Typography>
            }
          />
        </MenuItem>

        {/* Option: Edit Video (if user is author) */}
        {video.author_id === user.userId && (
          <MenuItem
            onClick={() => {
              editVideoRef.current?.openModal(); // Call openModal via ref
              handleCloseMenu(); // Close the VideoActionsMenu
            }}
            sx={{ px: 1, py: 0.5, minHeight: "auto" }}
          >
            {/* The EditVideo component itself is now just the ListItemText/Icon */}
            {/* The actual modal is controlled by its own state */}
            <ListItemIcon sx={{ minWidth: "32px" }}>
              <CreateIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2" fontWeight={"bold"}>
                  Edit Video
                </Typography>
              }
            />
          </MenuItem>
        )}

        {/* Option: Delete Video (if user is author) */}
        {video.author_id === user.userId && (
          <MenuItem sx={{ px: 1, py: 0.5, minHeight: "auto" }}>
            {/* DeleteMenu should also probably live outside the MenuItem,
                or be controlled in a similar pattern if it's a modal.
                For now, keeping it here assuming it triggers its own modal. */}
            <DeleteMenu
              isOpen={isDeleteOpen}
              setIsOpen={setIsDeleteOpen}
              handleDelete={handleDelete}
              actionMenu={true}
              deleteType="Video"
            />
          </MenuItem>
        )}
      </Menu>

      {/* Render EditVideo modal component outside the Menu */}
      {/* It should always be mounted but its modal visibility controlled by isEditModalOpen */}
      {video.author_id === user.userId && ( // Only render if user is author
        <EditVideo
          ref={editVideoRef} // Pass the ref
          video={video}
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
        />
      )}
    </Box>
  );
};

export default VideoActionsMenu;
