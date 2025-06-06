import ClearIcon from "@mui/icons-material/Clear";
import CreateIcon from "@mui/icons-material/Create";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import StarIcon from "@mui/icons-material/Star";
import {
  Button,
  Checkbox,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  type SelectChangeEvent,
} from "@mui/material";
import { useEffect, useState } from "react";
import TeamLogo from "~/components/teams/team-logo";
import { useAuthContext } from "~/contexts/auth";
import StandardPopover from "../../utils/standard-popover";
import type { PlaySearchOptions } from "../../videos/video-play-index";

type PlaySearchFilterProps = {
  searchOptions: PlaySearchOptions;
  setSearchOptions: (options: PlaySearchOptions) => void;
};

const PlaySearchFilters = ({
  searchOptions,
  setSearchOptions,
}: PlaySearchFilterProps) => {
  const { affiliations } = useAuthContext();
  const [isAuthorSearch, setIsAuthorSearch] = useState<boolean>(false);

  const [anchorEl, setAnchorEl] = useState<{
    anchor1: HTMLElement | null;
    anchor2: HTMLElement | null;
  }>({
    anchor1: null,
    anchor2: null,
  });

  const handlePopoverOpen = (
    e: React.MouseEvent<HTMLElement>,
    target: "a" | "b",
  ) => {
    if (target === "a") {
      setAnchorEl({ ...anchorEl, anchor1: e.currentTarget });
    } else {
      setAnchorEl({ ...anchorEl, anchor2: e.currentTarget });
    }
  };

  const handlePopoverClose = () => {
    setAnchorEl({ anchor1: null, anchor2: null });
  };

  const open1 = Boolean(anchorEl.anchor1);
  const open2 = Boolean(anchorEl.anchor2);

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

  const handlePrivacyStatus = (e: SelectChangeEvent) => {
    const status = e.target.value;
    if (status === "all" || status === "") {
      setSearchOptions({ ...searchOptions, private_only: "all" });
    } else {
      setSearchOptions({ ...searchOptions, private_only: status });
    }
  };

  const clearSearchOptions = () => {
    setSearchOptions({
      ...searchOptions,
      only_highlights: false,
      author: "",
      topic: "",
      private_only: "all",
      timestamp: null,
    });
  };

  const clearTopic = () => {
    setSearchOptions({ ...searchOptions, topic: "", author: "" });
  };

  const checkToSwitchMode = () => {
    if (isAuthorSearch && searchOptions.topic !== "") {
      setIsAuthorSearch(false);
      setSearchOptions({ ...searchOptions, author: "" });
    } else return;
  };

  useEffect(() => {
    checkToSwitchMode();
  }, [searchOptions.topic]);

  return (
    <div className="flex w-4/5 flex-col items-center justify-center gap-2 p-2 lg:w-full">
      <div className="flex w-full items-center justify-center gap-1">
        <div className="flex w-full flex-col items-center gap-4 lg:flex-row lg:gap-2">
          <label htmlFor="search" className="sr-only">
            {isAuthorSearch
              ? "Search by author name"
              : "Search by tag, or player mention"}
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
                    checkedIcon={
                      <CreateIcon color="primary" fontSize="small" />
                    }
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
                : "Search by play tag or player mention"
            }
            name="topic"
            autoComplete="search-by-mentions"
            id="search-by-mentions"
            onChange={changeHandler}
            value={isAuthorSearch ? searchOptions.author : searchOptions.topic}
          />
          {affiliations && (
            <FormControl className="w-full">
              <InputLabel>Plays by Team</InputLabel>
              <Select
                value={searchOptions.private_only}
                onChange={handlePrivacyStatus}
                label="Privacy Status"
                name="privacy"
                id="privacy-status"
                className="w-full"
              >
                <MenuItem value="all" style={{ fontSize: "14px" }}>
                  All Plays
                </MenuItem>
                {affiliations?.map((div) => (
                  <MenuItem key={div.team.id} value={div.team.id}>
                    <div className="flex gap-2">
                      <div className="text-sm">
                        Plays private to:{" "}
                        <strong className="tracking-tight">
                          {div.team.full_name}
                        </strong>
                      </div>
                      <TeamLogo tm={div.team} size={25} />
                    </div>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </div>
        <Checkbox
          icon={
            <IconButton size="small">
              <StarIcon color="action" fontSize="large" />
            </IconButton>
          }
          checkedIcon={
            <IconButton size="small">
              <StarIcon color="secondary" fontSize="large" />
            </IconButton>
          }
          checked={searchOptions.only_highlights}
          onChange={() => {
            setSearchOptions({
              ...searchOptions,
              only_highlights: !searchOptions.only_highlights,
            });
          }}
          size="small"
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
      </div>
      <Button
        endIcon={<DeleteIcon />}
        variant="text"
        onClick={clearSearchOptions}
        sx={{ fontWeight: "bold" }}
      >
        Clear Filters
      </Button>
    </div>
  );
};

export default PlaySearchFilters;
