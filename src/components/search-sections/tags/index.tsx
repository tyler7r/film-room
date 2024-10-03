import { Pagination } from "@mui/material";
import { useEffect, useState } from "react";
import PlayPreview from "~/components/plays/play_preview";
import EmptyMessage from "~/components/utils/empty-msg";
import PageTitle from "~/components/utils/page-title";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import useDebounce from "~/utils/debounce";
import { getNumberOfPages, getToAndFrom } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { PlayPreviewType } from "~/utils/types";

type SearchPlayTagsProps = {
  topic: string;
};

const SearchPlayTags = ({ topic }: SearchPlayTagsProps) => {
  const { isMobile } = useMobileContext();
  const { affIds } = useAuthContext();

  const [loading, setLoading] = useState<boolean>(true);
  const [playTags, setPlayTags] = useState<PlayPreviewType[] | null>(null);
  const [playCount, setPlayCount] = useState<number | null>(null);

  const [page, setPage] = useState<number>(1);
  const itemsPerPage = isMobile ? 5 : 10;

  const fetchPlaysByTag = useDebounce(async () => {
    const { from, to } = getToAndFrom(itemsPerPage, page);
    const plays = supabase
      .from("plays_via_tag")
      .select("*", { count: "exact" })
      .order("play->>created_at", { ascending: false })
      .range(from, to);
    if (affIds && affIds.length > 0) {
      void plays.or(
        `play->>private.eq.false, play->>exclusive_to.in.(${affIds})`,
      );
      void plays.or(
        `tag->>private.eq.false, tag->>exclusive_to.in.(${affIds})`,
      );
    } else {
      void plays.eq("play->>private", false);
      void plays.eq("tag->>private", false);
    }
    if (topic !== "") {
      void plays.ilike("tag->>title", `%${topic}%`);
    }
    const { data, count } = await plays;
    const uniquePlays = [...new Map(data?.map((x) => [x.play.id, x])).values()];
    setPlayTags(uniquePlays.length > 0 ? uniquePlays : null);
    if (uniquePlays.length > 0) setPlayCount(uniquePlays.length);
    else setPlayCount(null);
    if (!count) setPlayCount(null);
    setLoading(false);
  });

  const handlePageChange = (e: React.ChangeEvent<unknown>, value: number) => {
    e.preventDefault();
    setPage(value);
  };

  useEffect(() => {
    const channel = supabase
      .channel("tag_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "play_tags" },
        () => {
          void fetchPlaysByTag();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("play_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "plays" },
        () => {
          void fetchPlaysByTag();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("mention_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "play_mentions" },
        () => {
          void fetchPlaysByTag();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (page === 1) void fetchPlaysByTag();
    else setPage(1);
  }, [topic, isMobile, affIds]);

  useEffect(() => {
    void fetchPlaysByTag();
  }, [page]);

  return (
    <div className="flex w-4/5 flex-col items-center justify-center gap-4">
      {loading && <PageTitle title="Loading..." size="medium" />}
      {playCount && (
        <div className="font-bold tracking-tight">
          {playCount} results found
        </div>
      )}
      {!playTags && !loading && (
        <EmptyMessage size="large" message="plays with that tag" />
      )}
      {playTags?.map((play) => (
        <PlayPreview key={play.play.id} preview={play} />
      ))}
      {playTags && playCount && (
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
    </div>
  );
};

export default SearchPlayTags;
