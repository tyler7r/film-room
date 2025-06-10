import LinkIcon from "@mui/icons-material/Link";
import LockIcon from "@mui/icons-material/Lock";
import PublicIcon from "@mui/icons-material/Public";
import { colors, Divider, IconButton, Pagination } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import PlaysToCollectionModal from "~/components/collections/add-plays-to-collection";
import CollectionActionsMenu from "~/components/collections/collection-actions-menu";
import PlayPreview from "~/components/plays/play_preview";
import TeamLogo from "~/components/teams/team-logo";
import EmptyMessage from "~/components/utils/empty-msg";
import PageTitle from "~/components/utils/page-title";
import StandardPopover from "~/components/utils/standard-popover";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { useIsDarkContext } from "~/pages/_app";
import {
  convertTimestamp,
  getNumberOfPages,
  getToAndFrom,
} from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { CollectionType, PlayPreviewType } from "~/utils/types";

const Collection = () => {
  const { affIds, affiliations, user } = useAuthContext();
  const router = useRouter();
  const { isMobile } = useMobileContext();
  const { hoverText, isDark } = useIsDarkContext();

  const id = router.query.id as string;
  const itemsPerPage = isMobile ? 5 : 10;

  const [collection, setCollection] = useState<CollectionType | null>(null);
  const [plays, setPlays] = useState<PlayPreviewType[] | null>(null);
  const [playIds, setPlaysIds] = useState<string[] | null>(null);

  const [authorName, setAuthorName] = useState<string | null>(null);
  const [userCanEdit, setUserCanEdit] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [reload, setReload] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const [playCount, setPlayCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [accessDenied, setAccessDenied] = useState(true);
  const topRef = useRef<HTMLDivElement | null>(null);

  const handlePopoverOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setIsCopied(false);
  };

  const open = Boolean(anchorEl);

  const exclusiveTeam = affiliations?.find(
    (aff) => aff.team.id === collection?.exclusive_to,
  )?.team;

  const scrollToTop = () => {
    if (topRef) topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchCollection = async () => {
    if (id) {
      const { data } = await supabase
        .from("collections")
        .select("*, profiles(name)")
        .eq("id", id)
        .single();
      if (data) {
        setCollection(data);
        if (data.exclusive_to) {
          const accessAllowed = affIds?.includes(data.exclusive_to);
          if (!accessAllowed) {
            setAccessDenied(true);
          } else setAccessDenied(false);
        } else setAccessDenied(false);
      } else setCollection(null);
      if (data?.profiles?.name) setAuthorName(data.profiles.name);
    }
  };

  const fetchPlays = async () => {
    const { from, to } = getToAndFrom(itemsPerPage, page);
    if (id) {
      const plays = supabase
        .from("collection_plays_view")
        .select("*", { count: "exact" })
        .eq("collection->>id", id)
        .order("play->>created_at", { ascending: false })
        .range(from, to);
      if (affIds && affIds.length > 0) {
        void plays.or(
          `play->>private.eq.false, play->>exclusive_to.in.(${affIds})`,
        );
      } else {
        void plays.eq("play->>private", false);
      }
      const { data, count } = await plays;
      if (data && data.length > 0) {
        setPlays(data);
        setPlaysIds(data.map((play) => play.play.id));
      } else {
        setPlays(null);
        setPlaysIds(null);
      }
      if (count && count > 0) setPlayCount(count);
      else setPlayCount(0);
    }
  };

  const handlePageChange = (e: React.ChangeEvent<unknown>, value: number) => {
    e.preventDefault();
    scrollToTop();
    setPage(value);
  };

  const checkIfUserCanEdit = () => {
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
  };

  const copyToClipboard = () => {
    const origin = window.location.origin;
    void navigator.clipboard.writeText(`${origin}/collections/${id}`);
    setIsCopied(true);
  };

  useEffect(() => {
    const channel = supabase
      .channel("collection_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "collections" },
        () => {
          void fetchPlays();
          void fetchCollection();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "plays" },
        () => {
          void fetchPlays();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "play_mentions" },
        () => {
          void fetchPlays();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "play_tags" },
        () => {
          void fetchPlays();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    void fetchPlays();
    void fetchCollection();
  }, [id, affIds]);

  useEffect(() => {
    if (reload) {
      void fetchPlays();
      void fetchCollection();
      setReload(false);
    } else return;
  }, [reload]);

  useEffect(() => {
    checkIfUserCanEdit();
  }, [collection, user]);

  useEffect(() => {
    void fetchPlays();
  }, [page]);

  return (
    collection && (
      <div className="flex flex-col items-center justify-center gap-6 p-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center gap-2">
            {exclusiveTeam?.logo ? (
              <TeamLogo tm={exclusiveTeam} size={60} popover={true} />
            ) : (
              <PublicIcon fontSize="large" color="action" />
            )}
          </div>
          <div className="flex flex-col gap-1">
            <PageTitle title={collection.title} size="small" />
            <div className="flex items-center justify-center gap-2">
              <div className="text-sm font-light">
                {convertTimestamp(collection.created_at)}
              </div>
              <Divider flexItem orientation="vertical" variant="middle" />
              {authorName && (
                <div
                  onClick={() =>
                    void router.push(`/profile/${collection.author_id}`)
                  }
                  className={`${hoverText} text-lg font-bold tracking-tight`}
                >
                  {authorName}
                </div>
              )}
            </div>
          </div>
          <div
            className="flex flex-col items-center justify-center gap-1 rounded-lg p-3"
            style={
              isDark
                ? { backgroundColor: `${colors.purple[200]}` }
                : { backgroundColor: `${colors.purple[50]}` }
            }
          >
            <div className="text-3xl font-bold leading-5 tracking-tight">
              {playCount}
            </div>
            <div className="text-lg font-bold leading-4 tracking-tight">
              plays
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            {userCanEdit && !accessDenied && (
              <PlaysToCollectionModal
                collectionId={collection.id}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                setReload={setReload}
                playIds={playIds}
              />
            )}
            {user.userId === collection.author_id && (
              <CollectionActionsMenu collection={collection} />
            )}
            <IconButton
              onClick={copyToClipboard}
              onMouseEnter={handlePopoverOpen}
              onMouseLeave={handlePopoverClose}
              size="small"
            >
              <LinkIcon />
              <StandardPopover
                open={open}
                anchorEl={anchorEl}
                content={isCopied ? "Copied!" : `Copy collection link`}
                handlePopoverClose={handlePopoverClose}
              />
            </IconButton>
          </div>
        </div>
        {collection.description && (
          <div className="w-full text-center text-lg">
            <strong className="tracking-tight">Description: </strong>
            {collection.description}
          </div>
        )}
        {accessDenied ? (
          <div className="flex w-full flex-col items-center justify-center gap-4 p-4">
            <LockIcon sx={{ fontSize: "96px" }} />
            <div className="text-lg font-bold">This collection is private!</div>
          </div>
        ) : (
          <div className="">
            <div ref={topRef} className="flex flex-col gap-6">
              {plays?.map((play) => (
                <PlayPreview
                  preview={play}
                  key={play.play.id}
                  setReload={setReload}
                  collectionId={collection.id}
                  collectionAuthor={collection.author_id}
                />
              ))}
            </div>
            {playCount > 0 && (
              <Pagination
                siblingCount={1}
                boundaryCount={0}
                size={isMobile ? "small" : "medium"}
                showFirstButton
                showLastButton
                sx={{ marginTop: "8px" }}
                variant="text"
                shape="rounded"
                count={getNumberOfPages(itemsPerPage, playCount)}
                page={page}
                onChange={handlePageChange}
              />
            )}
            {!plays && <EmptyMessage message="plays in this collection" />}
          </div>
        )}
      </div>
    )
  );
};

export default Collection;
