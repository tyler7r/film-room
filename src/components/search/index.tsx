import SearchIcon from "@mui/icons-material/Search";
import { InputAdornment, TextField } from "@mui/material";
import React from "react";
import type { SearchOptions } from "~/pages/film-room";

type VideoSearchFilterProps = {
  searchOptions: SearchOptions;
  setSearchOptions: (options: SearchOptions) => void;
};

const Search = ({
  searchOptions,
  setSearchOptions,
}: VideoSearchFilterProps) => {
  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchOptions({ ...searchOptions, title: value });
  };

  return (
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
  );
};

export default Search;
