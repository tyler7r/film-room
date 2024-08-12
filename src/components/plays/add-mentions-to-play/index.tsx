import { Autocomplete, TextField } from "@mui/material";
import type { SyntheticEvent } from "react";
import User from "~/components/user";
import type { UserType } from "~/utils/types";

type AddMentionsToPlayProps = {
  mentions: UserType[];
  setMentions: (mentions: UserType[]) => void;
  players: UserType[] | null;
};

const AddMentionsToPlayProps = ({
  mentions,
  setMentions,
  players,
}: AddMentionsToPlayProps) => {
  const handleChange = (
    event: SyntheticEvent<Element, Event>,
    newValue: UserType[],
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (newValue.length === 0) {
      setMentions([]);
    } else setMentions(newValue);
  };

  return (
    players && (
      <div className="w-full">
        <Autocomplete
          id="mentions"
          onChange={(event, newValue) => handleChange(event, newValue)}
          options={players}
          getOptionLabel={(option) => `${option.name}`}
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              <User
                key={option.id}
                user={option}
                goToProfile={false}
                small={true}
                listItem={true}
              />
            </li>
          )}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          value={mentions}
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

export default AddMentionsToPlayProps;
