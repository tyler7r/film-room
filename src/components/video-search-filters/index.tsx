import SearchIcon from "@mui/icons-material/Search";
import {
  Checkbox,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  type SelectChangeEvent,
} from "@mui/material";
import type { SearchOptions } from "~/pages/film-room";
import { divisions, recentYears } from "~/utils/helpers";

type VideoSearchFilterProps = {
  searchOptions: SearchOptions;
  setSearchOptions: (options: SearchOptions) => void;
  setPage: (page: number) => void;
};

const VideoSearchFilters = ({
  searchOptions,
  setSearchOptions,
  setPage,
}: VideoSearchFilterProps) => {
  const handleChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setPage(1);
    setSearchOptions({ ...searchOptions, [name]: value });
  };

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchOptions({ ...searchOptions, title: value });
  };

  return (
    <div className="flex w-4/5 flex-col items-center justify-center gap-2">
      <div className="relative mb-4 flex w-4/5 flex-1 flex-shrink-0">
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
          placeholder="Search videos by title..."
          name="search"
          autoComplete="search"
          id="search"
          onChange={changeHandler}
          value={searchOptions.title}
        />
      </div>
      <div className="flex w-full gap-2">
        <FormControl className="w-full">
          <InputLabel>Search by division...</InputLabel>
          <Select
            value={searchOptions.division}
            onChange={handleChange}
            label="Search by division..."
            name="division"
            autoWidth
            id="division"
          >
            <MenuItem value="">All Divisions</MenuItem>
            {divisions.map((div) => (
              <MenuItem key={div} value={div}>
                {div}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl className="w-full">
          <InputLabel>Search by year...</InputLabel>
          <Select
            value={searchOptions.season}
            onChange={handleChange}
            label="Search by year..."
            name="season"
            autoWidth
            id="season"
          >
            <MenuItem value="">All Years</MenuItem>
            {recentYears.map((yr) => (
              <MenuItem key={yr} value={yr}>
                {yr}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <div className="flex items-center justify-center">
        <div className="text-xl font-bold tracking-tight">
          Private videos only?
        </div>
        <Checkbox
          id="private-only"
          checked={searchOptions.privateOnly}
          onChange={() => {
            setPage(1);
            setSearchOptions({
              ...searchOptions,
              privateOnly: !searchOptions.privateOnly,
            });
          }}
          size="medium"
          name="private-only"
        />
      </div>
    </div>
  );
};

export default VideoSearchFilters;
