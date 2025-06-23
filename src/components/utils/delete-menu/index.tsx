import DeleteIcon from "@mui/icons-material/Delete";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  Box,
  Button,
  IconButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

type DeleteMenuProps = {
  handleDelete: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  actionMenu?: boolean;
  deleteType: string;
  small?: boolean;
};

const DeleteMenu = ({
  handleDelete,
  isOpen,
  setIsOpen,
  actionMenu,
  deleteType,
  small,
}: DeleteMenuProps) => {
  return isOpen ? (
    <Box className="flex w-full items-center justify-around gap-1">
      {actionMenu ? (
        <Button
          endIcon={<DeleteIcon />}
          variant="contained"
          size="small"
          color="error"
          onClick={() => void handleDelete()}
        >
          Delete
        </Button>
      ) : (
        <IconButton size="small" onClick={() => void handleDelete()}>
          <DeleteIcon color="primary" fontSize={small ? "small" : "medium"} />
        </IconButton>
      )}
      <Button
        size="small"
        variant="outlined"
        color="info"
        onClick={() => setIsOpen(false)}
      >
        Cancel
      </Button>
    </Box>
  ) : !actionMenu ? (
    <IconButton size="small" onClick={() => setIsOpen(true)}>
      <DeleteOutlineIcon color="action" fontSize={small ? "small" : "medium"} />
    </IconButton>
  ) : (
    <Box
      sx={{ display: "flex", alignItems: "center" }}
      onClick={() => setIsOpen(true)}
    >
      <ListItemIcon sx={{ minWidth: "12px" }}>
        <DeleteIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography variant="body2" fontWeight={"bold"}>
            Delete {deleteType}
          </Typography>
        }
      />
    </Box>
  );
};

export default DeleteMenu;
