import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import { Button, IconButton, InputAdornment, TextField } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import SearchPlayTags from "~/components/search-sections/tags";
import SearchTeams from "~/components/search-sections/teams";
import SearchUsers from "~/components/search-sections/users";
import SearchVideos from "~/components/search-sections/videos";
import { useAuthContext } from "~/contexts/auth";

const SearchSection = () => {
  const { affIds } = useAuthContext();
  const router = useRouter();

  const section = router.query.section as string;
  const topic = useSearchParams().get("topic") ?? "";

  const [search, setSearch] = useState<string>(topic);

  const handleActionBarClick = (sect: string) => {
    if (sect === "videos") {
      void router.push(
        `/search/videos/${topic === "" ? topic : `?topic=${topic}`}`,
      );
    } else if (sect === "users") {
      void router.push(
        `/search/users/${topic === "" ? topic : `?topic=${topic}`}`,
      );
    } else if (sect === "tags") {
      void router.push(
        `/search/tags/${topic === "" ? topic : `?topic=${topic}`}`,
      );
    } else {
      void router.push(
        `/search/teams/${topic === "" ? topic : `?topic=${topic}`}`,
      );
    }
  };

  const onChange = (term: string) => {
    setSearch(term);
  };

  const handleClear = () => {
    setSearch("");
  };

  useEffect(() => {
    setSearch(topic);
  }, [topic]);

  return (
    <div
      className="my-4 flex w-full flex-col items-center
    justify-center gap-2"
    >
      <TextField
        name="search"
        id="search"
        className="w-4/5"
        sx={{ marginBottom: "16px" }}
        label="Search"
        placeholder="New search..."
        onChange={(e) => onChange(e.target.value)}
        value={search}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconButton type="submit" color="primary" size="small">
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton color="primary" onClick={handleClear} size="small">
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <div className="flex w-full items-center justify-center gap-12 md:w-4/5">
        <Button
          onClick={() => handleActionBarClick("videos")}
          variant={section == "videos" ? "outlined" : "text"}
          sx={{
            fontSize: "20px",
            padding: "6px 20px 6px 20px",
            fontWeight: "bold",
            letterSpacing: "0.07em",
          }}
        >
          Videos
        </Button>
        <Button
          onClick={() => handleActionBarClick("users")}
          variant={section === "users" ? "outlined" : "text"}
          sx={{
            fontSize: "20px",
            padding: "6px 20px 6px 20px",
            fontWeight: "bold",
            letterSpacing: "0.07em",
          }}
        >
          Users
        </Button>
        <Button
          onClick={() => handleActionBarClick("teams")}
          variant={section == "teams" ? "outlined" : "text"}
          sx={{
            fontSize: "20px",
            padding: "6px 20px 6px 20px",
            fontWeight: "bold",
            letterSpacing: "0.07em",
          }}
        >
          Teams
        </Button>
        <Button
          onClick={() => handleActionBarClick("tags")}
          variant={section === "tags" ? "outlined" : "text"}
          sx={{
            fontSize: "20px",
            padding: "6px 20px 6px 20px",
            fontWeight: "bold",
            letterSpacing: "0.07em",
          }}
        >
          Tags
        </Button>
      </div>
      {section === "videos" && <SearchVideos topic={search} affIds={affIds} />}
      {section === "users" && <SearchUsers topic={search} />}
      {section === "teams" && <SearchTeams topic={search} />}
      {section === "tags" && <SearchPlayTags topic={search} />}
    </div>
  );
};

export default SearchSection;
