import { useState } from "react";
import YouTube, { YouTubeEvent, YouTubePlayer } from "react-youtube";
import { PlayPreviewType, RealMentionType } from "~/utils/types";

type PlayPreviewProps = {
  play: PlayPreviewType | RealMentionType;
};

const PlayPreview = ({ play }: PlayPreviewProps) => {
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
        playerVars: {
          controls: 0,
          enablejsapi: 1,
          playsinline: 1,
          fs: 1,
          rel: 0,
          color: "red",
          origin: "https://www.youtube.com",
          // start: start_time,
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
