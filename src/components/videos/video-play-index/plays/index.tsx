import type { YouTubePlayer } from "react-youtube";
import Play from "~/components/plays/play";
import EmptyMessage from "~/components/utils/empty-msg";
import type { PlayPreviewType } from "~/utils/types";
import type { PlaySearchOptions } from "..";

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
}: PlaysProps) => {
  return plays && plays.length > 0 ? (
    <div className="grid w-11/12 grid-cols-1 justify-center gap-2">
      {plays.map((play) => (
        <Play
          setActivePlay={setActivePlay}
          key={play.play.id}
          scrollToPlayer={scrollToPlayer}
          play={play}
          player={player}
          setSearchOptions={setSearchOptions}
          searchOptions={searchOptions}
        />
      ))}
    </div>
  ) : (
    <EmptyMessage message="plays" size="medium" />
  );
};

export default Plays;
