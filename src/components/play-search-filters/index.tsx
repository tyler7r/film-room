import DeleteIcon from "@mui/icons-material/Delete";
import LockIcon from "@mui/icons-material/Lock";
import SearchIcon from "@mui/icons-material/Search";
import StarIcon from "@mui/icons-material/Star";
import {
  Button,
  Checkbox,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  type SelectChangeEvent,
} from "@mui/material";
import { useAuthContext } from "~/contexts/auth";
import type { PlaySearchOptions } from "../play-index";

type PlaySearchFilterProps = {
  searchOptions: PlaySearchOptions;
  setSearchOptions: (options: PlaySearchOptions) => void;
  setPage: (page: number) => void;
};

const PlaySearchFilters = ({
  searchOptions,
  setSearchOptions,
  setPage,
}: PlaySearchFilterProps) => {
  const { user } = useAuthContext();
  const handleChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setPage(1);
    setSearchOptions({ ...searchOptions, [name]: value });
  };

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    setSearchOptions({ ...searchOptions, [name]: value });
  };

  const handleYourMentionsBtnClick = () => {
    if (searchOptions.topic === user.name)
      setSearchOptions({ ...searchOptions, topic: "" });
    else setSearchOptions({ ...searchOptions, topic: `${user.name}` });
  };

  const clearSearchOptions = () => {
    setSearchOptions({
      ...searchOptions,
      only_highlights: false,
      role: "",
      topic: "",
      private_only: false,
    });
  };

  return (
    <div className="flex w-4/5 flex-col items-center justify-center gap-1">
      <div className="relative mb-2 flex w-full flex-1 flex-shrink-0">
        <label htmlFor="search" className="sr-only">
          Search by tag or mentions...
        </label>
        <TextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: user.isLoggedIn && user.name && (
              <Button
                size="small"
                sx={{ margin: "2px", fontSize: "12px" }}
                onClick={() => handleYourMentionsBtnClick()}
              >
                My Mentions
              </Button>
            ),
          }}
          className="w-full"
          placeholder="Search by tags or mentions..."
          name="topic"
          autoComplete="search-by-mentions"
          id="search-by-mentions"
          onChange={changeHandler}
          value={searchOptions.topic}
        />
      </div>
      <div className="flex w-full gap-2">
        <FormControl className="w-full">
          <InputLabel>Search by author role...</InputLabel>
          <Select
            value={searchOptions.role}
            onChange={handleChange}
            label="Search by author role..."
            name="role"
            autoWidth
            id="author-role"
          >
            <MenuItem value="">All Notes</MenuItem>
            <MenuItem value={"coach"}>Coach Notes</MenuItem>
            <MenuItem value={"player"}>Player Notes</MenuItem>
          </Select>
        </FormControl>
        <div className="flex items-center justify-center">
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
          />
          <Checkbox
            checked={searchOptions.private_only}
            checkedIcon={<LockIcon color="primary" fontSize="large" />}
            icon={<LockIcon color="action" fontSize="large" />}
            onChange={() => {
              setSearchOptions({
                ...searchOptions,
                private_only: !searchOptions.private_only,
              });
            }}
            size="medium"
            id="private-search"
            name="private-search"
          />
        </div>
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
