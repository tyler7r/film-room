import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ShortcutIcon from "@mui/icons-material/Shortcut";
import StarIcon from "@mui/icons-material/Star";
import { Button, Divider, IconButton } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import YouTube, { type YouTubeEvent, type YouTubePlayer } from "react-youtube";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { MentionType, PlayPreviewType, TagType } from "~/utils/types";
import DeleteMenu from "../delete-menu";
import AddComment from "../interactions/comments/add-comment";
import CommentBtn from "../interactions/comments/comment-btn";
import CommentIndex from "../interactions/comments/comment-index";
import LikeBtn from "../interactions/likes/like-btn";
import StandardPopover from "../standard-popover";

type PlayPreviewProps = {
  preview: PlayPreviewType;
};

const PlayPreview = ({ preview }: PlayPreviewProps) => {
  const { isMobile } = useMobileContext();
  const { hoverText } = useIsDarkContext();
  const { user, setUser, affiliations, affIds } = useAuthContext();
  const router = useRouter();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [commentCount, setCommentCount] = useState<number>(0);

  const [mentions, setMentions] = useState<MentionType[] | null>(null);
  const [tags, setTags] = useState<TagType[] | null>(null);

  const [isDeleteMenuOpen, setIsDeleteMenuOpen] = useState<boolean>(false);

  const handlePopoverOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

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
      void tags.or(`tag->>private.eq.false, tag->>exclusive_to.in.(${affIds})`);
    } else {
      void tags.eq("tag->>private", false);
    }
    const { data } = await tags;
    if (data) {
      const tags: TagType[] = data.map((tag) => tag.tag);
      setTags(tags);
    } else setTags(null);
  };

  const updateLastWatched = async (video: string, time: number) => {
    if (user.userId) {
      await supabase
        .from("profiles")
        .update({ last_watched: video, last_watched_time: time })
        .eq("id", user.userId);
    }
  };

  const updateUserAffiliation = (teamId: string) => {
    const team = affiliations?.find((aff) => aff.team.id === teamId);
    if (user.currentAffiliation?.team.id === teamId) return;
    else {
      setUser({
        ...user,
        currentAffiliation: team ? team : user.currentAffiliation,
      });
    }
  };

  const handleVideoClick = async (videoId: string, teamId: string | null) => {
    if (teamId) void updateUserAffiliation(teamId);
    if (user.userId) void updateLastWatched(videoId, 0);
    void router.push(`/film-room/${videoId}`);
  };

  const handleDelete = async () => {
    await supabase.from("plays").delete().eq("id", preview.play.id);
  };

  useEffect(() => {
    void fetchMentions();
    void fetchTags();
  }, [user]);

  return (
    <div className="flex flex-col rounded-md">
      <div className="flex items-center justify-between gap-2 p-2">
        <div className="flex items-center gap-2">
          {preview.play.highlight && (
            <StarIcon color="secondary" fontSize="large" />
          )}
          <div
            className={`tracking text-center text-xl font-bold ${hoverText}`}
            onClick={() =>
              void router.push(`/profile/${preview.play.author_id}`)
            }
          >
            {preview.play.author_name}
          </div>
          <Divider flexItem orientation="vertical" variant="middle" />
          <div className="text-sm tracking-tight text-slate-600">
            {convertTimestamp(preview.play.created_at)}
          </div>
          <div className="p-2">{preview.play.title}</div>
        </div>
        <div className="flex items-center gap-1">
          {preview.play.author_id === user.userId && (
            <DeleteMenu
              isOpen={isDeleteMenuOpen}
              setIsOpen={setIsDeleteMenuOpen}
              handleDelete={handleDelete}
            />
          )}
          <IconButton
            onMouseEnter={handlePopoverOpen}
            onMouseLeave={handlePopoverClose}
            onClick={() =>
              handleVideoClick(preview.video.id, preview.video.exclusive_to)
            }
            size="small"
          >
            <ShortcutIcon fontSize="large" color="primary" />
          </IconButton>
          <StandardPopover
            content="Go to Video"
            open={open}
            anchorEl={anchorEl}
            handlePopoverClose={handlePopoverClose}
          />
        </div>
      </div>
      <YouTube
        opts={{
          width: `${isMobile ? 480 : 640}`,
          height: `${isMobile ? 295 : 390}`,
          playerVars: {
            end: preview.play.end_time,
            enablejsapi: 1,
            playsinline: 1,
            disablekb: 1,
            fs: 1,
            controls: 0,
            rel: 0,
            origin: `http://localhost:9000`,
          },
        }}
        onReady={videoOnReady}
        onStateChange={onPlayerStateChange}
        id="player"
        videoId={preview.video.link.split("v=")[1]?.split("&")[0]}
      />
      {mentions && (
        <div className="flex items-center gap-2 p-2">
          <LocalOfferIcon />
          <div className="flex flex-wrap items-center justify-center gap-2">
            {mentions?.map((mention) => (
              <div
                onClick={() =>
                  void router.push(`/profile/${mention.receiver_id}`)
                }
                className={`tracking text-center font-bold ${hoverText} text-base leading-3`}
                key={mention.id}
              >
                @{mention.receiver_name}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex w-full items-center gap-3 px-1">
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
          {isExpanded ? (
            <IconButton size="small" onClick={() => setIsExpanded(false)}>
              <KeyboardArrowUpIcon color="primary" fontSize="large" />
            </IconButton>
          ) : (
            <IconButton size="small" onClick={() => setIsExpanded(true)}>
              <KeyboardArrowDownIcon color="primary" fontSize="large" />
            </IconButton>
          )}
        </div>
      </div>
      {isExpanded && (
        <div className="my-4 flex w-full flex-col items-center gap-2">
          <div className="w-full">
            <strong
              onClick={() =>
                void router.push(`/profile/${preview.play.author_id}`)
              }
              className={`${hoverText}`}
            >
              {preview.play.author_name}:{" "}
            </strong>
            {preview.play.note}
          </div>
          <div className="flex w-full gap-2">
            {tags?.map((tag) => (
              <Button key={tag.title + tag.id} size="small">
                #{tag.title}
              </Button>
            ))}
          </div>
          <div className="flex w-full flex-col items-center gap-4">
            <AddComment playId={preview.play.id} />
            <CommentIndex
              playId={preview.play.id}
              setCommentCount={setCommentCount}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayPreview;
