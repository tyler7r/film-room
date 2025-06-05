import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { Box, CircularProgress, Fab, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { supabase } from "utils/supabase/component";
import PlayPreview from "~/components/plays/play_preview";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import type { PlayPreviewType } from "~/utils/types";

type MentionedPlaysFeedProps = {
  profileId: string; // The ID of the user who is mentioned in these plays
};

const MentionedPlaysFeed = ({ profileId }: MentionedPlaysFeedProps) => {
  const { affIds } = useAuthContext();
  const { isMobile } = useMobileContext();

  const itemsPerLoad = isMobile ? 5 : 10;

  const [plays, setPlays] = useState<PlayPreviewType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Memoized fetch function for mentioned plays
  const fetchMentionedPlays = useCallback(
    async (currentOffset: number, append = true) => {
      if (!supabase) {
        console.warn("Supabase client is not initialized.");
        if (!append) {
          setLoading(false);
        }
        setHasMore(false);
        return;
      }

      if (!append) {
        setLoading(true);
        setPlays([]);
        setOffset(0);
        setHasMore(true);
      }

      try {
        // First, fetch mentions for the user, then get the associated play details
        // This assumes play_mentions has a 'play_id' and 'receiver_id'
        const { data: mentionsData, error: mentionsError } = await supabase
          .from("play_mentions")
          .select("play_id") // Only need the play_id from mentions table
          .eq("receiver_id", profileId)
          .order("created_at", { ascending: false }) // Order mentions by creation time
          .range(currentOffset, currentOffset + itemsPerLoad - 1);

        if (mentionsError) {
          console.error("Error fetching mentioned play IDs:", mentionsError);
          setHasMore(false);
          return;
        }

        if (!mentionsData || mentionsData.length === 0) {
          setPlays((prevPlays) => (append ? prevPlays : [])); // Clear if no new mentions
          setHasMore(false); // No more mentions
          setLoading(false);
          return;
        }

        const playIds = mentionsData.map((m) => m.play_id);

        // Now fetch the actual play_preview data for these IDs
        const playsQuery = supabase
          .from("play_preview")
          .select("*", { count: "exact" })
          .in("play->>id", playIds) // Filter by the fetched play IDs
          .order("play->>created_at", { ascending: false }); // Maintain original order

        // Apply visibility logic
        if (affIds && affIds.length > 0) {
          void playsQuery.or(
            `play->>private.eq.false, play->>exclusive_to.in.(${affIds.join(
              ",",
            )})`,
          );
        } else {
          void playsQuery.eq("play->>private", false);
        }

        const { data: playsData, error: playsError } = await playsQuery;

        if (playsError) {
          console.error("Error fetching mentioned plays details:", playsError);
          setHasMore(false);
          return;
        }

        if (playsData) {
          // It's possible that some playIds didn't return data due to RLS or other filters.
          // Filter out plays that might not have been returned by the second query
          // And explicitly handle the 'team' property to convert 'undefined' to 'null'
          // This workaround is needed if PlayPreviewType expects 'TeamType | null' but not 'undefined'.
          const filteredPlays = mentionsData
            .map((mention) => {
              const foundPlay = playsData.find(
                (playPreview) => playPreview.play.id === mention.play_id,
              );
              if (foundPlay) {
                // Return a new object that ensures 'team' is null if it was undefined
                return {
                  ...foundPlay,
                  team: foundPlay.team === undefined ? null : foundPlay.team,
                } as PlayPreviewType; // Assert the type after transformation
              }
              return undefined; // If play not found
            })
            .filter((play): play is PlayPreviewType => play !== undefined); // Filter out any undefined entries

          setPlays((prevPlays) =>
            append ? [...prevPlays, ...filteredPlays] : filteredPlays,
          );
          setOffset((prevOffset) => prevOffset + mentionsData.length); // Offset based on mentions fetched
          setHasMore(mentionsData.length === itemsPerLoad); // Check if more mentions might exist
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Unexpected error in fetchMentionedPlays:", error);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [itemsPerLoad, profileId, affIds],
  ); // Dependencies for useCallback

  // Effect for initial data load and resetting when filters change
  useEffect(() => {
    void fetchMentionedPlays(0, false);
  }, [fetchMentionedPlays]);

  const loadMorePlays = () => {
    void fetchMentionedPlays(offset, true);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box className="flex flex-col items-center justify-center gap-4 p-4">
      {loading && plays.length === 0 ? (
        <Box className="flex h-full w-full items-center justify-center p-4">
          <CircularProgress size={128} />
        </Box>
      ) : (
        <>
          <Box className="grid grid-cols-1 items-center justify-center gap-6">
            <InfiniteScroll
              dataLength={plays.length}
              next={loadMorePlays}
              hasMore={hasMore}
              loader={
                <Box className="my-4 flex justify-center">
                  <CircularProgress />
                </Box>
              }
              endMessage={
                plays.length > 0 && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      textAlign: "center",
                      color: "text.disabled",
                      my: 2,
                    }}
                  >
                    — End of mentioned plays —
                  </Typography>
                )
              }
            >
              {plays.map((play) => (
                <PlayPreview preview={play} key={play.play.id} />
              ))}
            </InfiniteScroll>
          </Box>

          {!loading && plays.length === 0 && (
            <Box className="py-4 text-center text-gray-500">
              No plays where this user is mentioned yet.
            </Box>
          )}
        </>
      )}
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

export default MentionedPlaysFeed;
