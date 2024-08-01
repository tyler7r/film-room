import { Autocomplete, TextField } from "@mui/material";
import type { SyntheticEvent } from "react";
import { type PlayerType } from "~/utils/types";
import User from "../user";

type PlayMentionsProps = {
  setMentions: (mentions: PlayerType[]) => void;
  players: PlayerType[] | null;
};

const PlayMentions = ({ setMentions, players }: PlayMentionsProps) => {
  const handleChange = (
    event: SyntheticEvent<Element, Event>,
    newValue: PlayerType[],
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setMentions(newValue);
  };

  return (
    players && (
      <div className="w-full">
        <Autocomplete
          id="mentions"
          onChange={(event, newValue) => handleChange(event, newValue)}
          options={players}
          getOptionLabel={(option) => `${option.profile.name}`}
          renderOption={(props, option) => (
            <li {...props} key={option.profile.id}>
              <User
                key={option.profile.id}
                user={{
                  email: option.profile.email,
                  id: option.profile.id,
                  last_watched: null,
                  last_watched_time: null,
                  name: option.profile.name,
                  join_date: option.profile.join_date,
                }}
                goToProfile={false}
                small={true}
                listItem={true}
              />
            </li>
          )}
          filterSelectedOptions
          multiple
          renderInput={(params) => (
            <TextField
              {...params}
              label="Player Mentions"
              placeholder="Mentions..."
              id="player-mentions"
              name="player-mentions"
            />
          )}
          limitTags={3}
        />
      </div>
    )
  );
};

export default PlayMentions;
