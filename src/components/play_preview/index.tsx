import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ShortcutIcon from "@mui/icons-material/Shortcut";
import StarIcon from "@mui/icons-material/Star";
import { Divider, IconButton } from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";
import YouTube, { type YouTubeEvent, type YouTubePlayer } from "react-youtube";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { useIsDarkContext } from "~/pages/_app";
import { convertTimestamp } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { PlayPreviewType } from "~/utils/types";
import DeleteMenu from "../delete-menu";
import ExpandedPlay from "../expanded-play";
import CommentBtn from "../interactions/comments/comment-btn";
import LikeBtn from "../interactions/likes/like-btn";
import Mentions from "../mentions";
import StandardPopover from "../standard-popover";
import Tags from "../tags";
import TeamLogo from "../team-logo";

type PlayPreviewProps = {
  preview: PlayPreviewType;
};

const PlayPreview = ({ preview }: PlayPreviewProps) => {
  const { isMobile, fullScreen } = useMobileContext();
  const { hoverText } = useIsDarkContext();
  const { user, affiliations } = useAuthContext();
  const router = useRouter();

  const [anchorEl, setAnchorEl] = useState<{
    anchor1: HTMLElement | null;
    anchor2: HTMLElement | null;
    anchor3: HTMLElement | null;
  }>({ anchor1: null, anchor2: null, anchor3: null });
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [commentCount, setCommentCount] = useState<number>(0);

  const [isDeleteMenuOpen, setIsDeleteMenuOpen] = useState<boolean>(false);

  const exclusiveTeam = affiliations?.find(
    (aff) => aff.team.id === preview.play.exclusive_to,
  )?.team;

  const handlePopoverOpen = (
    e: React.MouseEvent<HTMLElement>,
    target: 1 | 2 | 3,
  ) => {
    if (target === 1) {
      setAnchorEl({ anchor1: e.currentTarget, anchor2: null, anchor3: null });
    } else if (target === 2) {
      setAnchorEl({ anchor1: null, anchor2: e.currentTarget, anchor3: null });
    } else {
      setAnchorEl({ anchor1: null, anchor2: null, anchor3: e.currentTarget });
    }
  };

  const handlePopoverClose = () => {
    setAnchorEl({ anchor1: null, anchor2: null, anchor3: null });
  };

  const open = Boolean(anchorEl.anchor1);
  const open2 = Boolean(anchorEl.anchor2);
  const open3 = Boolean(anchorEl.anchor3);

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

  const updateLastWatched = async (video: string, time: number) => {
    if (user.userId) {
      await supabase
        .from("profiles")
        .update({ last_watched: video, last_watched_time: time })
        .eq("id", user.userId);
    }
  };

  const handleVideoClick = async (videoId: string) => {
    if (user.userId) void updateLastWatched(videoId, 0);
    void router.push(`/film-room/${videoId}`);
  };

  const handleDelete = async () => {
    await supabase.from("plays").delete().eq("id", preview.play.id);
  };

  return (
    <div
      className="flex flex-col rounded-md"
      style={{
        width: `${isMobile ? "480px" : fullScreen ? "800px" : "640px"}`,
      }}
    >
      <div className="flex items-center justify-between gap-2 p-2">
        <div className="flex items-center gap-2">
          {preview.play.private && exclusiveTeam && (
            <IconButton
              size="small"
              onClick={() => void router.push(`/team-hub/${exclusiveTeam.id}`)}
              onMouseEnter={(e) => handlePopoverOpen(e, 2)}
              onMouseLeave={handlePopoverClose}
            >
              <TeamLogo tm={exclusiveTeam} size={30} inactive={true} />
              <StandardPopover
                open={open2}
                anchorEl={anchorEl.anchor2}
                content={`Play is private to ${exclusiveTeam?.full_name}`}
                handlePopoverClose={handlePopoverClose}
              />
            </IconButton>
          )}
          {preview.play.highlight && (
            <div
              onMouseEnter={(e) => handlePopoverOpen(e, 3)}
              onMouseLeave={handlePopoverClose}
              className="flex cursor-pointer items-center justify-center"
            >
              <StarIcon color="secondary" fontSize="large" />
              <StandardPopover
                open={open3}
                anchorEl={anchorEl.anchor3}
                content="Highlight!"
                handlePopoverClose={handlePopoverClose}
              />
            </div>
          )}
          <div
            className={`text-center font-serif text-xl font-bold italic tracking-tighter ${hoverText}`}
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
          <div className="flex-wrap p-2">{preview.play.title}</div>
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
            onMouseEnter={(e) => handlePopoverOpen(e, 1)}
            onMouseLeave={handlePopoverClose}
            onClick={() => handleVideoClick(preview.video.id)}
            size="small"
          >
            <ShortcutIcon fontSize="large" color="primary" />
          </IconButton>
          <StandardPopover
            content="Go to Video"
            open={open}
            anchorEl={anchorEl.anchor1}
            handlePopoverClose={handlePopoverClose}
          />
        </div>
      </div>
      <YouTube
        opts={{
          width: `${isMobile ? 475 : fullScreen ? 800 : 640}`,
          height: `${isMobile ? 295 : fullScreen ? 495 : 390}`,
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
      <Mentions play={preview} />
      <Tags play={preview} />
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
        <div className="mt-2">
          <ExpandedPlay play={preview} setCommentCount={setCommentCount} />
        </div>
      )}
    </div>
  );
};

export default PlayPreview;
