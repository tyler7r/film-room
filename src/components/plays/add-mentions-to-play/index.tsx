import {
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import useDebounce from "~/utils/debounce"; // Import your hook
import { getDisplayName } from "~/utils/helpers";
import type { UserType } from "~/utils/types";

type AddMentionsProps = {
  mentions: UserType[];
  setMentions: (mentions: UserType[]) => void;
  searchPlayers: (query: string) => Promise<UserType[]>;
  isPrivateContext: boolean;
};

const AddMentionsToPlay = ({
  mentions,
  setMentions,
  searchPlayers,
  isPrivateContext,
}: AddMentionsProps) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Define the search logic
  const handleSearch = async (query: string) => {
    if (!isPrivateContext && query.trim().length < 2) {
      setOptions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const results = await searchPlayers(query);
      setOptions(results);
    } catch (error) {
      console.error("Error searching players:", error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  // Wrap the search logic with your custom useDebounce hook
  const debouncedSearch = useDebounce(handleSearch, 300);

  // Trigger the debounced search whenever inputValue changes
  useEffect(() => {
    if (!isPrivateContext && inputValue.trim().length < 2) {
      setOptions([]);
      return;
    }

    void debouncedSearch(inputValue);
  }, [inputValue, debouncedSearch, isPrivateContext]);

  // Dynamic text for no options
  const noOptionsText =
    inputValue.length < 2 && !isPrivateContext
      ? "Type at least 2 characters to search..."
      : "No players found";

  return (
    <Box sx={{ width: "100%" }}>
      <Autocomplete
        multiple
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        getOptionLabel={(option) => getDisplayName(option)}
        options={options}
        loading={loading}
        value={mentions}
        noOptionsText={noOptionsText}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        onChange={(event, newValue) => {
          setMentions(newValue);
        }}
        renderOption={(props, option) => {
          return (
            <li {...props} key={Math.random() * 10000000}>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography variant="body2" component={"div"}>
                  {getDisplayName(option)}{" "}
                  <Typography
                    color="textSecondary"
                    variant="subtitle2"
                    sx={{ fontSize: 11 }}
                  >
                    ({option.email})
                  </Typography>
                </Typography>
              </Box>
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Mention Players"
            size="small"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              label={getDisplayName(option)}
              {...getTagProps({ index })}
              key={option.id}
              size="small"
            />
          ))
        }
      />
    </Box>
  );
};

export default AddMentionsToPlay;
