import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useSearchContext } from "~/contexts/search";

const NavbarSearch = () => {
  const { topic, setTopic } = useSearchContext();
  const searchParams = useSearchParams();
  const router = useRouter();

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setTopic(value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    params.delete("play");
    params.delete("start");
    if (topic !== "") {
      params.set("topic", topic);
    } else {
      params.delete("topic");
    }
    setTopic("");
    void router.replace(`/search/videos?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full lg:w-2/3">
      <TextField
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconButton color="primary" size="small" type="submit">
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setTopic("")}>
                <CloseIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        className="w-full"
        placeholder="New search..."
        name="topic"
        autoComplete="search"
        id="search"
        onChange={changeHandler}
        value={topic}
      />
    </form>
  );
};

export default NavbarSearch;
