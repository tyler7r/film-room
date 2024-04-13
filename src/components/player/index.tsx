import { Typography } from "@mui/material";
import { useIsDarkContext } from "~/pages/_app";
import { PlayerType } from "~/utils/types";

type PlayerProps = {
  player: PlayerType;
};

const Player = ({ player }: PlayerProps) => {
  const { backgroundStyle } = useIsDarkContext();
  return (
    <div
      style={backgroundStyle}
      className="flex items-center justify-around gap-2 rounded-lg p-2"
    >
      <Typography fontSize={18}>{player.name}</Typography>
      {player.number && (
        <Typography variant="overline" fontSize={14} fontWeight="bold">
          #{player.number}
        </Typography>
      )}
    </div>
  );
};

export default Player;
