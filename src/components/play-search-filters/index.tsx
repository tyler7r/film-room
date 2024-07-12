import ClearIcon from "@mui/icons-material/Clear";
import CreateIcon from "@mui/icons-material/Create";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import StarIcon from "@mui/icons-material/Star";
import {
  Button,
  Checkbox,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import type { PlaySearchOptions } from "../play-index";
import StandardPopover from "../standard-popover";
import TeamLogo from "../team-logo";

type PlaySearchFilterProps = {
  searchOptions: PlaySearchOptions;
  setSearchOptions: (options: PlaySearchOptions) => void;
};

const PlaySearchFilters = ({
  searchOptions,
  setSearchOptions,
}: PlaySearchFilterProps) => {
  const { user } = useAuthContext();

  const [isAuthorSearch, setIsAuthorSearch] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<{
    anchor1: HTMLElement | null;
    anchor2: HTMLElement | null;
    anchor3: HTMLElement | null;
  }>({
    anchor1: null,
    anchor2: null,
    anchor3: null,
  });

  const handlePopoverOpen = (
    e: React.MouseEvent<HTMLElement>,
    target: "a" | "b" | "c",
  ) => {
    if (target === "a") {
      setAnchorEl({ ...anchorEl, anchor1: e.currentTarget });
    } else if (target === "b") {
      setAnchorEl({ ...anchorEl, anchor2: e.currentTarget });
    } else {
      setAnchorEl({ ...anchorEl, anchor3: e.currentTarget });
    }
  };

  const handlePopoverClose = () => {
    setAnchorEl({ anchor1: null, anchor2: null, anchor3: null });
  };

  const open1 = Boolean(anchorEl.anchor1);
  const open2 = Boolean(anchorEl.anchor2);
  const open3 = Boolean(anchorEl.anchor3);

  const handleModeChange = () => {
    if (isAuthorSearch) {
      setSearchOptions({ ...searchOptions, author: "" });
      setIsAuthorSearch(false);
    } else {
      setSearchOptions({ ...searchOptions, topic: "" });
      setIsAuthorSearch(true);
    }
  };

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (isAuthorSearch) {
      setSearchOptions({ ...searchOptions, author: value });
    } else {
      setSearchOptions({ ...searchOptions, topic: value });
    }
  };

  const clearSearchOptions = () => {
    setSearchOptions({
      ...searchOptions,
      only_highlights: false,
      author: "",
      topic: "",
      private_only: false,
    });
  };

  const clearTopic = () => {
    setSearchOptions({ ...searchOptions, topic: "" });
  };

  return (
    <div className="flex w-11/12 flex-col items-center justify-center gap-2 p-2 md:w-4/5">
      <div className="flex w-full gap-1">
        <label htmlFor="search" className="sr-only">
          {isAuthorSearch
            ? "Search by author name"
            : "Search by tag, mention, or play title..."}
        </label>
        <TextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <div className="flex">
                <Checkbox
                  icon={<CreateIcon color="action" fontSize="small" />}
                  checkedIcon={<CreateIcon color="primary" fontSize="small" />}
                  checked={isAuthorSearch}
                  onChange={handleModeChange}
                  size="medium"
                  id="highlights-search"
                  name="highlights-search"
                  onMouseEnter={(e) => handlePopoverOpen(e, "a")}
                  onMouseLeave={handlePopoverClose}
                />
                <StandardPopover
                  open={open1}
                  anchorEl={anchorEl.anchor1}
                  handlePopoverClose={handlePopoverClose}
                  content={isAuthorSearch ? "Topic search" : "Author Search"}
                />
                <IconButton size="small" onClick={clearTopic}>
                  <ClearIcon color="primary" fontSize="small" />
                </IconButton>
              </div>
            ),
          }}
          className="w-full"
          placeholder={
            isAuthorSearch
              ? "Search by author name"
              : "Search by tag, mention, or play title..."
          }
          name="topic"
          autoComplete="search-by-mentions"
          id="search-by-mentions"
          onChange={changeHandler}
          value={isAuthorSearch ? searchOptions.author : searchOptions.topic}
        />
        <Checkbox
          icon={<StarIcon color="action" fontSize="large" />}
          checkedIcon={<StarIcon color="secondary" fontSize="large" />}
          checked={searchOptions.only_highlights}
          onChange={() => {
            setSearchOptions({
              ...searchOptions,
              only_highlights: !searchOptions.only_highlights,
            });
          }}
          size="medium"
          id="highlights-search"
          name="highlights-search"
          onMouseEnter={(e) => handlePopoverOpen(e, "b")}
          onMouseLeave={handlePopoverClose}
        />
        <StandardPopover
          open={open2}
          anchorEl={anchorEl.anchor2}
          handlePopoverClose={handlePopoverClose}
          content="Highlights only"
        />
        {user.currentAffiliation?.team && (
          <IconButton
            className="flex cursor-pointer items-center"
            onMouseEnter={(e) => handlePopoverOpen(e, "c")}
            onMouseLeave={handlePopoverClose}
            onClick={() =>
              setSearchOptions({
                ...searchOptions,
                private_only: !searchOptions.private_only,
              })
            }
            size="small"
          >
            <TeamLogo
              tm={user.currentAffiliation.team}
              size={30}
              inactive={true}
            />
            <StandardPopover
              content={`Plays private to ${user.currentAffiliation.team.full_name} only`}
              open={open3}
              anchorEl={anchorEl.anchor3}
              handlePopoverClose={handlePopoverClose}
            />
          </IconButton>
        )}
      </div>
      <Button
        endIcon={<DeleteIcon />}
        variant="text"
        onClick={clearSearchOptions}
      >
        Clear Filters
      </Button>
    </div>
  );
};

export default PlaySearchFilters;
