import FullscreenIcon from "@mui/icons-material/Fullscreen"; // Import FullscreenIcon
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import LinkIcon from "@mui/icons-material/Link";
import ShortcutIcon from "@mui/icons-material/Shortcut";
import StarIcon from "@mui/icons-material/Star";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react"; // Added useCallback
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
import PlayPreviewMentions from "./play-mentions";
import PlayPreviewTags from "./play-tags";

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
  const { isMobile } = useMobileContext();
  const { hoverText } = useIsDarkContext();
  const { user, affiliations } = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [anchorEl, setAnchorEl] = useState<{
    anchor1: HTMLElement | null;
    anchor2: HTMLElement | null;
    anchor3: HTMLElement | null;
    anchor4: HTMLElement | null;
    anchor5: HTMLElement | null; // Added for fullscreen popover
  }>({
    anchor1: null,
    anchor2: null,
    anchor3: null,
    anchor4: null,
    anchor5: null,
  }); // Initialize
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
    target: 1 | 2 | 3 | 4 | 5, // Updated to include target 5
  ) => {
    if (target === 1) {
      setAnchorEl((prev) => ({ ...prev, anchor1: e.currentTarget }));
    } else if (target === 2) {
      setAnchorEl((prev) => ({ ...prev, anchor2: e.currentTarget }));
    } else if (target === 3) {
      setAnchorEl((prev) => ({ ...prev, anchor3: e.currentTarget }));
    } else if (target === 4) {
      setAnchorEl((prev) => ({ ...prev, anchor4: e.currentTarget }));
    } else {
      // target === 5
      setAnchorEl((prev) => ({ ...prev, anchor5: e.currentTarget }));
    }
  };

  const handlePopoverClose = () => {
    setAnchorEl({
      anchor1: null,
      anchor2: null,
      anchor3: null,
      anchor4: null,
      anchor5: null,
    }); // Reset all
    setIsCopied(false);
  };

  const open = Boolean(anchorEl.anchor1);
  const open2 = Boolean(anchorEl.anchor2);
  const open3 = Boolean(anchorEl.anchor3);
  const open4 = Boolean(anchorEl.anchor4);
  const open5 = Boolean(anchorEl.anchor5); // State for fullscreen popover

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
    // Ensure YT is defined before using it
    if (typeof YT !== "undefined" && e.data == YT.PlayerState.ENDED) {
      void restartPreview();
    }
  };

  const restartPreview = useCallback(async () => {
    // Check if player exists and if it's currently in fullscreen
    if (player) {
      const iframe = await player.getIframe();
      // If the document is not in fullscreen mode, or if the player itself is not the fullscreen element,
      // then we want to reset the preview. This handles cases where user exits fullscreen via system controls.
      if (
        !document.fullscreenElement ||
        document.fullscreenElement !== iframe
      ) {
        void player.seekTo(preview.play.start_time, true);
        void player.pauseVideo();
      }
    }
  }, [player, preview.play.start_time]); // Dependencies for useCallback

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
    // Using document.execCommand('copy') for better compatibility within iframes
    const tempInput = document.createElement("input");
    tempInput.value = `${origin}/play/${preview.play.id}`;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    setIsCopied(true);
  };

  // Function to handle fullscreen request
  const handleFullscreen = async () => {
    if (player) {
      const iframe = await player.getIframe();
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen().catch((err: Error) => {
          console.error(
            `Error attempting to enable fullscreen: ${err.message} (${err.name})`,
          );
          // Optionally, display a user-friendly message here
        });
      }
    }
  };

  useEffect(() => {
    // Small delay to ensure component is fully mounted before YouTube attempts to render
    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  }, []); // Empty dependency array means this runs once on mount

  // Effect to handle fullscreen changes
  useEffect(() => {
    // Define the synchronous event handler
    const handleFullscreenChange = () => {
      // Wrap the async call in a self-invoking async function with catch
      // This satisfies the no-floating-promises rule and keeps the event listener synchronous.
      void (async () => {
        if (!document.fullscreenElement) {
          // Only call restart if fullscreen is exited
          try {
            await restartPreview();
          } catch (error) {
            console.error("Error during fullscreen exit restart:", error);
          }
        }
      })();
    };

    // Add event listeners for fullscreen change (cross-browser compatibility)
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    // Cleanup function
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange,
      );
    };
  }, [restartPreview]); // Dependencies: only restartPreview callback is needed here

  return (
    <Box
      className="flex w-full flex-col justify-center rounded-md"
      // Removed inline style for width. The parent container of PlayPreview should
      // handle the overall max-width for desktop, and this component will be `w-full`.
    >
      <Box className="flex items-center justify-between gap-2 p-2">
        <Box className="flex items-center gap-2">
          {preview.play.private && exclusiveTeam && (
            <IconButton
              size="small"
              onClick={() => void router.push(`/team-hub/${exclusiveTeam.id}`)}
              onMouseEnter={(e) => handlePopoverOpen(e, 2)}
              onMouseLeave={handlePopoverClose}
            >
              <TeamLogo tm={exclusiveTeam} size={25} inactive={true} />
              <StandardPopover
                open={open2}
                anchorEl={anchorEl.anchor2}
                content={`Play is private to ${exclusiveTeam?.full_name}`}
                handlePopoverClose={handlePopoverClose}
              />
            </IconButton>
          )}
          {preview.play.highlight && (
            <Box
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
            </Box>
          )}
          <Box
            className={`text-center font-bold tracking-tighter md:text-xl ${hoverText}`}
            onClick={() =>
              void router.push(`/profile/${preview.play.author_id}`)
            }
          >
            {preview.author.name}
          </Box>
          <Divider flexItem orientation="vertical" variant="middle" />
          <Box className="text-xs font-bold leading-3 tracking-tight">
            ({preview.play.end_time - preview.play.start_time}s)
          </Box>
          {!isMobile && (
            <Box className="flex-wrap p-2">{preview.play.title}</Box>
          )}
        </Box>
        <Box className="flex items-center gap-1">
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
          {/* Fullscreen Button */}
          <IconButton
            onClick={handleFullscreen}
            onMouseEnter={(e) => handlePopoverOpen(e, 5)} // Use new anchor5
            onMouseLeave={handlePopoverClose}
            size="small"
          >
            <FullscreenIcon />
            <StandardPopover
              open={open5} // Use new open5 state
              anchorEl={anchorEl.anchor5}
              content="Fullscreen"
              handlePopoverClose={handlePopoverClose}
            />
          </IconButton>
          <IconButton onClick={(e) => handlePopoverOpen(e, 1)} size="small">
            <ShortcutIcon color="primary" />
          </IconButton>
        </Box>
        {open && (
          <Menu
            open={open}
            anchorEl={anchorEl.anchor1}
            onClose={handlePopoverClose}
          >
            <MenuItem onClick={handlePlayClick}>
              <Box className="text-sm font-bold tracking-tight">GO TO PLAY</Box>
            </MenuItem>
            <MenuItem onClick={handleVideoClick}>
              <Box className="text-sm font-bold tracking-tight">
                GO TO VIDEO
              </Box>
            </MenuItem>
          </Menu>
        )}
      </Box>
      {/* Refactored YouTube player container for responsiveness */}
      <Box className="relative aspect-video w-full overflow-hidden rounded-md">
        {!isLoading && (
          <YouTube
            opts={{
              // Set width and height to 100% to fill the parent container
              width: "100%",
              height: "100%",
              playerVars: {
                end: preview.play.end_time,
                enablejsapi: 1,
                playsinline: 1,
                disablekb: 1,
                // Keep `controls: 0` to hide native controls and prevent seeking
                controls: 0,
                rel: 0,
                origin: `https://www.youtube.com`,
              },
            }}
            onReady={videoOnReady}
            onStateChange={onPlayerStateChange}
            id="player"
            videoId={preview.video.link.split("v=")[1]?.split("&")[0]}
            // Apply absolute positioning and full size to fill the relative parent
            className="absolute left-0 top-0 h-full w-full"
          />
        )}
      </Box>
      {isLoading && <PageTitle size="small" title="Loading..." />}
      {isMobile && (
        <Box className="-my-1 flex flex-wrap p-2 text-sm md:text-base">
          {preview.play.title}
        </Box>
      )}
      <Box sx={{ display: "flex", width: "100%", alignItems: "center" }}>
        <PlayPreviewMentions play={preview} />
        <PlayPreviewTags play={preview} />
      </Box>
      <Box className="flex w-full items-center gap-3 px-1">
        <Box className="flex items-center justify-center gap-2">
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
        </Box>
      </Box>
      {isExpanded && (
        <Box className="mt-2">
          <ExpandedPlay
            play={preview}
            commentCount={commentCount}
            setCommentCount={setCommentCount}
          />
        </Box>
      )}
    </Box>
  );
};

export default PlayPreview;
