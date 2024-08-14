import ShortcutIcon from "@mui/icons-material/Shortcut";
import StarIcon from "@mui/icons-material/Star";
import { Divider, IconButton } from "@mui/material";
import type { GetServerSidePropsContext } from "next";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useState } from "react";
import YouTube, { type YouTubeEvent, type YouTubePlayer } from "react-youtube";
import { createClient } from "utils/supabase/server-props";
import CommentBtn from "~/components/interactions/comments/comment-btn";
import LikeBtn from "~/components/interactions/likes/like-btn";
import ExpandedPlay from "~/components/plays/expanded-play";
import PlayActionsMenu from "~/components/plays/play-actions-menu";
import PlayMentions from "~/components/plays/play-mentions";
import PlayTags from "~/components/plays/play-tags";
import TeamLogo from "~/components/teams/team-logo";
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
  const { isMobile, fullScreen } = useMobileContext();
  const { hoverText } = useIsDarkContext();
  const searchParams = useSearchParams();

  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [commentCount, setCommentCount] = useState<number>(0);
  const [anchorEl, setAnchorEl] = useState<{
    anchor1: HTMLElement | null;
    anchor2: HTMLElement | null;
    anchor3: HTMLElement | null;
  }>({ anchor1: null, anchor2: null, anchor3: null });

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

  return (
    <div className="flex items-center justify-center p-4">
      <div
        className="flex flex-col rounded-md"
        style={{
          width: `${isMobile ? "480px" : fullScreen ? "800px" : "640px"}`,
        }}
      >
        <div className="flex items-center justify-between gap-2 p-2">
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
              origin: `http://www.inside-break.com`,
            },
          }}
          onReady={videoOnReady}
          onStateChange={onPlayerStateChange}
          id="player"
          videoId={preview.video.link.split("v=")[1]?.split("&")[0]}
        />
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
        <div className="mt-2">
          <ExpandedPlay play={preview} setCommentCount={setCommentCount} />
        </div>
      </div>
    </div>
  );
};

export default Play;
