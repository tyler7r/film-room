import { useState } from "react";
import YouTube, { type YouTubeEvent, type YouTubePlayer } from "react-youtube";
import { useMobileContext } from "~/contexts/mobile";
import type { PlayPreviewType, RealMentionType } from "~/utils/types";

type PlayPreviewProps = {
  play: PlayPreviewType | RealMentionType;
};

const PlayPreview = ({ play }: PlayPreviewProps) => {
  const { screenWidth, isMobile } = useMobileContext();

  const [player, setPlayer] = useState<YouTubePlayer | null>(null);

  const videoOnReady = async (e: YouTubeEvent) => {
    const video = e.target;
    setPlayer(video);
    void video.cueVideoById({
      videoId: `${play.link.split("v=")[1]?.split("&")[0]}`,
      startSeconds: play.start_time,
      endSeconds: play.end_time,
    });
  };

  const onPlayerStateChange = (e: YouTubeEvent) => {
    if (e.data == YT.PlayerState.ENDED) {
      void restartPreview();
    }
  };

  const restartPreview = () => {
    void player?.seekTo(play.start_time, true);
    void player?.pauseVideo();
  };

  return (
    <YouTube
      opts={{
        width: `${isMobile ? screenWidth * 0.9 : 640}`,
        height: `${isMobile ? (screenWidth * 0.9) / 1.778 : 390}`,
        playerVars: {
          controls: 0,
          enablejsapi: 1,
          playsinline: 1,
          fs: 1,
          rel: 0,
          color: "red",
          origin: "https://www.youtube.com",
        },
      }}
      onReady={videoOnReady}
      onStateChange={onPlayerStateChange}
      id="player"
      videoId={play.link.split("v=")[1]?.split("&")[0]}
    />
  );
};

export default PlayPreview;
