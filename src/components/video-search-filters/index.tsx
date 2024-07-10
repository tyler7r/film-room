import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import { useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import type { SearchOptions } from "~/pages/film-room";
import StandardPopover from "../standard-popover";
import TeamLogo from "../team-logo";

type VideoSearchFilterProps = {
  searchOptions: SearchOptions;
  setSearchOptions: (options: SearchOptions) => void;
};

const VideoSearchFilters = ({
  searchOptions,
  setSearchOptions,
}: VideoSearchFilterProps) => {
  const { user } = useAuthContext();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handlePopoverOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchOptions({ ...searchOptions, [name]: value });
  };

  const handlePrivateOnly = () => {
    setSearchOptions({
      ...searchOptions,
      privateOnly: !searchOptions.privateOnly,
    });
  };

  const clearSearch = () => {
    setSearchOptions({ ...searchOptions, topic: "" });
  };

  return (
    <div className="flex w-4/5 flex-col items-center justify-center gap-2">
      <div className="flex w-full gap-2 md:w-4/5">
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
        {user.currentAffiliation?.team && (
          <IconButton
            className="flex cursor-pointer items-center"
            onMouseEnter={handlePopoverOpen}
            onMouseLeave={handlePopoverClose}
            onClick={handlePrivateOnly}
            size="small"
          >
            <TeamLogo
              tm={user.currentAffiliation.team}
              size={40}
              inactive={true}
            />
            <StandardPopover
              content={`Videos private to ${user.currentAffiliation.team.full_name} only`}
              open={open}
              anchorEl={anchorEl}
              handlePopoverClose={handlePopoverClose}
            />
          </IconButton>
        )}
      </div>
    </div>
  );
};

export default VideoSearchFilters;
