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
import type { TeamMentionType } from "~/utils/types";

type TeamVideosProps = {
  mentions: string[];
  setMentions: (mentions: string[]) => void;
  teams: TeamMentionType | null;
};

const TeamMentions = ({ mentions, setMentions, teams }: TeamVideosProps) => {
  const handleChange = (event: SelectChangeEvent<typeof mentions>) => {
    const {
      target: { value },
    } = event;
    setMentions(typeof value === "string" ? value.split(",") : value);
  };

  return (
    mentions && (
      <div className="w-full">
        <FormControl className="w-full text-start">
          <InputLabel>Team Mentions</InputLabel>
          <Select
            multiple
            value={mentions}
            onChange={handleChange}
            input={<OutlinedInput label="Player Mentions" />}
            renderValue={(selected) => selected.join(", ")}
            multiline={true}
          >
            {teams?.map(
              (team) =>
                team.full_name && (
                  <MenuItem key={team.id} value={team.full_name}>
                    <Checkbox checked={mentions.indexOf(team.full_name) > -1} />
                    <ListItemText primary={team.full_name} />
                  </MenuItem>
                ),
            )}
          </Select>
        </FormControl>
      </div>
    )
  );
};

export default TeamMentions;
