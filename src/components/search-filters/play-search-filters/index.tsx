import ClearIcon from "@mui/icons-material/Clear";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";
import React, {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import TeamLogo from "~/components/teams/team-logo";
import { useAuthContext } from "~/contexts/auth";
import StandardPopover from "../../utils/standard-popover"; // Using StandardPopover as provided
import type { PlaySearchOptions } from "../../videos/video-play-index";

type PlaySearchFilterProps = {
  searchOptions: PlaySearchOptions;
  setSearchOptions: Dispatch<SetStateAction<PlaySearchOptions>>;
};

const PlaySearchFilters = ({
  searchOptions,
  setSearchOptions,
}: PlaySearchFilterProps) => {
  const { affiliations } = useAuthContext();
  const [searchType, setSearchType] = useState<"topic" | "author">(
    searchOptions.author !== "" ? "author" : "topic",
  );

  // Removed anchorEl state, handlePopoverOpen, handlePopoverClose, open1, open2
  // as StandardPopover (Tooltip internally) manages its own visibility

  const handleSearchTypeChange = useCallback(
    (event: SelectChangeEvent<"topic" | "author">) => {
      const newSearchType = event.target.value as "topic" | "author";
      setSearchType(newSearchType);
      if (newSearchType === "topic") {
        setSearchOptions((prev) => ({ ...prev, author: "" }));
      } else {
        setSearchOptions((prev) => ({ ...prev, topic: "" }));
      }
    },
    [setSearchOptions],
  );

  const changeHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      if (searchType === "author") {
        setSearchOptions((prev) => ({ ...prev, author: value }));
      } else {
        setSearchOptions((prev) => ({ ...prev, topic: value }));
      }
    },
    [searchType, setSearchOptions],
  );

  const handlePrivacyStatus = useCallback(
    (e: SelectChangeEvent) => {
      const status = e.target.value;
      setSearchOptions((prev) => ({ ...prev, private_only: status }));
    },
    [setSearchOptions],
  );

  const clearSearchOptions = useCallback(() => {
    setSearchOptions({
      only_highlights: false,
      author: "",
      topic: "",
      private_only: "all",
      timestamp: null,
    });
    setSearchType("topic");
  }, [setSearchOptions]);

  const clearCurrentSearchInput = useCallback(() => {
    if (searchType === "author") {
      setSearchOptions((prev) => ({ ...prev, author: "" }));
    } else {
      setSearchOptions((prev) => ({ ...prev, topic: "" }));
    }
  }, [searchType, setSearchOptions]);

  useEffect(() => {
    if (searchType === "author" && searchOptions.topic !== "") {
      setSearchType("topic");
      setSearchOptions((prev) => ({ ...prev, author: "" }));
    }
  }, [searchOptions.topic, searchType, setSearchOptions]);

  return (
    <Box
      sx={{
        display: "flex",
        width: { xs: "95%", lg: "100%" },
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: { xs: 0, sm: 1 },
        p: { xs: 2, sm: 2.5 },
        borderRadius: "8px",
        boxShadow: 1,
        backgroundColor: "background.paper",
      }}
    >
      <Box
        sx={{
          display: "flex",
          width: "100%",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: "center",
          gap: { xs: 2, md: 1.5 },
        }}
      >
        {/* Search Input and Type Selector Group */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1.5, sm: 1 },
            flexGrow: 1,
          }}
        >
          {/* StandardPopover wraps FormControl for "Search By" Select */}
          <StandardPopover
            content="Choose search mode" // Passed content prop
          >
            <FormControl
              variant="outlined"
              sx={{ width: { xs: "100%", sm: "auto" }, minWidth: 120 }}
              size="small"
            >
              <InputLabel id="search-type-label">Search By</InputLabel>
              <Select
                labelId="search-type-label"
                value={searchType}
                onChange={handleSearchTypeChange}
                label="Search By"
                id="search-type-select"
              >
                <MenuItem value="topic">Mentions/Tags</MenuItem>
                <MenuItem value="author">Play Author</MenuItem>
              </Select>
            </FormControl>
          </StandardPopover>
          <TextField
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <IconButton
                  size="small"
                  onClick={clearCurrentSearchInput}
                  aria-label="clear-search-input"
                >
                  <ClearIcon color="error" fontSize="small" />
                </IconButton>
              ),
            }}
            fullWidth
            placeholder={
              searchType === "author"
                ? "Search by author name"
                : "Search by mention or tag"
            }
            name="search"
            autoComplete="off"
            id="search-input"
            onChange={changeHandler}
            value={
              searchType === "author"
                ? searchOptions.author
                : searchOptions.topic
            }
            sx={{ flexGrow: 1 }}
            size="small"
          />
        </Box>

        {/* Group for Team Privacy and Highlights filters */}
        <Box
          sx={{
            display: "flex",
            width: { xs: "100%", md: "auto" },
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            gap: { xs: 1.5, sm: 1 },
            flexShrink: 0,
          }}
        >
          {affiliations && (
            <FormControl
              variant="outlined"
              sx={{
                width: { xs: "100%", sm: "auto" },
                minWidth: { sm: "200px" },
                flexGrow: 1,
              }}
            >
              <InputLabel id="privacy-status-label">Plays by Team</InputLabel>
              <Select
                labelId="privacy-status-label"
                value={searchOptions.private_only}
                onChange={handlePrivacyStatus}
                label="Plays by Team"
                name="privacy"
                id="privacy-status"
                size="small"
              >
                <MenuItem value="all">
                  <Typography variant="body2">All Plays</Typography>
                </MenuItem>
                {affiliations?.map((div) => (
                  <MenuItem
                    key={div.team.id}
                    value={div.team.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <Typography variant="body2">Plays private to:</Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: "bold", lineHeight: 1 }}
                    >
                      {div.team.full_name}
                    </Typography>
                    <TeamLogo tm={div.team} size={20} inactive={true} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Highlights Only Checkbox now with StandardPopover */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <StandardPopover content="Show only plays marked as highlights">
              <Checkbox
                checked={searchOptions.only_highlights}
                onChange={() => {
                  setSearchOptions((prev) => ({
                    ...prev,
                    only_highlights: !prev.only_highlights,
                  }));
                }}
                size="medium"
                id="highlights-only-checkbox"
                name="highlights-only-checkbox"
                color="secondary"
                // onMouseEnter and onMouseLeave are no longer needed here
              />
            </StandardPopover>
            {/* Label for Highlights Only moved next to the checkbox for visual grouping */}
            <Typography
              variant="body1"
              sx={{
                fontWeight: "bold",
                cursor: "pointer",
              }}
              onClick={() => {
                setSearchOptions((prev) => ({
                  ...prev,
                  only_highlights: !prev.only_highlights,
                }));
              }}
            >
              Highlights Only
            </Typography>
          </Box>
        </Box>
      </Box>

      <Button
        endIcon={<DeleteIcon />}
        variant="text"
        color="error"
        onClick={clearSearchOptions}
        sx={{ fontWeight: "bold" }}
        size="small"
      >
        Clear Filters
      </Button>
    </Box>
  );
};

export default PlaySearchFilters;
