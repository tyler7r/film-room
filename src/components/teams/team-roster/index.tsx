import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button, // <--- Import Button
  CircularProgress,
  Fab,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import EmptyMessage from "~/components/utils/empty-msg";
import PageTitle from "~/components/utils/page-title";
import { useMobileContext } from "~/contexts/mobile";
import useDebounce from "~/utils/debounce";
import { supabase } from "~/utils/supabase";
import type { PlayerType, TeamType } from "~/utils/types";
import User from "../../user";
import UserEdit from "../../user-edit";

type RosterProps = {
  team: TeamType;
  role: string;
};

const Roster = ({ team, role }: RosterProps) => {
  const { isMobile } = useMobileContext();

  const itemsPerLoad = isMobile ? 10 : 18;

  const [roster, setRoster] = useState<PlayerType[]>([]);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalRosterCount, setTotalRosterCount] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showFilterBox, setShowFilterBox] = useState<boolean>(false);
  const scrollableContainerRef = useRef<HTMLDivElement>(null);

  const handleToggleFilterBox = () => {
    setShowFilterBox((prev) => !prev);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const fetchRoster = useCallback(
    async (
      currentOffset: number,
      append: boolean,
      currentSearchTerm: string,
    ) => {
      if (!supabase) {
        console.warn("Supabase client is not initialized.");
        if (!append) {
          setLoadingInitial(false);
        }
        setHasMore(false);
        return;
      }

      if (!append) {
        setLoadingInitial(true);
        setRoster([]);
        setOffset(0);
        setHasMore(true);
        setTotalRosterCount(null);
      } else {
        setLoadingMore(true);
      }

      try {
        let rosterQuery = supabase
          .from("user_view")
          .select("*", { count: "exact" })
          .match({
            "team->>id": team.id,
            "affiliation->>verified": true,
          })
          .order("profile->>name", { ascending: true });

        if (currentSearchTerm) {
          rosterQuery = rosterQuery.or(
            `profile->>name.ilike.%${currentSearchTerm}%, profile->>email.ilike.%${currentSearchTerm}%`,
          );
        }

        const rangeEnd = currentOffset + itemsPerLoad - 1;
        rosterQuery = rosterQuery.range(currentOffset, rangeEnd);

        const { data, count, error } = await rosterQuery;

        if (error) {
          console.error("Error fetching roster:", error);
          if (error.code === "PGRST103") {
            setHasMore(false);
          } else {
            setHasMore(false);
            setTotalRosterCount(0);
          }
          return;
        }

        if (data) {
          setRoster((prevRoster) => (append ? [...prevRoster, ...data] : data));
          const newOffset = currentOffset + data.length;
          setOffset(newOffset);

          if (count !== null) {
            setTotalRosterCount(count);
            setHasMore(newOffset < count);
          } else {
            setHasMore(false);
            setTotalRosterCount(data.length);
          }

          if (data.length < itemsPerLoad) {
            setHasMore(false);
          }
        } else {
          setHasMore(false);
          setTotalRosterCount(0);
        }
      } catch (error) {
        console.error("Unexpected error in fetchRoster:", error);
        setHasMore(false);
        setTotalRosterCount(0);
      } finally {
        if (!append) {
          setLoadingInitial(false);
        } else {
          setLoadingMore(false);
        }
      }
    },
    [itemsPerLoad, team.id],
  );

  useEffect(() => {
    void fetchRoster(0, false, searchTerm);
  }, [team.id, fetchRoster]);

  const debouncedFetchRoster = useDebounce(fetchRoster, 300);

  useEffect(() => {
    debouncedFetchRoster(0, false, searchTerm);
  }, [searchTerm, debouncedFetchRoster]);

  // useEffect(() => {
  //   const channel = supabase
  //     .channel(`team_roster_${team.id}_changes`)
  //     .on(
  //       "postgres_changes",
  //       {
  //         event: "*",
  //         schema: "public",
  //         table: "affiliations",
  //         filter: `team_id=eq.${team.id}`,
  //       },
  //       () => {
  //         void fetchRoster(0, false, searchTerm);
  //       },
  //     )
  //     .subscribe();

  //   return () => {
  //     void supabase.removeChannel(channel);
  //   };
  // }, [team.id, fetchRoster, searchTerm]);

  const loadMoreRoster = () => {
    if (!loadingMore && hasMore) {
      void fetchRoster(offset, true, searchTerm);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const scrollToTop = () => {
    if (scrollableContainerRef.current) {
      scrollableContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <Box
      id="team-roster-scrollable-container"
      ref={scrollableContainerRef}
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100vh",
        maxHeight: "100vh",
        overflowY: "auto",
        boxSizing: "border-box",
        pr: { xs: 0, sm: "8px" },
        pb: "80px",
      }}
    >
      {/* Title with number of results and Filter Icon */}
      <Box
        sx={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          flexShrink: 0,
          pb: 1,
        }}
      >
        <PageTitle
          size="small"
          title={`Roster (${totalRosterCount ?? 0})`}
          fullWidth={false}
        />
        <IconButton
          onClick={handleToggleFilterBox}
          size="small"
          aria-label="toggle roster filter"
        >
          <FilterListIcon color={showFilterBox ? "primary" : "inherit"} />
        </IconButton>
      </Box>

      {/* Filter Box (conditionally rendered) */}
      {showFilterBox && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            width: { xs: "100%", sm: "80%", md: "60%" },
            p: 2,
            borderRadius: "8px",
            boxShadow: 3,
            bgcolor: "background.paper",
            alignItems: "center",
            flexShrink: 0,
            mt: 2,
            mb: 2,
            mx: "auto",
          }}
        >
          <TextField
            label="Search Roster"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm ? (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClearSearch}
                    size="small"
                    edge="end"
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        </Box>
      )}

      {/* Roster List or Loading/Empty State */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          flexGrow: 1,
        }}
      >
        {loadingInitial ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "150px",
              width: "100%",
              flexGrow: 1,
            }}
          >
            <CircularProgress size={40} />
          </Box>
        ) : !roster || roster.length === 0 ? (
          <EmptyMessage message="active player accounts matching your criteria" />
        ) : (
          <InfiniteScroll
            dataLength={roster.length}
            next={loadMoreRoster}
            hasMore={hasMore}
            loader={
              loadingMore ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    my: 2,
                    width: "100%",
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : null
            }
            endMessage={
              !hasMore &&
              roster.length > 0 &&
              !loadingMore && (
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    textAlign: "center",
                    color: "text.disabled",
                    my: 2,
                  }}
                >
                  — End of roster —
                </Typography>
              )
            }
            scrollableTarget="team-roster-scrollable-container"
          >
            <Box
              sx={{
                display: "grid",
                width: "100%",
                gridTemplateColumns: {
                  xs: "repeat(1, minmax(370px, 1fr))",
                  sm: "repeat(2, minmax(280px, 1fr))",
                  md: "repeat(3, minmax(280px, 1fr))",
                },
                gap: { xs: 2, md: 3 },
                justifyContent: "center",
              }}
            >
              {(role === "player" || role === "guest") &&
                roster.map((p) => (
                  <Box key={p.affiliation.id}>
                    <User
                      user={p.profile}
                      goToProfile={true}
                      number={p.affiliation.number}
                      small={true}
                      coach={p.affiliation.role === "coach" ? true : false}
                    />
                  </Box>
                ))}
              {(role === "coach" || role === "owner") &&
                roster.map((p) => (
                  <Box key={p.affiliation.id}>
                    <UserEdit
                      user={p.profile}
                      goToProfile={true}
                      affiliation={p.affiliation}
                      small={true}
                    />
                  </Box>
                ))}
            </Box>
          </InfiniteScroll>
        )}

        {/* Manual Load More Button */}
        {!loadingInitial && !loadingMore && hasMore && roster.length > 0 && (
          <Box
            sx={{
              my: 2,
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <Button
              variant="contained"
              onClick={loadMoreRoster}
              disabled={loadingMore}
            >
              Load More Roster
            </Button>
          </Box>
        )}
      </Box>
      <Fab
        color="primary"
        onClick={scrollToTop}
        size="small"
        sx={{
          position: "fixed",
          bottom: "16px",
          right: "16px",
          zIndex: 1000,
        }}
        aria-label="Scroll to top"
      >
        <ArrowUpwardIcon />
      </Fab>
    </Box>
  );
};

export default Roster;
