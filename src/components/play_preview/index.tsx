import { Button, Divider } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import YouTube, { type YouTubeEvent, type YouTubePlayer } from "react-youtube";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type {
  PlayPreviewMentionType,
  PlayPreviewTagType,
  PlayPreviewType,
  RealMentionType,
} from "~/utils/types";
import AddComment from "../interactions/comments/add-comment";
import CommentBtn from "../interactions/comments/comment-btn";
import CommentIndex from "../interactions/comments/comment-index";
import LikeBtn from "../interactions/likes/like-btn";

type PlayPreviewProps = {
  play: PlayPreviewType | RealMentionType;
};

const PlayPreview = ({ play }: PlayPreviewProps) => {
  const { screenWidth, isMobile } = useMobileContext();
  const { isDark } = useIsDarkContext();
  const { user } = useAuthContext();
  const router = useRouter();

  const [player, setPlayer] = useState<YouTubePlayer | null>(null);

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [commentCount, setCommentCount] = useState<number>(0);

  const [mentions, setMentions] = useState<PlayPreviewMentionType[] | null>(
    null,
  );
  const [tags, setTags] = useState<PlayPreviewTagType[] | null>(null);

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

  const fetchTags = async () => {
    const tags = supabase
      .from("tags_for_play_previews")
      .select()
      .eq("play_id", play.play_id);
    if (user.currentAffiliation?.team.id) {
      void tags.or(
        `private.eq.false, exclusive_to.eq.${user.currentAffiliation.team.id}`,
      );
    } else {
      void tags.eq("private", false);
    }
    const { data } = await tags;
    if (data && data.length > 0) setTags(data);
    else setTags(null);
  };

  useEffect(() => {
    void fetchMentions();
    void fetchTags();
  }, [user]);

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
          <LikeBtn playId={play.play_id} />
          <CommentBtn
            isOpen={isExpanded}
            setIsOpen={setIsExpanded}
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
      {isExpanded && (
        <div className="flex w-full flex-col gap-4">
          <div>
            {tags?.map((tag) => (
              <Button key={tag.title + tag.play_id} size="small">
                #{tag.title}
              </Button>
            ))}
          </div>
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
