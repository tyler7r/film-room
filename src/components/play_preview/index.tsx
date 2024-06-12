import { Button, Divider } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import YouTube, { type YouTubeEvent, type YouTubePlayer } from "react-youtube";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { MentionType, PlayPreviewType, TagType } from "~/utils/types";
import AddComment from "../interactions/comments/add-comment";
import CommentBtn from "../interactions/comments/comment-btn";
import CommentIndex from "../interactions/comments/comment-index";
import LikeBtn from "../interactions/likes/like-btn";

type PlayPreviewProps = {
  preview: PlayPreviewType;
};

const PlayPreview = ({ preview }: PlayPreviewProps) => {
  const { screenWidth, isMobile } = useMobileContext();
  const { hoverText } = useIsDarkContext();
  const { user } = useAuthContext();
  const router = useRouter();

  const [player, setPlayer] = useState<YouTubePlayer | null>(null);

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [commentCount, setCommentCount] = useState<number>(0);

  const [mentions, setMentions] = useState<MentionType[] | null>(null);
  const [tags, setTags] = useState<TagType[] | null>(null);

  const videoOnReady = async (e: YouTubeEvent) => {
    const video = e.target;
    setPlayer(video);
    void video.cueVideoById({
      videoId: `${preview.video.link.split("v=")[1]?.split("&")[0]}`,
      startSeconds: preview.play.start_time,
      endSeconds: preview.play.end_time,
    });
  };

  const onPlayerStateChange = (e: YouTubeEvent) => {
    if (e.data == YT.PlayerState.ENDED) {
      void restartPreview();
    }
  };

  const restartPreview = () => {
    void player?.seekTo(preview.play.start_time, true);
    void player?.pauseVideo();
  };

  const convertTimestamp = (date: string) => {
    const month =
      date.slice(5, 6) === "0" ? date.slice(6, 7) : date.substring(5, 7);
    const day =
      date.slice(8, 9) === "0" ? date.slice(9, 10) : date.substring(8, 10);
    return `${month}/${day}`;
  };

  const fetchMentions = async () => {
    const { data } = await supabase
      .from("plays_via_user_mention")
      .select("*")
      .eq("play->>id", preview.play.id);
    if (data && data.length > 0) {
      const mentions: MentionType[] = data.map((mention) => mention.mention);
      setMentions(mentions);
    } else setMentions(null);
  };

  const fetchTags = async () => {
    const tags = supabase
      .from("plays_via_tag")
      .select("*")
      .eq("play->>id", preview.play.id);
    if (user.currentAffiliation?.team.id) {
      void tags.or(
        `tag->>private.eq.false, tag->>exclusive_to.eq.${user.currentAffiliation.team.id}`,
      );
    } else {
      void tags.eq("play->>private", false);
    }
    const { data } = await tags;
    if (data) {
      const tags: TagType[] = data.map((tag) => tag.tag);
      setTags(tags);
    } else setTags(null);
  };

  useEffect(() => {
    void fetchMentions();
    void fetchTags();
  }, [user]);

  return (
    <div className="flex flex-col rounded-md">
      <div className="flex items-center gap-2 p-2">
        <div
          className={`tracking text-center text-xl font-bold ${hoverText}`}
          onClick={() => void router.push(`/profile/${preview.play.author_id}`)}
        >
          {preview.play.author_name}
        </div>
        <Divider flexItem orientation="vertical" variant="middle" />
        <div className="text-sm tracking-tight text-slate-600">
          {convertTimestamp(preview.play.created_at)}
        </div>
        <div className="p-2">{preview.play.title}</div>
      </div>
      <YouTube
        opts={{
          width: `${isMobile ? screenWidth : 640}`,
          height: `${isMobile ? screenWidth / 1.778 : 390}`,
          playerVars: {
            end: preview.play.end_time,
            enablejsapi: 1,
            playsinline: 1,
            disablekb: 1,
            fs: 1,
            controls: 0,
            rel: 0,
            color: "red",
            origin: "https://www.youtube.com",
          },
        }}
        onReady={videoOnReady}
        onStateChange={onPlayerStateChange}
        id="player"
        videoId={preview.video.link.split("v=")[1]?.split("&")[0]}
      />
      <div className="flex w-full items-center gap-4 px-2">
        <div className="flex items-center justify-center gap-2">
          <LikeBtn playId={preview.play.id} />
          <CommentBtn
            isOpen={isExpanded}
            setIsOpen={setIsExpanded}
            playId={preview.play.id}
            commentCount={commentCount}
            setCommentCount={setCommentCount}
            activePlay={null}
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
              className={`tracking text-center text-lg font-bold ${hoverText}`}
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
              <Button key={tag.title + tag.id} size="small">
                #{tag.title}
              </Button>
            ))}
          </div>
          <AddComment playId={preview.play.id} />
          <CommentIndex
            playId={preview.play.id}
            setCommentCount={setCommentCount}
            isActivePlay={false}
          />
        </div>
      )}
    </div>
  );
};

export default PlayPreview;
