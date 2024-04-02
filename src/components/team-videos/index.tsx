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
import { TeamMentionType } from "~/utils/types";

type TeamVideosProps = {
  teamMentions: string[];
  setTeamMentions: (teamMentions: string[]) => void;
  teams: TeamMentionType | null;
};

const TeamVideos = ({
  teamMentions,
  setTeamMentions,
  teams,
}: TeamVideosProps) => {
  const handleChange = (event: SelectChangeEvent<typeof teamMentions>) => {
    const {
      target: { value },
    } = event;
    setTeamMentions(typeof value === "string" ? value.split(",") : value);
  };

  return (
    teamMentions && (
      <div className="w-full">
        <FormControl className="w-full text-start">
          <InputLabel>Team Mentions</InputLabel>
          <Select
            multiple
            value={teamMentions}
            onChange={handleChange}
            input={<OutlinedInput label="Player Mentions" />}
            renderValue={(selected) => selected.join(", ")}
            multiline={true}
          >
            {teams?.map(
              (team) =>
                team.full_name && (
                  <MenuItem key={team.id} value={team.full_name}>
                    <Checkbox
                      checked={teamMentions.indexOf(team.full_name) > -1}
                    />
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

export default TeamVideos;
