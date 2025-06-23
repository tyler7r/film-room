import ContentCopyIcon from "@mui/icons-material/ContentCopy"; // New icon for 'Copy Link'
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import VideocamIcon from "@mui/icons-material/Videocam"; // Icon for 'Go to Film Room'
import {
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography, // Import Typography
} from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import type { VideoType } from "~/utils/types";
import DeleteMenu from "../../utils/delete-menu";
import EditVideo from "../video-edit"; // Assuming EditVideo is still relevant for the author

type VideoActionsMenuProps = {
  video: VideoType;
  setReload?: (reload: boolean) => void;
  onCopyLink: () => void; // New prop: Callback for copy link
};

const VideoActionsMenu = ({
  video,
  setReload,
  onCopyLink,
}: VideoActionsMenuProps) => {
  const { user } = useAuthContext();
  const router = useRouter();

  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setIsDeleteOpen(false);
    setAnchorEl(null);
  };

  const handleGoToVideo = () => {
    handleClose(); // Close menu after selection
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
      // Optionally show an error message
    }
    if (data && setReload) {
      setReload(true);
    }
    handleClose();
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
      {open && (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
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
          {/* Option: Go to Film Room */}
          <MenuItem
            onClick={handleGoToVideo}
            sx={{ px: 1, py: 0.5, minHeight: "auto" }} // Compact padding for MenuItem
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
              handleClose();
            }} // Call onCopyLink prop and close menu
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
              onClick={handleClose}
              sx={{ px: 1, py: 0.5, minHeight: "auto" }}
            >
              <EditVideo video={video} />
            </MenuItem>
          )}

          {/* Option: Delete Video (if user is author) */}
          {video.author_id === user.userId && (
            <MenuItem sx={{ px: 1, py: 0.5, minHeight: "auto" }}>
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
      )}
    </Box>
  );
};

export default VideoActionsMenu;
