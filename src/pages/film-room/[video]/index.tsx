import { Divider } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Youtube, { type YouTubeEvent, type YouTubePlayer } from "react-youtube";
import PlayIndex from "~/components/play-index";
import PlayModal from "~/components/play-modal";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { supabase } from "~/utils/supabase";
import type { IndexPlayType, VideoType } from "~/utils/types";

const FilmRoom = () => {
  const router = useRouter();
  const { screenWidth } = useMobileContext();
  const { user } = useAuthContext();
  const playParam = useSearchParams().get("play") ?? null;
  const startParam = useSearchParams().get("start") ?? null;

  const [video, setVideo] = useState<VideoType | null>(null);

  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [activePlay, setActivePlay] = useState<IndexPlayType | null>(null);

  const [isPlayModalOpen, setIsPlayModalOpen] = useState<boolean>(false);

  const fetchVideo = async () => {
    const { data } = await supabase
      .from("videos")
      .select(`*`)
      .eq("id", router.query.video as string)
      .single();
    if (data) setVideo(data);
  };

  const fetchActivePlay = async () => {
    if (playParam && user.isLoggedIn) {
      const { data } = await supabase
        .from("plays")
        .select(`*, mentions:play_mentions (receiver_name), tags(title)`, {
          count: "exact",
        })
        .eq("id", playParam)
        .single();
      if (data) setActivePlay(data);
    }
  };

  const videoOnReady = async (e: YouTubeEvent) => {
    const video = e.target;
    setPlayer(video);
    const duration = await video.getDuration();
    setVideoDuration(duration);
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
      void fetchActivePlay();
    }
  }, [router.query.video, playParam]);

  useEffect(() => {
    const time = Number(startParam);
    if (time && player) void player.seekTo(time, true);
  }, [startParam]);

  return (
    video && (
      <div className="m-4 flex w-full flex-col items-center justify-center gap-2">
        <div className="flex flex-col items-center justify-center gap-1 text-center">
          <div className="text-xl leading-5 tracking-wider">
            {video.season} {video.tournament}
          </div>
          <div className="text-4xl font-bold tracking-tight lg:text-5xl">
            {video.title}
          </div>
        </div>
        <Divider
          flexItem
          variant="middle"
          sx={{ marginLeft: "8px", marginRight: "8px", marginTop: "4px" }}
        ></Divider>
        <PlayModal
          player={player}
          video={video}
          isPlayModalOpen={isPlayModalOpen}
          setIsPlayModalOpen={setIsPlayModalOpen}
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
        <PlayIndex
          player={player}
          videoId={video.id}
          scrollToPlayer={scrollToPlayer}
          duration={videoDuration}
          setActivePlay={setActivePlay}
          activePlay={activePlay}
        />
      </div>
    )
  );
};

export default FilmRoom;
