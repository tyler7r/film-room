import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from "@mui/material";
import type { SearchOptions } from "~/pages/film-room";
import { divisions, recentYears } from "~/utils/helpers";

type VideoSearchFilterProps = {
  searchOptions: SearchOptions;
  setSearchOptions: (options: SearchOptions) => void;
};

const VideoSearchFilters = ({
  searchOptions,
  setSearchOptions,
}: VideoSearchFilterProps) => {
  const handleChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setSearchOptions({ ...searchOptions, [name]: value });
  };

  return (
    <div className="mb-4 flex w-4/5 gap-2">
      <FormControl className="w-full">
        <InputLabel>Search by division...</InputLabel>
        <Select
          value={searchOptions.division}
          onChange={handleChange}
          label="Search by division..."
          name="division"
          autoWidth
        >
          <MenuItem value="">No Filter</MenuItem>
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
        >
          <MenuItem value="">No Filter</MenuItem>
          {recentYears.map((yr) => (
            <MenuItem key={yr} value={yr}>
              {yr}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default VideoSearchFilters;
