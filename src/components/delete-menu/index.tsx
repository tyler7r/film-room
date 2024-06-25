import ClearIcon from "@mui/icons-material/Clear";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { IconButton } from "@mui/material";

type DeleteMenuProps = {
  handleDelete: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const DeleteMenu = ({ handleDelete, isOpen, setIsOpen }: DeleteMenuProps) => {
  return isOpen ? (
    <div className="ml-4 flex gap-1">
      <IconButton size="small" onClick={() => void handleDelete()}>
        <DeleteIcon color="primary" />
      </IconButton>
      <IconButton size="small" onClick={() => setIsOpen(false)}>
        <ClearIcon fontSize="small" color="action" />
      </IconButton>
    </div>
  ) : (
    <IconButton size="small" onClick={() => setIsOpen(true)}>
      <DeleteOutlineIcon color="action" />
    </IconButton>
  );
};

export default DeleteMenu;
