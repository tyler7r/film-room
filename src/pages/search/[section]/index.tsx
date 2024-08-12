import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import { Button, IconButton, InputAdornment, TextField } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import SearchCollections from "~/components/search-sections/collections";
import SearchPlayTags from "~/components/search-sections/tags";
import SearchTeams from "~/components/search-sections/teams";
import SearchUsers from "~/components/search-sections/users";
import SearchVideos from "~/components/search-sections/videos";

const SearchSection = () => {
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
    } else if (sect === "teams") {
      void router.push(
        `/search/teams/${topic === "" ? topic : `?topic=${topic}`}`,
      );
    } else {
      void router.push(
        `/search/collections/${topic === "" ? topic : `?topic=${topic}`}`,
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
      <div className="flex w-full flex-col items-center justify-center gap-4">
        <div className="flex w-full flex-wrap items-center justify-center gap-4 lg:w-4/5 lg:justify-around">
          <Button
            onClick={() => handleActionBarClick("users")}
            variant={section === "users" ? "outlined" : "text"}
            sx={{
              fontSize: "20px",
              fontWeight: "bold",
            }}
          >
            Users
          </Button>
          <Button
            onClick={() => handleActionBarClick("teams")}
            variant={section == "teams" ? "outlined" : "text"}
            sx={{
              fontSize: "20px",
              fontWeight: "bold",
            }}
          >
            Teams
          </Button>
          <Button
            onClick={() => handleActionBarClick("videos")}
            variant={section == "videos" ? "outlined" : "text"}
            sx={{
              fontSize: "20px",
              fontWeight: "bold",
            }}
          >
            Videos
          </Button>
          <Button
            onClick={() => handleActionBarClick("collections")}
            variant={section === "collections" ? "outlined" : "text"}
            sx={{
              fontSize: "20px",
              fontWeight: "bold",
            }}
          >
            Collections
          </Button>
          <Button
            onClick={() => handleActionBarClick("tags")}
            variant={section === "tags" ? "outlined" : "text"}
            sx={{
              fontSize: "20px",
              fontWeight: "bold",
            }}
          >
            Tags
          </Button>
        </div>
        {section === "videos" && <SearchVideos topic={search} />}
        {section === "users" && <SearchUsers topic={search} />}
        {section === "teams" && <SearchTeams topic={search} />}
        {section === "tags" && <SearchPlayTags topic={search} />}
        {section === "collections" && <SearchCollections topic={search} />}
      </div>
    </div>
  );
};

export default SearchSection;
