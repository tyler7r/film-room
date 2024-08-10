import { Autocomplete, TextField } from "@mui/material";
import { type SyntheticEvent } from "react";
import type { TeamType } from "~/utils/types";

type TeamVideosProps = {
  mentions: TeamType[];
  setMentions: (mentions: TeamType[]) => void;
  teams: TeamType[] | null;
};

const TeamMentions = ({ setMentions, teams, mentions }: TeamVideosProps) => {
  const handleChange = (
    newValue: TeamType[],
    event: SyntheticEvent<Element, Event>,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (newValue.length === 0) {
      setMentions([]);
    } else {
      setMentions(newValue);
    }
  };

  return (
    teams && (
      <Autocomplete
        className="w-full"
        id="teams-mentions"
        onChange={(event, newValue) => handleChange(newValue, event)}
        options={teams}
        getOptionLabel={(option) => `${option.full_name} (${option.division})`}
        filterSelectedOptions
        multiple
        isOptionEqualToValue={(option, value) => option.id === value.id}
        value={mentions}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Team Mentions"
            id="teams"
            name="teams"
          />
        )}
        limitTags={3}
      />
    )
  );
};

export default TeamMentions;
