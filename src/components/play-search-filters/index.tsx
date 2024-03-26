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
import { PlaySearchOptions } from "../play-index";

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
    const { value } = e.target;
    setSearchOptions({ ...searchOptions, receiver_name: value });
  };

  const clearMentionSearch = () => {
    setSearchOptions({ ...searchOptions, receiver_name: "" });
  };

  const handleYourMentionsBtnClick = () => {
    setSearchOptions({ ...searchOptions, receiver_name: `${user.name}` });
  };

  const clearSearchOptions = () => {
    setSearchOptions({
      only_highlights: false,
      role: "",
      receiver_name: "",
    });
  };

  return (
    <div className="flex w-full flex-col items-center justify-center gap-1">
      <div className="relative mb-2 flex flex-1 flex-shrink-0">
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
              <div className="relative flex items-center justify-around">
                <Button
                  size="small"
                  className="m-1"
                  onClick={() => handleYourMentionsBtnClick()}
                >
                  Only Your Mentions
                </Button>
              </div>
            ),
          }}
          className="w-full"
          placeholder="Search by mentions..."
          name="search"
          autoComplete="search"
          id="search"
          onChange={changeHandler}
          value={searchOptions.receiver_name}
        />
      </div>
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
      <div className="flex items-center justify-center">
        <div className="text-xl font-bold tracking-tight">Highlights only?</div>
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
