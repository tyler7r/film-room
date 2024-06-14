import type { YouTubePlayer } from "react-youtube";
import type { PlayType } from "~/utils/types";
import type { PlaySearchOptions } from "..";
import Play from "../play";

type PlaysProps = {
  plays: PlayType[] | null;
  player: YouTubePlayer | null;
  scrollToPlayer: () => void;
  setActivePlay: (play: PlayType) => void;
  searchOptions: PlaySearchOptions;
  setSearchOptions: (options: PlaySearchOptions) => void;
  setIsFiltersOpen: (isFiltersOpen: boolean) => void;
  videoId: string;
};

const Plays = ({
  setActivePlay,
  plays,
  player,
  scrollToPlayer,
  searchOptions,
  setSearchOptions,
  setIsFiltersOpen,
  videoId,
}: PlaysProps) => {
  return plays && plays.length > 0 ? (
    <div className="grid w-11/12 grid-cols-1 justify-center gap-4">
      {plays.map((play) => (
        <Play
          setActivePlay={setActivePlay}
          key={play.id}
          scrollToPlayer={scrollToPlayer}
          play={play}
          player={player}
          setSearchOptions={setSearchOptions}
          searchOptions={searchOptions}
          setIsFiltersOpen={setIsFiltersOpen}
          videoId={videoId}
        />
      ))}
    </div>
  ) : (
    <div className="text-center text-2xl font-bold tracking-tight">
      Play directory is empty!
    </div>
  );
};

export default Plays;
