import {
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  type SelectChangeEvent,
} from "@mui/material";
import { type PlayerType } from "~/pages/film-room/[game]";

type MentionsProps = {
  mentions: string[];
  setMentions: (mentions: string[]) => void;
  players: PlayerType | null;
};

// type IndividualPlayer = {
//   user_id: string;
//   profiles: { name: string };
// };

const Mentions = ({ mentions, setMentions, players }: MentionsProps) => {
  const handleChange = (event: SelectChangeEvent<typeof mentions>) => {
    console.log(mentions);
    const {
      target: { value },
    } = event;
    setMentions(typeof value === "string" ? value.split(",") : value);
  };

  return (
    players && (
      <div className="w-4/5">
        <FormControl className="w-full ">
          <InputLabel>Player Mentions</InputLabel>
          <Select
            multiple
            value={mentions}
            onChange={handleChange}
            input={<OutlinedInput label="Player Mentions" />}
            renderValue={(selected) => selected.join(", ")}
            className=""
          >
            {players.map(
              (player) =>
                player.profiles?.name && (
                  <MenuItem key={player.user_id} value={player.profiles.name}>
                    <Checkbox
                      checked={mentions.indexOf(player.profiles.name) > -1}
                    />
                    <ListItemText primary={player.profiles.name} />
                  </MenuItem>
                ),
            )}
          </Select>
        </FormControl>
      </div>
    )
  );
};

export default Mentions;
