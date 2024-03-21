import {
  Checkbox,
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
    <div className="mb-2 flex w-4/5 flex-col items-center justify-center gap-2">
      <div className="flex w-full gap-2">
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
      <div className="flex items-center justify-center">
        <div className="text-xl font-bold tracking-tight">
          Private videos only?
        </div>
        <Checkbox
          checked={searchOptions.privateOnly}
          onChange={() => {
            setSearchOptions({
              ...searchOptions,
              privateOnly: !searchOptions.privateOnly,
            });
          }}
          size="medium"
        />
      </div>
    </div>
  );
};

export default VideoSearchFilters;
