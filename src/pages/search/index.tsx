import SearchIcon from "@mui/icons-material/Search";
import { Button, IconButton, InputAdornment, TextField } from "@mui/material";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import SearchPlayTags from "~/components/search-sections/tags";
import SearchTeams from "~/components/search-sections/teams";
import SearchUsers from "~/components/search-sections/users";
import SearchVideos from "~/components/search-sections/videos";
import { useAuthContext } from "~/contexts/auth";

export type SearchOptions = {
  currentAffiliation: string | undefined;
};

type ActionBarType = {
  videos: boolean;
  users: boolean;
  teams: boolean;
  tags: boolean;
};

const Search = () => {
  const { user } = useAuthContext();

  const topic = useSearchParams().get("topic") ?? "";
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [options, setOptions] = useState<SearchOptions>({
    currentAffiliation: user.currentAffiliation?.team.id,
  });
  const [actionBar, setActionBar] = useState<ActionBarType>({
    videos: true,
    users: false,
    teams: false,
    tags: false,
  });

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("topic", term);
    } else {
      params.delete("topic");
    }
    void router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  const handleActionBarClick = (topic: string) => {
    if (topic === "videos") {
      setActionBar({ videos: true, users: false, teams: false, tags: false });
    } else if (topic === "users") {
      setActionBar({ users: true, videos: false, teams: false, tags: false });
    } else if (topic === "tags") {
      setActionBar({ teams: false, users: false, videos: false, tags: true });
    } else {
      setActionBar({ users: false, videos: false, teams: true, tags: false });
    }
  };

  useEffect(() => {
    setOptions({
      currentAffiliation: user.currentAffiliation?.team.id,
    });
  }, [user]);

  return (
    <div
      className="my-4 flex w-full flex-col items-center
    justify-center gap-2"
    >
      <TextField
        className="w-4/5"
        sx={{ marginBottom: "16px" }}
        label="Search"
        placeholder="New search..."
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get("topic")?.toString()}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconButton type="submit">
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <div className="flex w-full items-center justify-center gap-12 md:w-4/5">
        <Button
          onClick={() => handleActionBarClick("videos")}
          variant={actionBar.videos ? "outlined" : "text"}
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
          variant={actionBar.users ? "outlined" : "text"}
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
          variant={actionBar.teams ? "outlined" : "text"}
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
          variant={actionBar.tags ? "outlined" : "text"}
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
      {actionBar.videos && <SearchVideos topic={topic} options={options} />}
      {actionBar.users && <SearchUsers topic={topic} />}
      {actionBar.teams && <SearchTeams topic={topic} />}
      {actionBar.tags && <SearchPlayTags topic={topic} />}
    </div>
  );
};

export default Search;
