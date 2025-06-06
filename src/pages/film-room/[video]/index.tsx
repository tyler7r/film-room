import AddIcon from "@mui/icons-material/Add";
import LinkIcon from "@mui/icons-material/Link";
import LockIcon from "@mui/icons-material/Lock";
import { Button, IconButton } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Youtube, { type YouTubeEvent, type YouTubePlayer } from "react-youtube";
import CreatePlay from "~/components/plays/create-play";
import Team from "~/components/teams/team";
import PageTitle from "~/components/utils/page-title";
import StandardPopover from "~/components/utils/standard-popover";
import VideoPlayIndex from "~/components/videos/video-play-index";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { PlayPreviewType, TeamType, VideoType } from "~/utils/types";

const FilmRoom = () => {
  const router = useRouter();
  const { user, affIds } = useAuthContext();
  const { screenWidth } = useMobileContext();
  const { isDark } = useIsDarkContext();
  const playParam = useSearchParams().get("play") ?? null;
  const startParam = useSearchParams().get("start") ?? null;
  const videoId = router.query.video as string;

  const [video, setVideo] = useState<VideoType | null>(null);
  const [affiliatedTeams, setAffiliatedTeams] = useState<TeamType[] | null>(
    null,
  );

  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const [activePlay, setActivePlay] = useState<PlayPreviewType | null>(null);
  const [seenActivePlay, setSeenActivePlay] = useState<boolean>(false);

  const [isNewPlayOpen, setIsNewPlayOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [accessDenied, setAccessDenied] = useState<boolean>(true);

  const handlePopoverOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setIsCopied(false);
  };

  const open = Boolean(anchorEl);

  const interval = useRef<NodeJS.Timeout | null>(null);

  const fetchVideo = async () => {
    const { data } = await supabase
      .from("videos")
      .select(`*`)
      .eq("id", videoId)
      .single();
    if (data) {
      setVideo(data);
      if (data.exclusive_to) {
        const accessAllowed = affIds?.includes(data.exclusive_to);
        if (!accessAllowed) {
          setAccessDenied(true);
        } else setAccessDenied(false);
      } else setAccessDenied(false);
    }
  };

  const fetchAffiliatedTeams = async () => {
    const { data } = await supabase
      .from("team_video_view")
      .select("team")
      .eq("video->>id", videoId);
    if (data) setAffiliatedTeams(data.map((tm) => tm.team));
  };

  const fetchActivePlay = async () => {
    if (playParam) {
      const { data } = await supabase
        .from("play_preview")
        .select(`*`, {
          count: "exact",
        })
        .eq("play->>id", playParam)
        .single();
      if (data) setActivePlay(data);
      else setActivePlay(null);
    }
  };

  const videoOnReady = async (e: YouTubeEvent) => {
    const video = e.target;
    setPlayer(video);
    const time = Number(startParam);
    if (time) {
      void video.seekTo(time, true);
      void video.playVideo();
    }
  };

  const scrollToPlayer = () => {
    if (playerRef) playerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getCurrentTime = async (player: YouTubePlayer) => {
    return Math.round(await player.getCurrentTime());
  };

  const checkTime = async () => {
    if (player && activePlay) {
      void getCurrentTime(player).then((currentTime) => {
        const endTime = activePlay.play.end_time;
        if (currentTime == endTime && interval.current && !seenActivePlay) {
          void player.pauseVideo();
          void clearInterval(interval.current);
          interval.current = null;
          setSeenActivePlay(true);
        } else if (currentTime !== endTime && !interval.current) {
          interval.current = setInterval(() => void checkTime(), 1000);
        } else if (currentTime == endTime && seenActivePlay) {
          void player.seekTo(activePlay.play.start_time, true);
          void player.pauseVideo();
          if (interval.current) {
            void clearInterval(interval.current);
            interval.current = null;
          }
        }
        return;
      });
    } else return;
  };

  const copyToClipboard = () => {
    void navigator.clipboard.writeText(window.location.toString());
    setIsCopied(true);
  };

  const handleNewTeamClick = () => {
    if (user.isLoggedIn) {
      void router.push("/team-select");
    } else {
      void router.push("/login");
    }
  };

  useEffect(() => {
    if (router.query.video) {
      void fetchVideo();
      void fetchAffiliatedTeams();
    }
  }, [router.query.video, affIds]);

  useEffect(() => {
    void fetchActivePlay();
  }, [playParam, player]);

  useEffect(() => {
    if (interval.current) {
      clearInterval(interval.current);
      interval.current = null;
    }
    if (activePlay && player) {
      void checkTime();
    }
  }, [activePlay, seenActivePlay]);

  useEffect(() => {
    const time = Number(startParam);
    if (time && player) void player.seekTo(time, true);
  }, [startParam]);

  useEffect(() => {
    return () => {
      if (interval.current) {
        clearInterval(interval.current);
        interval.current = null;
      }
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  }, []);

  return (
    video && (
      <div className="relative flex w-full flex-col items-center justify-center gap-2 p-4">
        <div className="flex flex-col items-center justify-center gap-1 text-center">
          <div className="flex items-center gap-1">
            <div
              className={`${
                isDark ? "text-grey-400" : "text-grey-600"
              } font-bold leading-4 tracking-tight lg:text-lg`}
            >
              {video.season} -{" "}
              {video.week
                ? video.week.toLocaleUpperCase()
                : video.tournament
                  ? video.tournament.toLocaleUpperCase()
                  : null}
            </div>
            <IconButton
              onClick={copyToClipboard}
              onMouseEnter={handlePopoverOpen}
              onMouseLeave={handlePopoverClose}
            >
              <LinkIcon />
              <StandardPopover
                open={open}
                anchorEl={anchorEl}
                content={isCopied ? "Copied!" : `Copy link to clipboard`}
                handlePopoverClose={handlePopoverClose}
              />
            </IconButton>
          </div>
          <PageTitle title={video.title} size="medium" />
          <div className="mt-2 flex flex-wrap gap-2">
            {affiliatedTeams?.map((tm) => (
              <Team team={tm} small={true} key={tm.id} />
            ))}
          </div>
        </div>
        {!accessDenied ? (
          <div className="relative flex w-full flex-col items-center justify-center gap-2 p-2">
            {video.link && !isLoading && (
              <div ref={playerRef}>
                <Youtube
                  opts={{
                    width: `${screenWidth * 0.8}`,
                    height: `${(screenWidth * 0.8) / 1.778}`,
                    playerVars: {
                      enablejsapi: 1,
                      playsinline: 1,
                      fs: 1,
                      rel: 0,
                      color: "red",
                      origin: "https://www.youtube.com",
                    },
                  }}
                  id="player"
                  videoId={video.link.split("v=")[1]?.split("&")[0]}
                  onReady={videoOnReady}
                />
              </div>
            )}
            <div className="fixed bottom-2 right-2">
              <CreatePlay
                player={player}
                video={video}
                isNewPlayOpen={isNewPlayOpen}
                setIsNewPlayOpen={setIsNewPlayOpen}
                scrollToPlayer={scrollToPlayer}
              />
            </div>
            {isLoading && <PageTitle size="large" title="Loading video..." />}
            <VideoPlayIndex
              player={player}
              videoId={video.id}
              scrollToPlayer={scrollToPlayer}
              setActivePlay={setActivePlay}
              activePlay={activePlay}
              setSeenActivePlay={setSeenActivePlay}
            />
          </div>
        ) : (
          <div className="flex w-full flex-col items-center justify-center gap-4 p-4">
            <LockIcon sx={{ fontSize: "96px" }} />
            <div className="text-lg font-bold">This video is private!</div>
            <Button
              variant="contained"
              endIcon={<AddIcon />}
              onClick={handleNewTeamClick}
            >
              Join a new team
            </Button>
          </div>
        )}
      </div>
    )
  );
};

export default FilmRoom;
