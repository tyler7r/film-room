// For example: ~/components/modals/LikedUsersModal.tsx
import CloseIcon from "@mui/icons-material/Close";
import {
  Avatar,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import { getDisplayName } from "~/utils/helpers";
import { supabase } from "~/utils/supabase"; // Adjust path if necessary
import { type UserType } from "~/utils/types";

// Assuming you have a ProfileType defined in ~/utils/types.ts
// If not, you might need to create a simple one like:
// export type ProfileType = {
//   id: string;
//   full_name: string | null;
//   avatar_url: string | null;
// };

type LikedUsersModalProps = {
  open: boolean;
  onClose: (e: React.MouseEvent) => void;
  playId: string;
  commentLike?: boolean;
  replyLike?: boolean;
};

const LikedUsersModal = ({
  open,
  onClose,
  playId,
  commentLike,
  replyLike,
}: LikedUsersModalProps) => {
  const router = useRouter();
  const [likedUsers, setLikedUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLikedUsers = useCallback(async () => {
    setIsLoading(true);
    let tableName: string;
    let foreignKey: string;
    let errorMsgPrefix: string;

    if (commentLike) {
      tableName = "comment_likes";
      foreignKey = "comment_id";
      errorMsgPrefix = "Error fetching comment likes:";
    } else if (replyLike) {
      tableName = "reply_likes";
      foreignKey = "reply_id";
      errorMsgPrefix = "Error fetching reply likes:";
    } else {
      tableName = "play_likes";
      foreignKey = "play_id";
      errorMsgPrefix = "Error fetching play likes:";
    }

    const { data: likesData, error: likesError } = await supabase
      .from(
        tableName === "comment_likes"
          ? "comment_likes"
          : tableName === "reply_likes"
            ? "reply_likes"
            : "play_likes",
      )
      .select(`user_id`)
      .eq(foreignKey, playId);

    if (likesError) {
      console.error(errorMsgPrefix, likesError);
      setLikedUsers([]);
      setIsLoading(false);
      return;
    }

    if (likesData && likesData.length > 0) {
      const userIds = likesData.map((like) => like.user_id);

      // Fetch user profiles for the unique userIds
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select(`*`)
        .in("id", Array.from(new Set(userIds))); // Use Set to get unique user IDs

      if (profilesError) {
        console.error("Error fetching user profiles for likes:", profilesError);
        setLikedUsers([]);
      } else if (profilesData) {
        setLikedUsers(profilesData);
      }
    } else {
      setLikedUsers([]);
    }
    setIsLoading(false);
  }, [playId, commentLike, replyLike]);

  useEffect(() => {
    if (open) {
      void fetchLikedUsers();
    }
  }, [open, fetchLikedUsers]); // Re-fetch when modal opens or fetchLikedUsers callback changes

  const handleUserClick = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation(); // Prevent the modal from closing immediately if onClick bubbles
    void router.push(`/profile/${userId}`);
    onClose(e); // Close the modal after navigating
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ m: 0, p: 1, px: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Liked By
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0.5 }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <Typography>Loading likes...</Typography>
          </Box>
        ) : likedUsers.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              No likes
            </Typography>
          </Box>
        ) : (
          <List dense>
            {likedUsers.map((user) => (
              <ListItem
                key={user.id}
                onClick={(e) => handleUserClick(e, user.id)}
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                  borderRadius: 2,
                  mb: 0.5,
                  px: 1.5,
                  py: 0.5,
                }}
              >
                <Avatar sx={{ mr: 1, width: 30, height: 30 }}>
                  {getDisplayName(user)[0]?.toLocaleUpperCase()}
                </Avatar>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {getDisplayName(user)}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LikedUsersModal;
