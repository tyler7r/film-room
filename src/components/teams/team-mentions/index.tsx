import { Autocomplete, Box, TextField, Typography } from "@mui/material";
import { type SyntheticEvent } from "react";
import type { TeamType } from "~/utils/types";
import TeamLogo from "../team-logo";

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
        renderOption={(props, option) => (
          <li {...props} key={option.id}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Typography variant="body2">
                <Typography
                  component="span"
                  sx={{
                    fontWeight: "bold",
                    letterSpacing: "-0.025em",
                  }}
                >
                  {option.full_name}
                </Typography>
              </Typography>
              <TeamLogo tm={option} size={20} />
            </Box>
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Team Mentions"
            id="teams"
            name="teams"
          />
        )}
        size="small"
        limitTags={3}
      />
    )
  );
};

export default TeamMentions;
