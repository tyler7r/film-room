import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
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
    setSearchOptions({ ...searchOptions, receiver_name: `${user.name}` });
  };

  const clearSearchOptions = () => {
    setSearchOptions({
      only_highlights: false,
      role: "",
      receiver_name: "",
      tag: "",
    });
  };

  return (
    <div className="flex w-4/5 flex-col items-center justify-center gap-1">
      <div className="relative mb-2 flex w-full flex-1 flex-shrink-0">
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
            endAdornment: user.isLoggedIn && user.name && (
              <Button
                size="small"
                sx={{ margin: "4px" }}
                onClick={() => handleYourMentionsBtnClick()}
              >
                Only Your Mentions
              </Button>
            ),
          }}
          className="w-full"
          placeholder="Search by mentions..."
          name="receiver_name"
          autoComplete="search-by-mentions"
          id="search-by-mentions"
          onChange={changeHandler}
          value={searchOptions.receiver_name}
        />
      </div>
      <div className="flex w-full items-center justify-center gap-2">
        <TextField
          className="w-full"
          placeholder="Search by tags..."
          name="tag"
          autoComplete="search-by-tag"
          id="search-by-tag"
          onChange={changeHandler}
          value={searchOptions.tag}
        />
        <FormControl className="w-4/5">
          <InputLabel>Search by author role...</InputLabel>
          <Select
            value={searchOptions.role}
            onChange={handleChange}
            label="Search by author role..."
            name="role"
            autoWidth
          >
            <MenuItem value="">All Notes</MenuItem>
            <MenuItem value={"coach"}>Coach Notes</MenuItem>
            <MenuItem value={"player"}>Player Notes</MenuItem>
          </Select>
        </FormControl>
      </div>
      <div className="flex gap-4">
        <div className="flex items-center justify-center">
          <div className="text-xl font-bold tracking-tight">
            Private Plays Only?
          </div>
          <Checkbox
            checked={searchOptions.private_only}
            onChange={() => {
              setSearchOptions({
                ...searchOptions,
                private_only: !searchOptions.private_only,
              });
            }}
            size="medium"
          />
        </div>
        <div className="flex items-center justify-center">
          <div className="text-xl font-bold tracking-tight">
            Highlights only?
          </div>
          <Checkbox
            checked={searchOptions.only_highlights}
            onChange={() => {
              setSearchOptions({
                ...searchOptions,
                only_highlights: !searchOptions.only_highlights,
              });
            }}
            size="medium"
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
