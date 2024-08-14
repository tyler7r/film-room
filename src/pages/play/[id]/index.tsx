import LinkIcon from "@mui/icons-material/Link";
import ShortcutIcon from "@mui/icons-material/Shortcut";
import StarIcon from "@mui/icons-material/Star";
import { Divider, IconButton } from "@mui/material";
import type { GetServerSidePropsContext } from "next";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import YouTube, { type YouTubeEvent, type YouTubePlayer } from "react-youtube";
import { createClient } from "utils/supabase/server-props";
import CommentBtn from "~/components/interactions/comments/comment-btn";
import LikeBtn from "~/components/interactions/likes/like-btn";
import ExpandedPlay from "~/components/plays/expanded-play";
import PlayActionsMenu from "~/components/plays/play-actions-menu";
import PlayMentions from "~/components/plays/play-mentions";
import PlayTags from "~/components/plays/play-tags";
import TeamLogo from "~/components/teams/team-logo";
import PageTitle from "~/components/utils/page-title";
import StandardPopover from "~/components/utils/standard-popover";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { useIsDarkContext } from "~/pages/_app";
import { convertTimestamp } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { PlayPreviewType } from "~/utils/types";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createClient(context);
  const playId = context.query.id as string;

  const { data, error } = await supabase
    .from("play_preview")
    .select()
    .eq("play->>id", playId)
    .single();

  if (!data || error) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      preview: data,
    },
  };
}

const Play = ({ preview }: { preview: PlayPreviewType }) => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { isMobile, fullScreen, screenWidth } = useMobileContext();
  const { hoverText } = useIsDarkContext();
  const searchParams = useSearchParams();

  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [commentCount, setCommentCount] = useState<number>(0);
  const [anchorEl, setAnchorEl] = useState<{
    anchor1: HTMLElement | null;
    anchor2: HTMLElement | null;
    anchor3: HTMLElement | null;
    anchor4: HTMLElement | null;
  }>({ anchor1: null, anchor2: null, anchor3: null, anchor4: null });
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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

  const videoOnReady = (e: YouTubeEvent) => {
    const video = e.target;
    setPlayer(video);
    void video.cueVideoById({
      videoId: `${preview.video.link.split("v=")[1]?.split("&")[0]}`,
      startSeconds: preview.play.start_time,
      endSeconds: preview.play.end_time,
    });
    setIsLoading(false);
  };

  const onPlayerStateChange = (e: YouTubeEvent) => {
    if (e.data == YT.PlayerState.ENDED) {
      void restartPreview();
    }
  };

  const restartPreview = () => {
    void player?.seekTo(preview?.play.start_time, true);
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

  const copyToClipboard = () => {
    void navigator.clipboard.writeText(window.location.toString());
    setIsCopied(true);
  };

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  }, []);

  return (
    <div className="flex items-center justify-center p-4">
      <div
        className="flex flex-col items-center justify-center gap-2 rounded-md"
        style={{
          width: `${
            isMobile ? "480px" : fullScreen ? `${screenWidth * 0.8}px` : "640px"
          }`,
        }}
      >
        <div className="flex w-full items-center justify-between gap-2 p-2">
          <div className="flex items-center gap-2">
            {preview.team && (
              <IconButton
                size="small"
                onClick={() =>
                  void router.push(`/team-hub/${preview.team?.id}`)
                }
                onMouseEnter={(e) => handlePopoverOpen(e, 2)}
                onMouseLeave={handlePopoverClose}
              >
                <TeamLogo tm={preview.team} size={35} inactive={true} />
                <StandardPopover
                  open={open2}
                  anchorEl={anchorEl.anchor2}
                  content={`Play is private to ${preview.team.full_name}`}
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
              className={`text-center text-xl font-bold tracking-tighter ${hoverText}`}
              onClick={() =>
                void router.push(`/profile/${preview.play.author_id}`)
              }
            >
              {preview.play.author_name}
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
            <PlayActionsMenu preview={preview} />
            <IconButton
              onClick={copyToClipboard}
              onMouseEnter={(e) => handlePopoverOpen(e, 4)}
              onMouseLeave={handlePopoverClose}
            >
              <LinkIcon fontSize="large" />
              <StandardPopover
                open={open4}
                anchorEl={anchorEl.anchor4}
                content={isCopied ? "Copied!" : `Copy link to clipboard`}
                handlePopoverClose={handlePopoverClose}
              />
            </IconButton>
            <IconButton
              onMouseEnter={(e) => handlePopoverOpen(e, 1)}
              onMouseLeave={handlePopoverClose}
              onClick={handleVideoClick}
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
        {!isLoading ? (
          <YouTube
            opts={{
              width: `${isMobile ? 475 : fullScreen ? screenWidth * 0.8 : 640}`,
              height: `${
                isMobile ? 295 : fullScreen ? (screenWidth * 0.8) / 1.778 : 395
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
        <PlayMentions play={preview} />
        <PlayTags play={preview} />
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
          <ExpandedPlay play={preview} setCommentCount={setCommentCount} />
        </div>
      </div>
    </div>
  );
};

export default Play;
