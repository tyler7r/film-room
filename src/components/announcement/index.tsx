import DeleteIcon from "@mui/icons-material/Delete";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { Button, Divider, IconButton } from "@mui/material";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import { AnnouncementType, LikeListType } from "~/utils/types";
import LikePopover from "../like-popover";

type AnnouncementProps = {
  annc: AnnouncementType;
};

const Announcement = ({ annc }: AnnouncementProps) => {
  const { user } = useAuthContext();
  const { backgroundStyle } = useIsDarkContext();
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [likeCount, setLikeCount] = useState<number>(0);

  const [likeList, setLikeList] = useState<LikeListType | null>(null);
  const [isDeleteMenuOpen, setIsDeleteMenuOpen] = useState<boolean>(false);

  const handlePopoverOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const fetchLikeCount = async () => {
    const { data, count } = await supabase
      .from("announcement_likes")
      .select("user_name", { count: "exact" })
      .eq("announcement_id", annc.id);
    console.log({ data, count });
    if (data && data.length > 0) setLikeList(data);
    if (count) setLikeCount(count);
    else {
      setLikeCount(0);
      setLikeList(null);
    }
  };

  const fetchIfUserLiked = async () => {
    const { count } = await supabase
      .from("announcement_likes")
      .select("*", { count: "exact" })
      .match({
        announcement_id: annc.id,
        user_id: user.userId,
      });
    if (count && count > 0) {
      setIsLiked(true);
    } else {
      setIsLiked(false);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const { data } = await supabase
      .from("announcement_likes")
      .insert({
        announcement_id: annc.id,
        user_id: `${user.userId}`,
        user_name: `${user.name}`,
      })
      .select();
    if (data) {
      void fetchLikeCount();
      void fetchIfUserLiked();
    }
  };

  const handleUnlike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const { data } = await supabase
      .from("announcement_likes")
      .delete()
      .match({
        announcement_id: annc.id,
        user_id: `${user.userId}`,
        user_name: `${user.name}`,
      })
      .select();
    if (data) {
      void fetchLikeCount();
      void fetchIfUserLiked();
    }
  };

  const handleDelete = async () => {
    await supabase.from("announcements").delete().eq("id", annc.id);
  };

  useEffect(() => {
    void fetchLikeCount();
    void fetchIfUserLiked();
  }, []);

  return (
    <div
      style={backgroundStyle}
      className="flex w-4/5 cursor-default items-center justify-center gap-2 rounded-md p-4 text-lg"
    >
      <div>
        <strong className="tracking-tight">{`${annc.author_name}: `}</strong>
        {annc.text}
      </div>
      <Divider
        flexItem
        orientation="vertical"
        style={{ marginLeft: "2px", marginRight: "2px" }}
      />
      <div className="flex items-center justify-center">
        {isLiked ? (
          <IconButton
            onMouseEnter={handlePopoverOpen}
            onMouseLeave={handlePopoverClose}
            size="small"
            onClick={(e) => void handleUnlike(e)}
          >
            <FavoriteIcon color="primary" />
          </IconButton>
        ) : (
          <IconButton
            onMouseEnter={handlePopoverOpen}
            onMouseLeave={handlePopoverClose}
            size="small"
            onClick={(e) => void handleLike(e)}
          >
            <FavoriteBorderIcon color="primary" />
          </IconButton>
        )}
        <div className="text-lg font-bold">{likeCount}</div>
      </div>
      {annc.author_id === user.currentAffiliation?.affId &&
        (isDeleteMenuOpen ? (
          <div className="ml-4 flex gap-1">
            <Button
              size="small"
              variant="contained"
              onClick={() => void handleDelete()}
            >
              Delete
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setIsDeleteMenuOpen(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <IconButton onClick={() => setIsDeleteMenuOpen(true)}>
            <DeleteIcon color="action" />
          </IconButton>
        ))}
      {likeList && (
        <LikePopover
          open={open}
          anchorEl={anchorEl}
          handlePopoverClose={handlePopoverClose}
          likeList={likeList}
        />
      )}
    </div>
  );
};

export default Announcement;
