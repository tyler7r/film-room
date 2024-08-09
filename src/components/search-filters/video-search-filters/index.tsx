import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import {
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  type SelectChangeEvent,
} from "@mui/material";
import TeamLogo from "~/components/teams/team-logo";
import { useAuthContext } from "~/contexts/auth";
import type { SearchOptions } from "~/pages/film-room";

type VideoSearchFilterProps = {
  searchOptions: SearchOptions;
  setSearchOptions: (options: SearchOptions) => void;
};

const VideoSearchFilters = ({
  searchOptions,
  setSearchOptions,
}: VideoSearchFilterProps) => {
  const { affiliations } = useAuthContext();

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchOptions({ ...searchOptions, [name]: value });
  };

  const handlePrivacyStatus = (e: SelectChangeEvent) => {
    const status = e.target.value;
    if (status === "all" || status === "") {
      setSearchOptions({ ...searchOptions, privateOnly: "all" });
    } else {
      setSearchOptions({ ...searchOptions, privateOnly: status });
    }
  };

  const clearSearch = () => {
    setSearchOptions({ ...searchOptions, topic: "" });
  };

  return (
    <div className="flex w-full flex-col items-center justify-center gap-2">
      <div className="flex w-full gap-2 p-2">
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
            endAdornment: (
              <IconButton size="small" color="primary" onClick={clearSearch}>
                <ClearIcon fontSize="small" />
              </IconButton>
            ),
          }}
          className="w-full"
          placeholder="Search videos by title, season, division, or tournament"
          name="topic"
          autoComplete="topic"
          id="topic"
          onChange={changeHandler}
          value={searchOptions.topic}
        />
        {affiliations && (
          <FormControl className="w-full">
            <InputLabel>Videos by Team</InputLabel>
            <Select
              value={searchOptions.privateOnly}
              onChange={handlePrivacyStatus}
              label="Privacy Status"
              name="privacy"
              id="privacy-status"
              className="w-full"
            >
              <MenuItem value="all" style={{ fontSize: "12px" }}>
                All Videos
              </MenuItem>
              {affiliations?.map((div) => (
                <MenuItem key={div.team.id} value={div.team.id}>
                  <div className="flex gap-2">
                    <div className="text-sm">
                      Videos private to:{" "}
                      <strong className="tracking-tigt">
                        {div.team.full_name}
                      </strong>
                    </div>
                    {div.team.logo && <TeamLogo tm={div.team} size={25} />}
                  </div>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </div>
    </div>
  );
};

export default VideoSearchFilters;
