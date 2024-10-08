import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { Divider, IconButton } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { convertTimestamp } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { AnnouncementViewType } from "~/utils/types";
import DeleteMenu from "../../utils/delete-menu";

type AnnouncementProps = {
  annc: AnnouncementViewType;
};

const Announcement = ({ annc }: AnnouncementProps) => {
  const { user } = useAuthContext();
  const { backgroundStyle, hoverText } = useIsDarkContext();
  const router = useRouter();

  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);

  const [isDeleteMenuOpen, setIsDeleteMenuOpen] = useState<boolean>(false);

  const fetchLikeCount = async () => {
    const { count } = await supabase
      .from("announcement_likes")
      .select("*", { count: "exact" })
      .eq("announcement_id", annc.announcement.id);
    if (count) setLikeCount(count);
    else {
      setLikeCount(0);
    }
  };

  const fetchIfUserLiked = async () => {
    const { count } = await supabase
      .from("announcement_likes")
      .select("*", { count: "exact" })
      .match({
        announcement_id: annc.announcement.id,
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
          announcement_id: annc.announcement.id,
          user_id: user.userId,
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
          announcement_id: annc.announcement.id,
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
    await supabase
      .from("announcements")
      .delete()
      .eq("id", annc.announcement.id);
  };

  useEffect(() => {
    void fetchLikeCount();
    void fetchIfUserLiked();
  }, []);

  return (
    <div
      style={backgroundStyle}
      className="flex cursor-default items-center justify-center gap-2 rounded-md p-2 text-lg"
    >
      <div className="text-xs font-light">
        {convertTimestamp(annc.announcement.created_at)}
      </div>
      <div className="text-sm">
        <strong
          className={`${hoverText} text-sm font-bold tracking-tight`}
          onClick={() => void router.push(`/profile/${annc.author.id}`)}
        >{`${annc.author.name}: `}</strong>
        {annc.announcement.text}
      </div>
      <Divider
        flexItem
        orientation="vertical"
        style={{ marginLeft: "2px", marginRight: "2px" }}
      />
      <div className="flex">
        <div className="flex items-center justify-center">
          {isLiked ? (
            <IconButton size="small" onClick={(e) => void handleUnlike(e)}>
              <FavoriteIcon color="primary" />
            </IconButton>
          ) : (
            <IconButton size="small" onClick={(e) => void handleLike(e)}>
              <FavoriteBorderIcon color="primary" />
            </IconButton>
          )}
          <div className="text-lg font-bold tracking-tight">{likeCount}</div>
        </div>
        {annc.author.id === user.userId && (
          <DeleteMenu
            isOpen={isDeleteMenuOpen}
            setIsOpen={setIsDeleteMenuOpen}
            handleDelete={handleDelete}
            deleteType="announcement"
          />
        )}
      </div>
    </div>
  );
};

export default Announcement;
