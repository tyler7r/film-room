import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import { supabase } from "~/utils/supabase";
import type { CollectionType } from "~/utils/types";
import DeleteMenu from "../../utils/delete-menu";
import EditCollection from "../edit-collection";

type CollectionActionsMenuProps = {
  collection: CollectionType;
  setReload?: (reload: boolean) => void;
};

const CollectionActionsMenu = ({
  collection,
  setReload,
}: CollectionActionsMenuProps) => {
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setIsDeleteOpen(false);
    setIsEditOpen(false);
    setAnchorEl(null);
  };

  const handleDelete = async () => {
    const { data } = await supabase
      .from("collections")
      .delete()
      .eq("id", collection.id)
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
          <MenuItem>
            <EditCollection
              collection={collection}
              isEditOpen={isEditOpen}
              setIsEditOpen={setIsEditOpen}
            />
          </MenuItem>
          <MenuItem>
            <DeleteMenu
              isOpen={isDeleteOpen}
              setIsOpen={setIsDeleteOpen}
              handleDelete={handleDelete}
              actionMenu={true}
              deleteType="collection"
            />
          </MenuItem>
        </Menu>
      )}
    </div>
  );
};

export default CollectionActionsMenu;
