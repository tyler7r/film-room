import { Typography } from "@mui/material";
import { useIsDarkContext } from "~/pages/_app";
import { RosterType } from "../roster";

type PlayerProps = {
  player: RosterType;
};

const Player = ({ player }: PlayerProps) => {
  const { backgroundStyle } = useIsDarkContext();
  return (
    <div
      key={player.id}
      style={backgroundStyle}
      className="flex items-center justify-around gap-2 rounded-lg p-2"
    >
      <Typography fontSize={18}>{player.name}</Typography>
      {player.num && (
        <Typography variant="overline" fontSize={14} fontWeight="bold">
          #{player.num}
        </Typography>
      )}
    </div>
  );
};

export default Player;
