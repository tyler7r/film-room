import ClearIcon from "@mui/icons-material/Clear";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Button, IconButton } from "@mui/material";

type DeleteMenuProps = {
  handleDelete: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  actionMenu?: boolean;
  deleteType: string;
};

const DeleteMenu = ({
  handleDelete,
  isOpen,
  setIsOpen,
  actionMenu,
  deleteType,
}: DeleteMenuProps) => {
  return isOpen ? (
    <div className="flex w-full justify-around">
      {actionMenu ? (
        <Button
          endIcon={<DeleteIcon />}
          variant="contained"
          size="small"
          color="primary"
          onClick={() => void handleDelete()}
        >
          Delete
        </Button>
      ) : (
        <IconButton size="small" onClick={() => void handleDelete()}>
          <DeleteIcon color="primary" />
        </IconButton>
      )}
      <IconButton size="small" onClick={() => setIsOpen(false)}>
        <ClearIcon fontSize="small" color="action" />
      </IconButton>
    </div>
  ) : !actionMenu ? (
    <IconButton size="small" onClick={() => setIsOpen(true)}>
      <DeleteOutlineIcon color="action" />
    </IconButton>
  ) : (
    <div
      className="text-sm font-bold tracking-tight"
      onClick={() => setIsOpen(true)}
    >
      DELETE {deleteType.toLocaleUpperCase()}
    </div>
  );
};

export default DeleteMenu;
