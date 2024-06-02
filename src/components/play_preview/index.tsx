import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { Divider, IconButton } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import YouTube, { type YouTubeEvent, type YouTubePlayer } from "react-youtube";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { PlayPreviewType, RealMentionType } from "~/utils/types";
import AddComment from "../interactions/comments/add-comment";
import CommentBtn from "../interactions/comments/comment-btn";
import CommentIndex from "../interactions/comments/comment-index";

type PlayPreviewProps = {
  play: PlayPreviewType | RealMentionType;
};

type PlayPreviewMentionType = {
  receiver_id: string;
  receiver_name: string;
};

const PlayPreview = ({ play }: PlayPreviewProps) => {
  const { screenWidth, isMobile } = useMobileContext();
  const { isDark } = useIsDarkContext();
  const { user } = useAuthContext();
  const router = useRouter();

  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);

  const [isCommentsOpen, setIsCommentsOpen] = useState<boolean>(false);
  const [commentCount, setCommentCount] = useState<number>(0);

  const [mentions, setMentions] = useState<PlayPreviewMentionType[] | null>(
    null,
  );

  const videoOnReady = async (e: YouTubeEvent) => {
    const video = e.target;
    setPlayer(video);
    void video.cueVideoById({
      videoId: `${play.link.split("v=")[1]?.split("&")[0]}`,
      startSeconds: play.start_time,
      endSeconds: play.end_time,
    });
  };

  const onPlayerStateChange = (e: YouTubeEvent) => {
    if (e.data == YT.PlayerState.ENDED) {
      void restartPreview();
    }
  };

  const restartPreview = () => {
    void player?.seekTo(play.start_time, true);
    void player?.pauseVideo();
  };

  const convertTimestamp = (date: string) => {
    const month =
      date.slice(5, 6) === "0" ? date.slice(6, 7) : date.substring(5, 7);
    const day =
      date.slice(8, 9) === "0" ? date.slice(8, 9) : date.substring(8, 10);
    return `${month}/${day}`;
  };

  const fetchMentions = async () => {
    const { data } = await supabase
      .from("inbox_mentions")
      .select("receiver_name, receiver_id")
      .eq("play_id", play.play_id);
    if (data && data.length > 0) setMentions(data);
    else setMentions(null);
  };

  const fetchLikeCount = async () => {
    const { count } = await supabase
      .from("play_likes")
      .select("user_name", { count: "exact" })
      .eq("play_id", play.play_id);
    if (count) setLikeCount(count);
    else {
      setLikeCount(0);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const { data } = await supabase
      .from("play_likes")
      .insert({
        play_id: play.play_id,
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
      .from("play_likes")
      .delete()
      .match({
        play_id: play.play_id,
        user_id: `${user.userId}`,
        user_name: `${user.name}`,
      })
      .select();
    if (data) {
      void fetchLikeCount();
      void fetchIfUserLiked();
    }
  };

  const fetchIfUserLiked = async () => {
    const { count } = await supabase
      .from("play_likes")
      .select("*", { count: "exact" })
      .match({ play_id: play.play_id, user_id: user.userId });
    if (count && count > 0) {
      setIsLiked(true);
    } else {
      setIsLiked(false);
    }
  };

  // const fetchInitialCommentNumber = async () => {
  //   const { count } = await supabase
  //     .from("comments")
  //     .select("*", { count: "exact" })
  //     .eq("play_id", play.play_id);
  //   if (count) setCommentCount(count);
  // };

  useEffect(() => {
    void fetchLikeCount();
    void fetchIfUserLiked();
    void fetchMentions();
    // void fetchInitialCommentNumber();
  }, []);

  return (
    <div className="flex flex-col rounded-md">
      <div className="flex items-center gap-2 p-2">
        <div
          className={`tracking cursor-pointer text-center text-xl font-bold ${
            isDark ? "hover:text-purple-400" : "hover:text-purple-A400"
          } hover:delay-100`}
          onClick={() => void router.push(`/profile/${play.author_id}`)}
        >
          {play.author_name}
        </div>
        <Divider flexItem orientation="vertical" variant="middle" />
        <div className="text-sm tracking-tight text-slate-600">
          {convertTimestamp(play.created_at)}
        </div>
        <div className="p-2">{play.play_title}</div>
      </div>
      <YouTube
        opts={{
          width: `${isMobile ? screenWidth * 0.9 : 640}`,
          height: `${isMobile ? (screenWidth * 0.9) / 1.778 : 390}`,
          playerVars: {
            end: play.end_time,
            controls: isMobile ? 1 : 0,
            enablejsapi: 1,
            playsinline: 1,
            disablekb: 1,
            fs: 1,
            rel: 0,
            color: "red",
            origin: "https://www.youtube.com",
          },
        }}
        onReady={videoOnReady}
        onStateChange={onPlayerStateChange}
        id="player"
        videoId={play.link.split("v=")[1]?.split("&")[0]}
      />
      <div className="flex w-full items-center gap-4 px-2">
        <div className="flex items-center justify-center gap-2">
          <div className="flex items-center">
            {isLiked ? (
              <IconButton onClick={(e) => void handleUnlike(e)}>
                <FavoriteIcon
                  color="primary"
                  fontSize={isMobile ? "medium" : "large"}
                />
              </IconButton>
            ) : (
              <IconButton onClick={(e) => void handleLike(e)}>
                <FavoriteBorderIcon
                  color="primary"
                  fontSize={isMobile ? "medium" : "large"}
                />
              </IconButton>
            )}
            <div className="text-lg font-bold md:text-2xl">{likeCount}</div>
          </div>
          <CommentBtn
            isOpen={isCommentsOpen}
            setIsOpen={setIsCommentsOpen}
            playId={play.play_id}
            commentCount={commentCount}
            setCommentCount={setCommentCount}
          />
        </div>
        {mentions && (
          <Divider flexItem orientation="vertical" variant="middle" />
        )}
        <div className="flex items-center justify-center gap-2">
          {mentions?.map((mention) => (
            <div
              onClick={() =>
                void router.push(`/profile/${mention.receiver_id}`)
              }
              className={`tracking cursor-pointer text-center text-lg font-bold ${
                isDark ? "hover:text-purple-400" : "hover:text-purple-A400"
              } hover:delay-100`}
            >
              @{mention.receiver_name}
            </div>
          ))}
        </div>
      </div>
      {isCommentsOpen && (
        <div className="my-4 flex w-full flex-col gap-4">
          <AddComment playId={play.play_id} />
          <CommentIndex
            playId={play.play_id}
            setCommentCount={setCommentCount}
            isActivePlay={false}
          />
        </div>
      )}
    </div>
  );
};

export default PlayPreview;
