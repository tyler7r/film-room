import type { YouTubePlayer } from "react-youtube";
import EmptyMessage from "~/components/empty-msg";
import type { PlayPreviewType } from "~/utils/types";
import type { PlaySearchOptions } from "..";
import IndexPlay from "../index-play";

type PlaysProps = {
  plays: PlayPreviewType[] | null;
  player: YouTubePlayer | null;
  scrollToPlayer: () => void;
  setActivePlay: (play: PlayPreviewType) => void;
  searchOptions: PlaySearchOptions;
  setSearchOptions: (options: PlaySearchOptions) => void;
  videoId: string;
};

const Plays = ({
  setActivePlay,
  plays,
  player,
  scrollToPlayer,
  searchOptions,
  setSearchOptions,
  videoId,
}: PlaysProps) => {
  return plays && plays.length > 0 ? (
    <div className="grid grid-cols-1 justify-center gap-6">
      {plays.map((play) => (
        <IndexPlay
          setActivePlay={setActivePlay}
          key={play.play.id}
          scrollToPlayer={scrollToPlayer}
          play={play}
          player={player}
          setSearchOptions={setSearchOptions}
          searchOptions={searchOptions}
          videoId={videoId}
        />
      ))}
    </div>
  ) : (
    <EmptyMessage message="plays" size="medium" />
  );
};

export default Plays;
