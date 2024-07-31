import AddIcon from "@mui/icons-material/Add";
import PublicIcon from "@mui/icons-material/Public";
import { colors, Divider, IconButton, Pagination } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import EmptyMessage from "~/components/empty-msg";
import PageTitle from "~/components/page-title";
import PlayPreview from "~/components/play_preview";
import TeamLogo from "~/components/team-logo";
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
  const itemsPerPage = isMobile ? 10 : 20;

  const [collection, setCollection] = useState<CollectionType | null>(null);
  const [plays, setPlays] = useState<PlayPreviewType[] | null>(null);
  const [authorName, setAuthorName] = useState<string | null>(null);
  const [userCanEdit, setUserCanEdit] = useState<boolean>(false);

  const [playCount, setPlayCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);

  const exclusiveTeam = affiliations?.find(
    (aff) => aff.team.id === collection?.exclusive_to,
  )?.team;

  const fetchCollection = async () => {
    if (id) {
      const { data } = await supabase
        .from("collections")
        .select("*, profiles(name)")
        .eq("id", id)
        .single();
      if (data) setCollection(data);
      else setCollection(null);
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
        .range(from, to);
      if (affIds) {
        void plays.or(
          `play->>private.eq.false, play->>exclusive_to.in.(${affIds})`,
        );
      } else {
        void plays.eq("play->>private", false);
      }
      const { data, count } = await plays;
      if (data && data.length > 0) {
        setPlays(data);
      } else setPlays(null);
      if (count && count > 0) setPlayCount(count);
      else setPlayCount(0);
    }
  };

  const handlePageChange = (e: React.ChangeEvent<unknown>, value: number) => {
    e.preventDefault();
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

  useEffect(() => {
    const channel = supabase
      .channel("collection_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tags" },
        () => {
          void fetchPlays();
          void fetchCollection();
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
  }, [id]);

  useEffect(() => {
    checkIfUserCanEdit();
  }, [collection]);

  return (
    collection && (
      <div className="flex flex-col items-center justify-center gap-6 p-6">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center justify-center gap-1">
            <div className="flex items-center justify-center gap-2">
              {exclusiveTeam?.logo ? (
                <TeamLogo tm={exclusiveTeam} size={60} popover={true} />
              ) : (
                <PublicIcon fontSize="large" color="action" />
              )}
              <PageTitle title={collection.title} size="medium" />
            </div>
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
                  className={`${hoverText} font-serif text-lg font-bold italic`}
                >
                  {authorName}
                </div>
              )}
            </div>
          </div>
          <div
            className="flex flex-col items-center justify-center rounded-lg p-3"
            style={
              isDark
                ? { backgroundColor: `${colors.purple[200]}` }
                : { backgroundColor: `${colors.purple[50]}` }
            }
          >
            <div className="text-4xl font-bold">{playCount}</div>
            <div className="font-serif text-lg font-light italic leading-4 tracking-tight">
              plays
            </div>
          </div>
          {userCanEdit && (
            <IconButton color="primary" size="small">
              <AddIcon fontSize="large" />
            </IconButton>
          )}
        </div>
        <div className="flex flex-col gap-6">
          {plays?.map((play) => (
            <PlayPreview preview={play} key={play.play.id} />
          ))}
        </div>
        {playCount > 0 && (
          <Pagination
            showFirstButton
            showLastButton
            sx={{ marginTop: "8px" }}
            size="medium"
            variant="text"
            shape="rounded"
            count={getNumberOfPages(itemsPerPage, playCount)}
            page={page}
            onChange={handlePageChange}
          />
        )}
        {!plays && (
          <EmptyMessage message="plays in this collection" size="medium" />
        )}
      </div>
    )
  );
};

export default Collection;
