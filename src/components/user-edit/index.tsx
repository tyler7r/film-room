import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Box,
  IconButton, // Import MenuItem
  ListItemIcon, // Import ListItemIcon
  ListItemText,
  Menu, // Import Menu
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { AffiliationType, UserType } from "~/utils/types";
import User from "../user";
import DeleteMenu from "../utils/delete-menu";

type UserEditProps = {
  user: UserType;
  goToProfile: boolean;
  affiliation: AffiliationType;
  small?: boolean;
};

const UserEdit = ({ user, goToProfile, small, affiliation }: UserEditProps) => {
  const { backgroundStyle } = useIsDarkContext();
  const { setAffReload } = useAuthContext();

  const [isEditingNumber, setIsEditingNumber] = useState<boolean>(false); // Renamed from isOpen for clarity
  const [editNumber, setEditNumber] = useState<number | null | undefined>(
    affiliation.number,
  );
  const [isValidNumber, setIsValidNumber] = useState<boolean>(false);
  const [isDeleteMenuOpen, setIsDeleteMenuOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null); // For the MoreHorizIcon menu

  const isMenuOpen = Boolean(anchorEl); // Check if menu is open

  const handleMenuClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    },
    [],
  );

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleEditNumberClick = useCallback(() => {
    setIsEditingNumber(true); // Open the number editing form
    handleMenuClose(); // Close the MoreHorizIcon menu
  }, [handleMenuClose]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const num = Number(value);
    setEditNumber(num);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const { data, error } = await supabase
        .from("affiliations")
        .update({
          number: editNumber,
        })
        .eq("id", affiliation?.id)
        .select();
      if (error) {
        console.error("Error updating affiliation number:", error);
        // TODO: Implement user-facing error feedback (e.g., Snackbar)
        return;
      }
      if (data) {
        setTimeout(() => {
          setIsEditingNumber(false);
        }, 300);
        setAffReload(true);
      }
    },
    [editNumber, affiliation?.id, setAffReload],
  );

  const closeEdit = useCallback(() => {
    setEditNumber(affiliation.number);
    setIsEditingNumber(false);
  }, [affiliation.number]);

  const handleDelete = useCallback(async () => {
    setIsEditingNumber(false); // Close edit mode if open
    setIsDeleteMenuOpen(false); // Close delete confirmation
    const { error } = await supabase
      .from("affiliations")
      .delete()
      .eq("id", affiliation.id);
    if (error) {
      console.error("Error deleting affiliation:", error);
      // TODO: Implement user-facing error feedback
      return;
    }
    setAffReload(true);
  }, [affiliation.id, setAffReload]);

  useEffect(() => {
    if (editNumber === null || editNumber === undefined || editNumber < 0) {
      setIsValidNumber(false);
    } else {
      setIsValidNumber(true);
    }
  }, [editNumber]);

  // Helper function to get display name (already present in User component)
  const getDisplayName = (user: UserType) => {
    if (user.name && user.name !== "") {
      return user.name;
    }
    if (user.email) {
      const atIndex = user.email.indexOf("@");
      if (atIndex !== -1) {
        return user.email.substring(0, atIndex);
      }
      return user.email;
    }
    return "";
  };

  return (
    <Box
      sx={{
        ...backgroundStyle,
        display: "flex",
        alignItems: "center",
        // Space between user/form content and menu button
        gap: { xs: 0.5, sm: 1 },
        px: 1,
        py: 0.25,
        borderRadius: "4px",
        width: "100%",
        height: "100%",
        // Removed unnecessary flexDirection: "column" from here
      }}
    >
      {/* Main content area: User display or Number Edit Form */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexGrow: 1, // Allows this Box to take available space
          minWidth: 0, // Crucial for flex item shrinking
          py: 0.5, // Small vertical padding to align with menu button
        }}
      >
        {isEditingNumber ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: { xs: "center", sm: "flex-start" },
              gap: { xs: 1, sm: 2 },
              flexGrow: 1,
              flexDirection: { xs: "column", sm: "row" },
              minWidth: 0,
            }}
          >
            <Typography
              variant="body1"
              sx={{
                fontWeight: "bold",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: { xs: "150px", sm: "120px" }, // Adjusted max-width for name in edit mode
                flexShrink: 0,
              }}
            >
              {getDisplayName(user)}
            </Typography>
            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                width: "100%", // Take full width in column layout
                justifyContent: "center",
              }}
            >
              <TextField
                size="small"
                name="num"
                autoComplete="off"
                required
                id="num"
                label="Number"
                type="number"
                autoFocus
                onChange={handleInput}
                value={editNumber ?? ""}
                sx={{ maxWidth: "120px" }}
              />
              <IconButton
                size="small"
                type="submit"
                disabled={!isValidNumber}
                aria-label="confirm edit"
              >
                <CheckIcon color="primary" />
              </IconButton>
              <IconButton
                size="small"
                type="button"
                onClick={closeEdit}
                aria-label="cancel edit"
              >
                <CloseIcon />
              </IconButton>
            </form>
          </Box>
        ) : (
          <User
            user={user}
            goToProfile={goToProfile}
            small={small}
            number={affiliation.number}
            coach={affiliation.role === "coach" ? true : false}
          />
        )}
      </Box>

      {/* MoreHorizIcon and Menu */}
      <Box>
        <IconButton
          size="small"
          onClick={handleMenuClick}
          aria-label="user actions menu"
          sx={{ padding: 0 }}
        >
          <MoreVertIcon color="primary" />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
          slotProps={{
            paper: {
              sx: {
                borderRadius: "8px", // Slightly rounded corners for the menu
                boxShadow: 3, // Add some shadow
                py: 0.5, // Reduce vertical padding inside the menu
              },
            },
          }}
        >
          {/* Option: Change User # */}
          <MenuItem
            onClick={handleEditNumberClick}
            sx={{ px: 1, py: 0.5, minHeight: "auto" }}
          >
            <ListItemIcon sx={{ minWidth: "12px" }}>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  Change User #
                </Typography>
              }
            />
          </MenuItem>

          {/* Option: Delete User */}
          <MenuItem sx={{ px: 1, py: 0.5, minHeight: "auto" }}>
            <DeleteMenu
              isOpen={isDeleteMenuOpen}
              setIsOpen={setIsDeleteMenuOpen}
              handleDelete={handleDelete}
              actionMenu={true}
              deleteType="User from Team"
            />
          </MenuItem>
        </Menu>
      </Box>

      {/* Delete confirmation dialog (rendered but hidden) */}
      {/* <DeleteMenu
        isOpen={isDeleteMenuOpen}
        setIsOpen={setIsDeleteMenuOpen}
        handleDelete={handleDelete}
        deleteType="user from team"
        small={true}
      /> */}
    </Box>
  );
};

export default UserEdit;
