import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import LockIcon from "@mui/icons-material/Lock";
import PublicIcon from "@mui/icons-material/Public";
import {
  Box,
  CircularProgress,
  colors,
  Divider, // Divider will still be used between logo/author and the actions menu if needed, or can be removed if not.
  Fab,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import CollectionActionsMenu from "~/components/collections/collection-actions-menu";
import PlayPreview from "~/components/plays/play_preview";
import TeamLogo from "~/components/teams/team-logo";
import EmptyMessage from "~/components/utils/empty-msg";
import PageTitle from "~/components/utils/page-title";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { useIsDarkContext } from "~/pages/_app";
import { getDisplayName } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { CollectionType, PlayPreviewType, UserType } from "~/utils/types";

const Collection = () => {
  const { affIds, affiliations, user } = useAuthContext();
  const router = useRouter();
  const { isMobile } = useMobileContext();
  const { hoverText, isDark } = useIsDarkContext();

  const id = router.query.id as string;
  const itemsPerLoad = isMobile ? 5 : 3;

  const [collection, setCollection] = useState<CollectionType | null>(null);
  const [plays, setPlays] = useState<PlayPreviewType[]>([]);
  const [playIds, setPlaysIds] = useState<string[]>([]);

  const [authorProfile, setAuthorProfile] = useState<UserType | null>(null);
  const [userCanEdit, setUserCanEdit] = useState<boolean>(false);
  const [reload, setReload] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const [playCount, setPlayCount] = useState<number>(0);
  const [accessDenied, setAccessDenied] = useState(true);

  // Infinite Scroll states
  const [loading, setLoading] = useState<boolean>(true);
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const scrollableContainerRef = useRef<HTMLDivElement>(null);

  const exclusiveTeam = affiliations?.find(
    (aff) => aff.team.id === collection?.exclusive_to,
  )?.team;

  const fetchCollection = useCallback(async () => {
    if (id) {
      const { data } = await supabase
        .from("collections")
        .select("*, profiles(*)")
        .eq("id", id)
        .single();
      if (data) {
        setCollection(data);
        if (data.exclusive_to) {
          const accessAllowed = affIds?.includes(data.exclusive_to);
          if (!accessAllowed) {
            setAccessDenied(true);
          } else setAccessDenied(false);
        } else {
          setAccessDenied(false);
        }
      } else {
        setCollection(null);
      }
      if (data?.profiles) setAuthorProfile(data.profiles);
    }
  }, [id, affIds]);

  const fetchPlays = useCallback(
    async (currentOffset: number, append = true) => {
      if (!supabase) {
        console.warn("Supabase client is not initialized.");
        if (!append) {
          setLoading(false);
        }
        setHasMore(false);
        return;
      }

      if (!id) {
        setHasMore(false);
        setLoading(false);
        return;
      }

      if (!append) {
        setLoading(true);
        setPlays([]);
        setOffset(0);
        setHasMore(true);
      }

      try {
        const playsQuery = supabase
          .from("collection_plays_view")
          .select("*", { count: "exact" })
          .eq("collection->>id", id)
          .order("play->>created_at", { ascending: false })
          .range(currentOffset, currentOffset + itemsPerLoad - 1);

        if (affIds && affIds.length > 0) {
          void playsQuery.or(
            `play->>private.eq.false, play->>exclusive_to.in.(${affIds})`,
          );
        } else {
          void playsQuery.eq("play->>private", false);
        }

        const { data, error, count } = await playsQuery;

        if (error) {
          console.error("Error fetching collection plays:", error);
          setHasMore(false);
          return;
        }

        if (data) {
          setPlays((prevPlays) => {
            const newPlays = append ? [...prevPlays, ...data] : data;
            setPlaysIds(newPlays.map((play) => play.play.id));
            return newPlays;
          });
          setOffset((prevOffset) => prevOffset + data.length);
          setHasMore(data.length === itemsPerLoad);
          if (count !== null) {
            setPlayCount(count);
          }
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Unexpected error in fetchPlays:", error);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [itemsPerLoad, id, affIds],
  );

  const loadMorePlays = useCallback(() => {
    void fetchPlays(offset, true);
  }, [offset, fetchPlays]);

  const checkIfUserCanEdit = useCallback(() => {
    if (collection) {
      const userIsAffiliated = affIds?.findIndex(
        (aff) => aff === collection.exclusive_to,
      );
      const userIsAuthor = Boolean(collection.author_id === user.userId);
      if (userIsAffiliated !== -1 || userIsAuthor) {
        setUserCanEdit(true);
      } else {
        setUserCanEdit(false);
      }
    }
  }, [collection, affIds, user.userId]);

  const copyToClipboard = useCallback(() => {
    const origin = window.location.origin;
    void navigator.clipboard.writeText(`${origin}/collections/${id}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, [id]);

  useEffect(() => {
    void fetchCollection();
    void fetchPlays(0, false);
  }, [id, affIds, fetchCollection, fetchPlays]);

  useEffect(() => {
    if (reload) {
      void fetchPlays(0, false);
      setReload(false);
    }
  }, [reload, fetchPlays]);

  useEffect(() => {
    checkIfUserCanEdit();
  }, [collection, user, checkIfUserCanEdit]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    collection && (
      <Box className="flex w-full flex-col items-center justify-center gap-4 p-4">
        {/* --- Header Section --- */}
        <Box className="flex w-full flex-col items-center justify-center gap-2 px-2">
          {/* Top Line: Play Count (Left) and Title (stretching) */}
          <Box className="flex w-full items-center justify-center gap-2">
            {/* Play Count Box */}

            {/* Collection Title (stretches, not centered) */}
            <Box>
              <PageTitle
                title={collection.title}
                size="small"
                sx={{
                  whiteSpace: "normal",
                  lineHeight: 1.5,
                  textAlign: isMobile ? "center" : "left",
                }}
              />
            </Box>
          </Box>

          <Box
            className="flex items-center justify-center gap-2 rounded-lg p-1.5"
            sx={
              isDark
                ? { backgroundColor: colors.purple[200] }
                : { backgroundColor: colors.purple[50] }
            }
          >
            <Typography variant="body1" sx={{ lineHeight: 1 }}>
              PLAYS:
            </Typography>
            <Typography
              variant="h5"
              className="font-bold leading-none tracking-tight"
              sx={{ lineHeight: 1, fontWeight: "bold" }}
            >
              {playCount}
            </Typography>
          </Box>

          {/* Second Line: Team Logo (Left), Author, Actions Menu */}
          <Box className="flex w-full flex-wrap items-center justify-center gap-2">
            {/* Team Logo / Public Icon (smaller) */}
            <Box className="flex-shrink-0">
              {exclusiveTeam?.logo ? (
                <TeamLogo tm={exclusiveTeam} size={25} />
              ) : (
                <PublicIcon fontSize="medium" color="action" />
              )}
            </Box>
            <Divider flexItem orientation="vertical" variant="middle" />

            {/* Author Name */}
            {authorProfile && (
              <Typography
                onClick={() =>
                  void router.push(`/profile/${collection.author_id}`)
                }
                className={`${hoverText} cursor-pointer text-lg font-bold tracking-tight`}
                sx={{
                  cursor: "pointer",
                  fontWeight: "bold",
                  letterSpacing: "-0.025em",
                }}
                variant="body2"
              >
                {getDisplayName(authorProfile)}
              </Typography>
            )}

            {/* Actions Menu - pushed to right on larger screens */}
            <Box>
              <CollectionActionsMenu
                collection={collection}
                userIsAuthor={user.userId === collection.author_id}
                userCanEdit={userCanEdit}
                accessDenied={accessDenied}
                setReload={setReload}
                playIds={playIds}
                copyToClipboard={copyToClipboard}
                isCopied={isCopied}
              />
            </Box>
          </Box>
        </Box>
        {/* --- End Header Section --- */}

        {collection.description && (
          <Typography
            variant="body1"
            className="w-full px-2 text-center text-lg"
          >
            <Typography component="strong" className="tracking-tight">
              Description:{" "}
            </Typography>
            {collection.description}
          </Typography>
        )}
        {accessDenied ? (
          <Box className="flex w-full flex-col items-center justify-center gap-4 p-4">
            <LockIcon sx={{ fontSize: "96px" }} />
            <Typography variant="h6" className="text-lg font-bold">
              This collection is private!
            </Typography>
          </Box>
        ) : (
          <Box
            ref={scrollableContainerRef}
            // id="collection-plays-scroll-container"
            className="w-full"
            sx={{
              width: `${isMobile ? "100%" : "80%"}`,
              px: 1,
            }}
          >
            {loading && plays.length === 0 ? (
              <Box className="flex h-full w-full items-center justify-center p-4">
                <CircularProgress size={60} />
              </Box>
            ) : plays.length > 0 || hasMore ? (
              <InfiniteScroll
                dataLength={plays.length}
                next={loadMorePlays}
                hasMore={hasMore}
                loader={
                  <Box
                    sx={{ display: "flex", justifyContent: "center", my: 2 }}
                  >
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
                      — End of the plays —
                    </Typography>
                  )
                }
                // scrollableTarget="collection-plays-scroll-container"
              >
                <Box className="flex flex-col gap-6">
                  {plays.map((play) => (
                    <PlayPreview
                      preview={play}
                      key={play.play.id}
                      setReload={setReload}
                      collectionId={collection.id}
                      collectionAuthor={collection.author_id}
                    />
                  ))}
                </Box>
              </InfiniteScroll>
            ) : (
              !loading &&
              !hasMore && <EmptyMessage message="plays in this collection" />
            )}
          </Box>
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
    )
  );
};

export default Collection;
