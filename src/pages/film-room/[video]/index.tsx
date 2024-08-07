import { Divider } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Youtube, { type YouTubeEvent, type YouTubePlayer } from "react-youtube";
import CreatePlay from "~/components/plays/create-play";
import Team from "~/components/teams/team";
import PageTitle from "~/components/utils/page-title";
import VideoPlayIndex from "~/components/videos/video-play-index";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { PlayPreviewType, TeamType, VideoType } from "~/utils/types";

const FilmRoom = () => {
  const router = useRouter();
  const { screenWidth } = useMobileContext();
  const { user } = useAuthContext();
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

  const [isNewPlayOpen, setIsNewPlayOpen] = useState<boolean>(false);

  const fetchVideo = async () => {
    const { data } = await supabase
      .from("videos")
      .select(`*`)
      .eq("id", videoId)
      .single();
    if (data) setVideo(data);
  };

  const fetchAffiliatedTeams = async () => {
    const { data } = await supabase
      .from("team_video_view")
      .select("team")
      .eq("video->>id", videoId);
    if (data) setAffiliatedTeams(data.map((tm) => tm.team));
  };

  const fetchActivePlay = async () => {
    if (playParam && user.isLoggedIn) {
      const { data } = await supabase
        .from("play_preview")
        .select(`*`, {
          count: "exact",
        })
        .eq("play->>id", playParam)
        .single();
      if (data) setActivePlay(data);
    }
  };

  const videoOnReady = async (e: YouTubeEvent) => {
    const video = e.target;
    setPlayer(video);
    const time = Number(startParam);
    if (time) {
      void video.seekTo(time, true);
    }
  };

  const scrollToPlayer = () => {
    if (playerRef) playerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (router.query.video) {
      void fetchVideo();
      void fetchAffiliatedTeams();
      void fetchActivePlay();
    }
  }, [router.query.video, playParam]);

  useEffect(() => {
    const time = Number(startParam);
    if (time && player) void player.seekTo(time, true);
  }, [startParam]);

  return (
    video && (
      <div className="flex w-full flex-col items-center justify-center gap-2 p-4">
        <div className="flex flex-col items-center justify-center gap-1 text-center">
          <div
            className={`${
              isDark ? "text-grey-400" : "text-grey-600"
            } text-lg font-bold leading-4 lg:text-2xl`}
          >
            {video.season} -{" "}
            {video.week
              ? video.week.toLocaleUpperCase()
              : video.tournament
                ? video.tournament.toLocaleUpperCase()
                : null}
          </div>
          <PageTitle title={video.title} size="large" />
          <div className="mt-2 flex flex-wrap gap-2">
            {affiliatedTeams?.map((tm) => <Team team={tm} small={true} />)}
          </div>
        </div>
        <Divider flexItem variant="middle" sx={{ marginTop: "8px" }} />
        <CreatePlay
          player={player}
          video={video}
          isNewPlayOpen={isNewPlayOpen}
          setIsNewPlayOpen={setIsNewPlayOpen}
        />
        {video.link && (
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
        <VideoPlayIndex
          player={player}
          videoId={video.id}
          scrollToPlayer={scrollToPlayer}
          setActivePlay={setActivePlay}
          activePlay={activePlay}
        />
      </div>
    )
  );
};

export default FilmRoom;
