import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Button, Divider, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Youtube, { type YouTubeEvent, type YouTubePlayer } from "react-youtube";
import PlayIndex from "~/components/play-index";
import PlayModal from "~/components/play-modal";
import { useMobileContext } from "~/contexts/mobile";
import { supabase } from "~/utils/supabase";
import type { VideoType } from "~/utils/types";

const FilmRoom = () => {
  const router = useRouter();
  const { screenWidth } = useMobileContext();

  const [video, setVideo] = useState<VideoType | null>(null);

  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);

  const [isPlayModalOpen, setIsPlayModalOpen] = useState<boolean>(false);

  const [isPlayIndexOpen, setIsPlayIndexOpen] = useState<boolean>(false);

  const fetchVideo = async () => {
    const { data } = await supabase
      .from("videos")
      .select(`*`)
      .eq("id", router.query.video as string)
      .single();
    if (data) setVideo(data);
  };

  const videoOnReady = async (e: YouTubeEvent) => {
    const video = e.target;
    setPlayer(video);
    const duration = await video.getDuration();
    setVideoDuration(duration);
    const time = Number(router.query.time);
    if (time) {
      void video.seekTo(time, true);
    }
  };

  const scrollToPlayer = () => {
    if (playerRef) playerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (router.query.video) void fetchVideo();
    setIsPlayIndexOpen(false);
  }, [router.query.video]);

  return (
    video && (
      <div className="m-4 flex flex-col items-center justify-center gap-2">
        <div className="flex flex-col items-center justify-center gap-1 text-center">
          <Typography variant="h6" className="text-xl leading-5 tracking-wider">
            {video.season} {video.tournament}
          </Typography>
          <Typography className="text-4xl font-bold tracking-tight lg:text-5xl">
            {video.title}
          </Typography>
        </div>
        <Divider flexItem variant="middle" className="mx-4 mt-1"></Divider>
        <div className="flex items-center justify-center gap-4 text-center"></div>
        <PlayModal
          player={player}
          videoId={video.id}
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
        {isPlayIndexOpen ? (
          <div className="flex w-full flex-col items-center justify-center gap-4">
            <Button
              variant="text"
              onClick={() => setIsPlayIndexOpen(false)}
              endIcon={<ExpandLessIcon />}
              size="large"
            >
              Close Play Index
            </Button>
            <PlayIndex
              videoId={video.id}
              player={player}
              scrollToPlayer={scrollToPlayer}
              duration={videoDuration}
            />
          </div>
        ) : (
          <Button
            variant="text"
            onClick={() => setIsPlayIndexOpen(true)}
            endIcon={<ExpandMoreIcon />}
            size="large"
          >
            Open Play Index
          </Button>
        )}
      </div>
    )
  );
};

export default FilmRoom;
