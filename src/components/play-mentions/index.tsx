import { Autocomplete, TextField } from "@mui/material";
import type { SyntheticEvent } from "react";
import { type PlayerType } from "~/utils/types";

type MentionsProps = {
  setMentions: (mentions: PlayerType) => void;
  players: PlayerType | null;
};

const Mentions = ({ setMentions, players }: MentionsProps) => {
  const handleChange = (
    event: SyntheticEvent<Element, Event>,
    newValue: PlayerType,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setMentions(newValue);
  };

  return (
    players && (
      <div className="w-full">
        <Autocomplete
          onChange={(event, newValue) => handleChange(event, newValue)}
          options={players}
          getOptionLabel={(option) => `${option.name}`}
          filterSelectedOptions
          multiple
          renderInput={(params) => (
            <TextField
              {...params}
              label="Player Mentions"
              placeholder="Mentions..."
            />
          )}
          limitTags={3}
        />
      </div>
    )
  );
};

export default Mentions;
