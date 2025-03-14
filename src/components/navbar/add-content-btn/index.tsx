import AddIcon from "@mui/icons-material/Add";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import { IconButton, ListItemIcon, Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import CreateCollection from "~/components/collections/create-collection";
import CreateVideo from "~/components/videos/create-video";

const AddContentBtn = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton
        onClick={handleClick}
        sx={{
          fontWeight: "bold",
        }}
        size="small"
      >
        <AddIcon color="primary" />
      </IconButton>
      <Menu open={open} anchorEl={anchorEl} onClose={handleClose}>
        <MenuItem>
          <ListItemIcon>
            <VideoLibraryIcon fontSize="small" />
          </ListItemIcon>
          <CreateVideo listItem={true} />
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <LibraryBooksIcon fontSize="small" />
          </ListItemIcon>
          <CreateCollection listItem={true} />
        </MenuItem>
      </Menu>
    </div>
  );
};

export default AddContentBtn;
