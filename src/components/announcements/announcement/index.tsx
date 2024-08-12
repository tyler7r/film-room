import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { Divider, IconButton } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { convertTimestamp } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { AnnouncementType, LikeListType } from "~/utils/types";
import LikePopover from "../../interactions/likes/like-popover";
import DeleteMenu from "../../utils/delete-menu";

type AnnouncementProps = {
  annc: AnnouncementType;
};

const Announcement = ({ annc }: AnnouncementProps) => {
  const { user } = useAuthContext();
  const { backgroundStyle, hoverText } = useIsDarkContext();
  const router = useRouter();

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
    if (user.userId && user.name) {
      const { data } = await supabase
        .from("announcement_likes")
        .insert({
          announcement_id: annc.id,
          user_id: user.userId,
          user_name: user.name,
        })
        .select();
      if (data) {
        void fetchLikeCount();
        void fetchIfUserLiked();
      }
    } else {
      void router.push("/login");
    }
  };

  const handleUnlike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user.userId) {
      const { data } = await supabase
        .from("announcement_likes")
        .delete()
        .match({
          announcement_id: annc.id,
          user_id: user.userId,
        })
        .select();
      if (data) {
        void fetchLikeCount();
        void fetchIfUserLiked();
      }
    } else void router.push("/login");
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
      <div className="text-sm font-light">
        {convertTimestamp(annc.created_at)}
      </div>
      <div>
        <strong
          className={`${hoverText} font-bold tracking-tight`}
          onClick={() => void router.push(`/profile/${annc.author_id}`)}
        >{`${annc.author_name}: `}</strong>
        {annc.text}
      </div>
      <Divider
        flexItem
        orientation="vertical"
        style={{ marginLeft: "2px", marginRight: "2px" }}
      />
      <div className="flex">
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
          <div className="text-lg font-bold tracking-tight">{likeCount}</div>
        </div>
        {annc.author_id === user.userId && (
          <DeleteMenu
            isOpen={isDeleteMenuOpen}
            setIsOpen={setIsDeleteMenuOpen}
            handleDelete={handleDelete}
            deleteType="announcement"
          />
        )}
      </div>
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
