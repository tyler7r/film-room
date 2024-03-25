import {
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from "@mui/material";
import { PlaySearchOptions } from "../play-index";

type PlaySearchFilterProps = {
  searchOptions: PlaySearchOptions;
  setSearchOptions: (options: PlaySearchOptions) => void;
};

const PlaySearchFilters = ({
  searchOptions,
  setSearchOptions,
}: PlaySearchFilterProps) => {
  const handleChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setSearchOptions({ ...searchOptions, [name]: value });
  };

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchOptions({ ...searchOptions, receiver_name: value });
  };

  return (
    <div className="mb-2 flex w-full flex-col items-center justify-center gap-2">
      <FormControl className="w-4/5">
        <InputLabel>Search by author role...</InputLabel>
        <Select
          value={searchOptions.role}
          onChange={handleChange}
          label="Search by author role..."
          name="role"
          autoWidth
        >
          <MenuItem value="">All Notes</MenuItem>
          <MenuItem value={"coach"}>Coach Notes</MenuItem>
          <MenuItem value={"player"}>Player Notes</MenuItem>
        </Select>
      </FormControl>
      {/* <div className="relative mb-4 flex w-4/5 flex-1 flex-shrink-0">
        <label htmlFor="search" className="sr-only">
          Search
        </label>
        <TextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          className="w-full"
          placeholder="Search mentions..."
          name="search"
          autoComplete="search"
          id="search"
          onChange={changeHandler}
          value={searchOptions.receiver_name}
        />
      </div> */}
      <div className="flex items-center justify-center">
        <div className="text-xl font-bold tracking-tight">Highlights only?</div>
        <Checkbox
          checked={searchOptions.only_highlights}
          onChange={() => {
            setSearchOptions({
              ...searchOptions,
              only_highlights: !searchOptions.only_highlights,
            });
          }}
          size="medium"
        />
      </div>
    </div>
  );
};

export default PlaySearchFilters;
