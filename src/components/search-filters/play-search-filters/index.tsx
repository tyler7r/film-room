import ClearIcon from "@mui/icons-material/Clear";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
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
import React, { useCallback, type Dispatch, type SetStateAction } from "react";
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

  const changeHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setSearchOptions((prev) => ({ ...prev, topic: value }));
    },
    [setSearchOptions],
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
    // setSearchType("topic");
  }, [setSearchOptions]);

  const clearCurrentSearchInput = useCallback(() => {
    setSearchOptions((prev) => ({ ...prev, topic: "" }));
  }, [setSearchOptions]);

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
            placeholder={"Search by topic (author, title, etc.)"}
            name="search"
            autoComplete="off"
            id="search-input"
            onChange={changeHandler}
            value={searchOptions.topic}
            sx={{ flexGrow: 1, fontSize: 10 }}
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
                <MenuItem
                  value="all"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    // 🎯 FIX: Compressed menu item padding
                    p: 1,
                    pl: 2,
                    minHeight: "auto",
                  }}
                >
                  <Typography variant="caption">All Plays</Typography>
                </MenuItem>
                {affiliations?.map((div) => (
                  <MenuItem
                    key={div.team.id}
                    value={div.team.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      // 🎯 FIX: Compressed menu item padding
                      p: 1,
                      pl: 2,
                      minHeight: "auto",
                      gap: 0.5,
                    }}
                  >
                    <Typography variant="caption">Plays private to:</Typography>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: "bold", lineHeight: 1 }}
                    >
                      {div.team.full_name}
                    </Typography>
                    {/* <TeamLogo tm={div.team} size={20} inactive={true} /> */}
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
                icon={<StarBorderIcon />}
                checkedIcon={<StarIcon />}
                size="small"
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
