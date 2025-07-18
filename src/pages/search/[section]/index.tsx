import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import { Button, IconButton, InputAdornment, TextField } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import SearchCollections from "~/components/search-sections/collections";
import SearchTeams from "~/components/search-sections/teams";
import SearchUsers from "~/components/search-sections/users";
import SearchVideos from "~/components/search-sections/videos";
import { useIsDarkContext } from "~/pages/_app";

const SearchSection = () => {
  const router = useRouter();
  const { backgroundStyle } = useIsDarkContext();

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
        <div
          style={backgroundStyle}
          className="flex w-full flex-wrap items-center justify-around"
        >
          <Button
            onClick={() => handleActionBarClick("users")}
            variant={section === "users" ? "contained" : "text"}
            sx={{
              fontWeight: "bold",
            }}
          >
            Users
          </Button>
          <Button
            onClick={() => handleActionBarClick("teams")}
            variant={section == "teams" ? "contained" : "text"}
            sx={{
              fontWeight: "bold",
            }}
          >
            Teams
          </Button>
          <Button
            onClick={() => handleActionBarClick("videos")}
            variant={section == "videos" ? "contained" : "text"}
            sx={{
              fontWeight: "bold",
            }}
          >
            Videos
          </Button>
          <Button
            onClick={() => handleActionBarClick("collections")}
            variant={section === "collections" ? "contained" : "text"}
            sx={{
              fontWeight: "bold",
            }}
          >
            Collections
          </Button>
        </div>
        {section === "videos" && <SearchVideos topic={search} />}
        {section === "users" && <SearchUsers topic={search} />}
        {section === "teams" && <SearchTeams topic={search} />}
        {section === "collections" && <SearchCollections topic={search} />}
      </div>
    </div>
  );
};

export default SearchSection;
