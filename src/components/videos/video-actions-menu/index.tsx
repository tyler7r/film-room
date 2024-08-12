import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import type { VideoType } from "~/utils/types";
import DeleteMenu from "../../utils/delete-menu";
import EditVideo from "../video-edit";

type VideoActionsMenuProps = {
  video: VideoType;
  setReload?: (reload: boolean) => void;
};

const VideoActionsMenu = ({ video, setReload }: VideoActionsMenuProps) => {
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
    setAnchorEl(null);
    void router.push(`/film-room/${video.id}`);
  };

  const handleDelete = async () => {
    const { data } = await supabase
      .from("videos")
      .delete()
      .eq("id", video.id)
      .select();
    if (data && setReload) {
      setReload(true);
    }
    handleClose();
  };

  return (
    <div>
      <IconButton size="small" onClick={handleClick} sx={{ display: "flex" }}>
        <MoreHorizIcon color="primary" />
      </IconButton>
      {open && (
        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          <MenuItem onClick={handleGoToVideo}>
            <div className="text-sm font-bold tracking-tight">GO TO VIDEO</div>
          </MenuItem>
          {video.author_id === user.userId && (
            <MenuItem>
              <EditVideo video={video} />
            </MenuItem>
          )}
          {video.author_id === user.userId && (
            <MenuItem>
              <DeleteMenu
                isOpen={isDeleteOpen}
                setIsOpen={setIsDeleteOpen}
                handleDelete={handleDelete}
                actionMenu={true}
                deleteType="video"
              />
            </MenuItem>
          )}
        </Menu>
      )}
    </div>
  );
};

export default VideoActionsMenu;
