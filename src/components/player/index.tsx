import { Typography, colors } from "@mui/material";
import { useIsDarkContext } from "~/pages/_app";
import { RosterType } from "../roster";

type PlayerProps = {
  player: RosterType;
};

const Player = ({ player }: PlayerProps) => {
  const { isDark } = useIsDarkContext();
  return (
    <div
      key={player.id}
      style={{
        backgroundColor: `${isDark ? colors.grey[900] : colors.grey[100]}`,
      }}
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
