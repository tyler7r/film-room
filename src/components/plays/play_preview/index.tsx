import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import LinkIcon from "@mui/icons-material/Link";
import ShortcutIcon from "@mui/icons-material/Shortcut";
import StarIcon from "@mui/icons-material/Star";
import { Button, Divider, IconButton, Menu, MenuItem } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import YouTube, { type YouTubeEvent, type YouTubePlayer } from "react-youtube";
import TeamLogo from "~/components/teams/team-logo";
import PageTitle from "~/components/utils/page-title";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { PlayPreviewType } from "~/utils/types";
import CommentBtn from "../../interactions/comments/comment-btn";
import LikeBtn from "../../interactions/likes/like-btn";
import StandardPopover from "../../utils/standard-popover";
import ExpandedPlay from "../expanded-play";
import PlayActionsMenu from "../play-actions-menu";
import PlayMentions from "../play-mentions";
import PlayTags from "../play-tags";

type PlayPreviewProps = {
  preview: PlayPreviewType;
  collectionId?: string;
  setReload?: (reload: boolean) => void;
  collectionAuthor?: string;
};

const PlayPreview = ({
  preview,
  collectionId,
  setReload,
  collectionAuthor,
}: PlayPreviewProps) => {
  const { isMobile, fullScreen } = useMobileContext();
  const { hoverText } = useIsDarkContext();
  const { user, affiliations } = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [anchorEl, setAnchorEl] = useState<{
    anchor1: HTMLElement | null;
    anchor2: HTMLElement | null;
    anchor3: HTMLElement | null;
    anchor4: HTMLElement | null;
  }>({ anchor1: null, anchor2: null, anchor3: null, anchor4: null });
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [commentCount, setCommentCount] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const exclusiveTeam = affiliations?.find(
    (aff) => aff.team.id === preview.play.exclusive_to,
  )?.team;

  const handlePopoverOpen = (
    e: React.MouseEvent<HTMLElement>,
    target: 1 | 2 | 3 | 4,
  ) => {
    if (target === 1) {
      setAnchorEl({
        anchor1: e.currentTarget,
        anchor2: null,
        anchor3: null,
        anchor4: null,
      });
    } else if (target === 2) {
      setAnchorEl({
        anchor1: null,
        anchor2: e.currentTarget,
        anchor3: null,
        anchor4: null,
      });
    } else if (target === 3) {
      setAnchorEl({
        anchor1: null,
        anchor2: null,
        anchor3: e.currentTarget,
        anchor4: null,
      });
    } else {
      setAnchorEl({
        anchor1: null,
        anchor2: null,
        anchor3: null,
        anchor4: e.currentTarget,
      });
    }
  };

  const handlePopoverClose = () => {
    setAnchorEl({ anchor1: null, anchor2: null, anchor3: null, anchor4: null });
    setIsCopied(false);
  };

  const open = Boolean(anchorEl.anchor1);
  const open2 = Boolean(anchorEl.anchor2);
  const open3 = Boolean(anchorEl.anchor3);
  const open4 = Boolean(anchorEl.anchor4);

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

  const handleVideoClick = () => {
    const videoId = preview.video.id;
    const playId = preview.play.id;
    const playStart = preview.play.start_time;

    const params = new URLSearchParams(searchParams);
    params.set("play", playId);
    params.set("start", `${playStart}`);

    if (user.userId) void updateLastWatched(videoId, playStart);
    void router.push(`/film-room/${videoId}?${params.toString()}`);
  };

  const handlePlayClick = () => {
    const playId = preview.play.id;
    void router.push(`/play/${playId}`);
  };

  const copyToClipboard = () => {
    const origin = window.location.origin;
    void navigator.clipboard.writeText(`${origin}/play/${preview.play.id}`);
    setIsCopied(true);
  };

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  });

  return (
    <div
      className="flex w-full flex-col justify-center rounded-md"
      // style={{
      //   width: `${isMobile ? `420px` : fullScreen ? "960px" : "640px"}`,
      // }}
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
              <TeamLogo tm={exclusiveTeam} size={35} inactive={true} />
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
            className={`text-center font-bold tracking-tighter md:text-xl ${hoverText}`}
            onClick={() =>
              void router.push(`/profile/${preview.play.author_id}`)
            }
          >
            {preview.author.name}
          </div>
          <Divider flexItem orientation="vertical" variant="middle" />
          <div className="text-xs font-bold leading-3 tracking-tight">
            ({preview.play.end_time - preview.play.start_time}s)
          </div>
          {!isMobile && (
            <div className="flex-wrap p-2">{preview.play.title}</div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <PlayActionsMenu
            preview={preview}
            collectionId={collectionId}
            setReload={setReload}
            collectionAuthor={collectionAuthor}
          />
          <IconButton
            onClick={copyToClipboard}
            onMouseEnter={(e) => handlePopoverOpen(e, 4)}
            onMouseLeave={handlePopoverClose}
            size="small"
          >
            <LinkIcon />
            <StandardPopover
              open={open4}
              anchorEl={anchorEl.anchor4}
              content={isCopied ? "Copied!" : `Copy play link`}
              handlePopoverClose={handlePopoverClose}
            />
          </IconButton>
          <IconButton onClick={(e) => handlePopoverOpen(e, 1)} size="small">
            <ShortcutIcon color="primary" />
          </IconButton>
        </div>
        {open && (
          <Menu
            open={open}
            anchorEl={anchorEl.anchor1}
            onClose={handlePopoverClose}
          >
            <MenuItem onClick={handlePlayClick}>
              <div className="text-sm font-bold tracking-tight">GO TO PLAY</div>
            </MenuItem>
            <MenuItem onClick={handleVideoClick}>
              <div className="text-sm font-bold tracking-tight">
                GO TO VIDEO
              </div>
            </MenuItem>
          </Menu>
        )}
      </div>
      {!isLoading && (
        <YouTube
          opts={{
            width: `${isMobile ? 450 : fullScreen ? 960 : 640}`,
            height: `${isMobile ? 275 : fullScreen ? 595 : 390}`,
            playerVars: {
              end: preview.play.end_time,
              enablejsapi: 1,
              playsinline: 1,
              disablekb: 1,
              fs: 1,
              controls: 0,
              rel: 0,
              origin: `https://www.youtube.com`,
            },
          }}
          onReady={videoOnReady}
          onStateChange={onPlayerStateChange}
          id="player"
          videoId={preview.video.link.split("v=")[1]?.split("&")[0]}
        />
      )}
      {isLoading && <PageTitle size="small" title="Loading..." />}
      {isMobile && (
        <div className="-my-1 flex flex-wrap p-2 text-sm md:text-base">
          {preview.play.title}
        </div>
      )}
      <PlayMentions play={preview} />
      <PlayTags play={preview} />
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
          ) : preview.play.note ? (
            <Button
              size="small"
              style={{ fontWeight: "bold" }}
              variant="text"
              onClick={() => setIsExpanded(true)}
              endIcon={
                <KeyboardArrowDownIcon color="primary" fontSize="large" />
              }
            >
              See note
            </Button>
          ) : (
            <IconButton size="small" onClick={() => setIsExpanded(true)}>
              <KeyboardArrowDownIcon color="primary" fontSize="large" />
            </IconButton>
          )}
        </div>
      </div>
      {isExpanded && (
        <div className="mt-2">
          <ExpandedPlay
            play={preview}
            commentCount={commentCount}
            setCommentCount={setCommentCount}
          />
        </div>
      )}
    </div>
  );
};

export default PlayPreview;
