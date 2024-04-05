import { Typography } from "@mui/material";
import type { YouTubePlayer } from "react-youtube";
import type { PlayIndexType, PlayType } from "~/utils/types";
import { PlaySearchOptions } from "..";
import Play from "../play";

type PlaysProps = {
  plays: PlayIndexType | null;
  player: YouTubePlayer | null;
  scrollToPlayer: () => void;
  setActivePlay: (play: PlayType) => void;
  searchOptions: PlaySearchOptions;
  setSearchOptions: (options: PlaySearchOptions) => void;
  setIsFiltersOpen: (isFiltersOpen: boolean) => void;
};

const Plays = ({
  setActivePlay,
  plays,
  player,
  scrollToPlayer,
  searchOptions,
  setSearchOptions,
  setIsFiltersOpen,
}: PlaysProps) => {
  return plays && plays.length > 0 ? (
    <div className="flex w-11/12 flex-col justify-center gap-4">
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
        />
      ))}
    </div>
  ) : (
    <Typography className="text-center text-2xl font-bold tracking-tight">
      Play directory is empty!
    </Typography>
  );
};

export default Plays;
