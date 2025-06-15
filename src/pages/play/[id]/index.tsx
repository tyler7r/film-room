import LinkIcon from "@mui/icons-material/Link";
import ShortcutIcon from "@mui/icons-material/Shortcut";
import StarIcon from "@mui/icons-material/Star";
import { Box, Divider, IconButton } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import YouTube, { type YouTubeEvent, type YouTubePlayer } from "react-youtube";
import CommentBtn from "~/components/interactions/comments/comment-btn";
import LikeBtn from "~/components/interactions/likes/like-btn";
import ExpandedPlay from "~/components/plays/expanded-play";
import PlayActionsMenu from "~/components/plays/play-actions-menu";
import PlayPreviewMentions from "~/components/plays/play-mentions";
import PlayPreviewTags from "~/components/plays/play-tags";
import TeamLogo from "~/components/teams/team-logo";
import PageTitle from "~/components/utils/page-title";
import StandardPopover from "~/components/utils/standard-popover";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { useIsDarkContext } from "~/pages/_app";
import { convertTimestamp } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { PlayPreviewType } from "~/utils/types";

const Play = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { isMobile, fullScreen, screenWidth } = useMobileContext();
  const { hoverText } = useIsDarkContext();
  const searchParams = useSearchParams();
  const playId = router.query.id as string;

  const [preview, setPreview] = useState<PlayPreviewType | null>(null);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [commentCount, setCommentCount] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const activeComment = useSearchParams().get("comment") ?? undefined;

  const fetchPlay = async () => {
    const { data } = await supabase
      .from("play_preview")
      .select()
      .eq("play->>id", playId)
      .single();
    if (data) {
      setPreview(data);
      setIsLoading(false);
    } else setPreview(null);
  };

  const videoOnReady = (e: YouTubeEvent) => {
    const video = e.target;
    setPlayer(video);
    if (preview) {
      void video.cueVideoById({
        videoId: `${preview.video.link.split("v=")[1]?.split("&")[0]}`,
        startSeconds: preview.play.start_time,
        endSeconds: preview.play.end_time,
      });
      setIsLoading(false);
    }
  };

  const onPlayerStateChange = (e: YouTubeEvent) => {
    if (e.data == YT.PlayerState.ENDED) {
      void restartPreview();
    }
  };

  const restartPreview = () => {
    if (player && preview) {
      void player?.seekTo(preview?.play.start_time, true);
      void player?.pauseVideo();
    }
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
    if (preview) {
      const videoId = preview.video.id;
      const playId = preview.play.id;
      const playStart = preview.play.start_time;

      const params = new URLSearchParams(searchParams);
      params.set("play", playId);
      params.set("start", `${playStart}`);

      if (user.userId) void updateLastWatched(videoId, playStart);
      void router.push(`/film-room/${videoId}?${params.toString()}`);
    }
  };

  const copyToClipboard = () => {
    void navigator.clipboard.writeText(
      `${window.location.origin}/play/${playId}`,
    );
    setIsCopied(true);
  };

  useEffect(() => {
    setIsLoading(true);
    if (playId) {
      void fetchPlay();
    }
  }, [playId]);

  return (
    preview && (
      <div className="flex items-center justify-center p-4">
        <div
          className="flex flex-col items-center justify-center gap-2 rounded-md"
          style={{
            width: `${
              isMobile
                ? "480px"
                : fullScreen
                  ? `${screenWidth * 0.8}px`
                  : "640px"
            }`,
          }}
        >
          <div className="flex w-full items-center justify-between gap-2 p-2">
            <div className="flex items-center gap-2">
              {preview.team && (
                <StandardPopover
                  content={`Play is private to ${preview.team.full_name}`}
                  children={
                    <IconButton
                      size="small"
                      onClick={() =>
                        void router.push(`/team-hub/${preview.team?.id}`)
                      }
                    >
                      <TeamLogo tm={preview.team} size={35} inactive={true} />
                    </IconButton>
                  }
                />
              )}
              {preview.play.highlight && (
                <StandardPopover
                  content="Highlight!"
                  children={
                    <Box
                      sx={{
                        display: "flex",
                        cursor: "pointer",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <StarIcon color="secondary" fontSize="large" />
                    </Box>
                  }
                />
              )}
              <div
                className={`text-center text-xl font-bold tracking-tighter ${hoverText}`}
                onClick={() =>
                  void router.push(`/profile/${preview.play.author_id}`)
                }
              >
                {preview.author.name}
              </div>
              <Divider flexItem orientation="vertical" variant="middle" />
              <div className="flex flex-col items-center gap-2">
                <div className="text-sm leading-3 tracking-tight text-slate-600">
                  {convertTimestamp(preview.play.created_at)}
                </div>
                <div className="text-xs font-bold leading-3 tracking-tight">
                  ({preview.play.end_time - preview.play.start_time}s)
                </div>
              </div>
              <div className="flex-wrap p-2">{preview.play.title}</div>
            </div>
            <div className="flex items-center gap-1">
              <PlayActionsMenu
                preview={preview}
                onCopyLink={copyToClipboard}
                onGoToFilmRoom={handleVideoClick}
                onPlayClick={restartPreview}
              />
              <StandardPopover
                content={isCopied ? "Copied!" : `Copy link to clipboard`}
                children={
                  <IconButton onClick={copyToClipboard} size="small">
                    <LinkIcon fontSize="large" />
                  </IconButton>
                }
              />
              <StandardPopover
                content="Go to Video"
                children={
                  <IconButton onClick={handleVideoClick} size="small">
                    <ShortcutIcon fontSize="large" color="primary" />
                  </IconButton>
                }
              />
            </div>
          </div>
          {!isLoading ? (
            <YouTube
              opts={{
                width: `${
                  isMobile ? 475 : fullScreen ? screenWidth * 0.8 : 640
                }`,
                height: `${
                  isMobile
                    ? 295
                    : fullScreen
                      ? (screenWidth * 0.8) / 1.778
                      : 395
                }`,
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
          ) : (
            <PageTitle size="large" title="Loading Video..." />
          )}
          <div className="w-full">
            <PlayPreviewMentions play={preview} playId={playId} />
            <PlayPreviewTags play={preview} playId={playId} />
          </div>
          <div className="flex w-full items-center gap-3 px-1">
            <div className="flex items-center justify-center gap-2">
              <LikeBtn playId={preview.play.id} />
              <CommentBtn
                playId={preview.play.id}
                commentCount={commentCount}
                setCommentCount={setCommentCount}
                activePlay={null}
              />
            </div>
          </div>
          <div className="mt-2 w-full">
            <ExpandedPlay
              play={preview}
              setCommentCount={setCommentCount}
              activeComment={activeComment}
            />
          </div>
        </div>
      </div>
    )
  );
};

export default Play;
