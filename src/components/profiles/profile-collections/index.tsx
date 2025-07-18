import { Box, CircularProgress, Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import Collection from "~/components/collections/collection";
import CreateCollection from "~/components/collections/create-collection";
import EmptyMessage from "~/components/utils/empty-msg";
import PageTitle from "~/components/utils/page-title";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { CollectionViewType } from "~/utils/types";

type ProfileCollectionsProps = {
  profileId: string;
};

const ProfileCollections = ({ profileId }: ProfileCollectionsProps) => {
  const { isMobile } = useMobileContext();
  const { isDark } = useIsDarkContext();
  const { user } = useAuthContext();

  const [collections, setCollections] = useState<CollectionViewType[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [currentOffset, setCurrentOffset] = useState<number>(0);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);

  const [showScrollDownIndicator, setShowScrollDownIndicator] = useState(false);

  const scrollableContainerRef = useRef<HTMLDivElement>(null);

  const itemsPerPage = isMobile ? 5 : 10;

  const checkScrollPosition = useCallback(() => {
    if (scrollableContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        scrollableContainerRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50;
      const isScrollable = scrollHeight > clientHeight;
      const isAtTop = scrollTop === 0;

      setShowScrollDownIndicator(isScrollable && !isAtBottom && isAtTop);
    }
  }, [hasMore]);

  const fetchCollections = useCallback(
    async (offsetToFetch: number, append = true) => {
      if (!profileId) {
        if (!append) {
          setLoadingInitial(false);
        }
        setHasMore(false);
        return;
      }
      if (!append) {
        setLoadingInitial(true);
        setCollections([]);
        setCurrentOffset(0);
        setHasMore(true);
      }

      try {
        const { data, error } = await supabase
          .from("collection_view")
          .select("*", { count: "exact" })
          .eq("collection->>author_id", profileId)
          .order("collection->>created_at", { ascending: false })
          .range(offsetToFetch, offsetToFetch + itemsPerPage - 1);

        if (error) {
          console.error("Error fetching collections:", error);
          setHasMore(false);
          return;
        }

        if (data) {
          setCollections((prev) => {
            const newCollections = append ? [...prev, ...data] : data;
            return newCollections;
          });
          setCurrentOffset(offsetToFetch + data.length);
          setHasMore(data.length === itemsPerPage);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Unexpected error in fetchCollections: ", error);
        setHasMore(false);
      } finally {
        setLoadingInitial(false);
      }
    },
    [profileId, itemsPerPage],
  );

  useEffect(() => {
    void fetchCollections(0, false);
  }, [profileId, isMobile, fetchCollections]);

  const loadMoreCollections = () => {
    void fetchCollections(currentOffset, true);
  };

  useEffect(() => {
    const currentRef = scrollableContainerRef.current;
    if (currentRef) {
      currentRef.addEventListener("scroll", checkScrollPosition);
    }

    setTimeout(() => {
      checkScrollPosition();
    }, 150);

    return () => {
      if (currentRef) {
        currentRef.removeEventListener("scroll", checkScrollPosition);
      }
    };
  }, [checkScrollPosition, collections.length, hasMore]);

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        p: 1,
      }}
    >
      <Box
        sx={{
          display: "flex",
          width: "100%",
          gap: 2,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <PageTitle size="small" title="User Collections" />
        {user.userId === profileId && (
          <CreateCollection icon={true} standaloneTrigger={true} />
        )}
      </Box>

      <Box
        id="collectionsScrollableContainer"
        ref={scrollableContainerRef}
        sx={{
          flexGrow: 1,
          position: "relative",
          overflowY: "auto",
          maxHeight: { xs: "300px", md: "400px" },
          p: 0.5,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          // Removed alignItems: "center" here to allow collections to fill width
          width: "100%",
        }}
      >
        {loadingInitial && collections.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "150px",
            }}
          >
            <CircularProgress size={60} />
          </Box>
        ) : (
          <InfiniteScroll
            dataLength={collections.length}
            next={loadMoreCollections}
            hasMore={hasMore}
            loader={
              <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                <CircularProgress />
              </Box>
            }
            endMessage={
              collections.length > 0 &&
              !loadingInitial && (
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    color: "text.disabled",
                    textAlign: "center",
                    my: 1,
                    mx: 1,
                  }}
                >
                  — End of Collections —
                </Typography>
              )
            }
            scrollableTarget="collectionsScrollableContainer"
            scrollThreshold={0.9}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                gap: 1,
              }}
            >
              {collections.map((collection) => (
                <Collection
                  key={collection.collection.id}
                  collection={collection}
                  small={true}
                />
              ))}
            </Box>
          </InfiniteScroll>
        )}

        {collections.length === 0 && !loadingInitial && (
          <Box
            sx={{ display: "flex", width: "100%", justifyContent: "center" }}
          >
            <EmptyMessage message="collections" />
          </Box>
        )}

        {showScrollDownIndicator && (
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              zIndex: 1,
              background: !isDark ? "black" : "white",
              py: 1,
              pointerEvents: "none",
              transition: "opacity 0.3s ease-in-out",
              opacity: 1,
            }}
          >
            <Typography
              sx={{
                pointerEvents: "auto",
                fontWeight: "bold",
                fontSize: "12px",
              }}
              variant="button"
              color={!isDark ? "white" : "black"}
            >
              Scroll for more
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProfileCollections;
