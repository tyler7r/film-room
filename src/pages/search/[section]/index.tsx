import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box, // <-- Added Box
  IconButton,
  InputAdornment, // <-- Added Tabs
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { type SyntheticEvent, useEffect, useState } from "react"; // Added SyntheticEvent
import SearchCollections from "~/components/search-sections/collections";
import SearchTeams from "~/components/search-sections/teams";
import SearchUsers from "~/components/search-sections/users";
import SearchVideos from "~/components/search-sections/videos";
import { useIsDarkContext } from "~/pages/_app"; // Assuming this path is correct

const SearchSection = () => {
  const router = useRouter();
  const { backgroundStyle } = useIsDarkContext();

  // Ensure 'section' is always a string and defaults to a valid tab if not present
  const currentSection = (router.query.section as string) || "videos"; // Default to 'videos'
  const topic = useSearchParams().get("topic") ?? "";

  const [search, setSearch] = useState<string>(topic);

  // Renamed from handleActionBarClick to handleTabChange for clarity
  // newValue will be the 'value' prop of the Tab that was clicked
  const handleTabChange = (_event: SyntheticEvent, newValue: string) => {
    // Ensure topic is correctly formatted in the URL
    const topicQuery = topic === "" ? "" : `?topic=${topic}`;
    void router.push(`/search/${newValue}${topicQuery}`);
  };

  const onChange = (term: string) => {
    setSearch(term);
    // Optionally, you might want to update the URL's 'topic' param here
    // or when the user presses enter/clicks search icon.
    // For now, it only updates the local state.
  };

  const handleClear = () => {
    setSearch("");
    // Also clear the topic in the URL if needed
    const currentSection = (router.query.section as string) || "videos";
    void router.push(`/search/${currentSection}`);
  };

  // Add a function to trigger search when icon is clicked or enter is pressed
  const handleSearchSubmit = () => {
    const topicQuery = search === "" ? "" : `?topic=${search}`;
    void router.push(`/search/${currentSection}${topicQuery}`);
  };

  useEffect(() => {
    // Update local search state if the URL topic changes (e.g., from direct URL entry)
    setSearch(topic);
  }, [topic]);

  return (
    <Box // Replaced outer div with Box
      className="my-4 flex w-full flex-col items-center justify-center gap-2"
      // You can move Tailwind classes to sx prop if preferred, but keeping them for now
    >
      <TextField
        name="search"
        id="search"
        className="w-4/5" // Tailwind width class
        sx={{ marginBottom: "16px" }}
        label="Search"
        placeholder="New search..."
        onChange={(e) => onChange(e.target.value)}
        value={search}
        onKeyPress={(e) => {
          // Added for enter key search
          if (e.key === "Enter") {
            void handleSearchSubmit();
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconButton
                type="submit"
                color="primary"
                size="small"
                onClick={handleSearchSubmit}
              >
                {" "}
                {/* Added onClick */}
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
      <Box // Replaced inner div with Box
        className="flex w-full flex-col items-center justify-center gap-4"
      >
        <Box // Replaced div with Box for the tabs container
          sx={{ ...backgroundStyle, width: "100%" }} // Spread backgroundStyle and set full width
          className="flex flex-wrap items-center justify-around" // Kept some Tailwind for flex layout
        >
          <Tabs
            value={currentSection} // The currently active tab, derived from router.query
            onChange={handleTabChange} // Function to handle tab changes
            variant="scrollable" // Makes tabs take full available width
            aria-label="search sections"
            sx={{
              "& .MuiTabs-indicator": {
                backgroundColor: "primary.main", // Example: customize indicator color
              },
            }}
          >
            <Tab label="Users" value="users" sx={{ fontWeight: "bold" }} />
            <Tab label="Teams" value="teams" sx={{ fontWeight: "bold" }} />
            <Tab label="Videos" value="videos" sx={{ fontWeight: "bold" }} />
            <Tab
              label="Collections"
              value="collections"
              sx={{ fontWeight: "bold" }}
            />
          </Tabs>
        </Box>

        {/* Conditional rendering of search results components */}
        {currentSection === "videos" && <SearchVideos topic={search} />}
        {currentSection === "users" && <SearchUsers topic={search} />}
        {currentSection === "teams" && <SearchTeams topic={search} />}
        {currentSection === "collections" && (
          <SearchCollections topic={search} />
        )}
      </Box>
    </Box>
  );
};

export default SearchSection;
