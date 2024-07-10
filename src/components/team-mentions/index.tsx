import { Autocomplete, TextField } from "@mui/material";
import { SyntheticEvent } from "react";
import type { TeamType } from "~/utils/types";

type TeamVideosProps = {
  mentions: TeamType[] | null;
  setMentions: (mentions: TeamType[] | null) => void;
  teams: TeamType[] | null;
};

const TeamMentions = ({ setMentions, teams }: TeamVideosProps) => {
  const handleChange = (
    event: SyntheticEvent<Element, Event>,
    newValue: TeamType[],
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setMentions(newValue);
    if (newValue.length === 0) {
      setMentions(null);
    }
  };

  return (
    teams && (
      <Autocomplete
        className="w-full"
        id="teams-mentions"
        onChange={(event, newValue) => handleChange(event, newValue)}
        options={teams}
        getOptionLabel={(option) => `${option.full_name} (${option.division})`}
        filterSelectedOptions
        multiple
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
