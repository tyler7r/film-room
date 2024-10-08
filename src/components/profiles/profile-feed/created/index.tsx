import { Pagination } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import PlayPreview from "~/components/plays/play_preview";
import EmptyMessage from "~/components/utils/empty-msg";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { getNumberOfPages, getToAndFrom } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { PlayPreviewType } from "~/utils/types";

export type FeedProps = {
  profileId: string | undefined;
};

const CreatedFeed = ({ profileId }: FeedProps) => {
  const { isMobile } = useMobileContext();
  const { affIds } = useAuthContext();

  const itemsPerPage = isMobile ? 5 : 10;

  const [page, setPage] = useState<number>(1);
  const [playCount, setPlayCount] = useState<number | null>(null);

  const [plays, setPlays] = useState<PlayPreviewType[] | null>(null);

  const topRef = useRef<HTMLDivElement | null>(null);

  const fetchCreatedPlays = async () => {
    const { from, to } = getToAndFrom(itemsPerPage, page);
    if (profileId) {
      const plays = supabase
        .from("play_preview")
        .select("*", { count: "exact" })
        .eq("play->>author_id", profileId)
        .eq("play->>post_to_feed", true)
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
      if (data && data.length > 0) setPlays(data);
      else setPlays(null);
      if (count) setPlayCount(count);
    }
  };

  const scrollToTop = () => {
    if (topRef) topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePageChange = (e: React.ChangeEvent<unknown>, value: number) => {
    e.preventDefault();
    setPage(value);
    scrollToTop();
  };

  useEffect(() => {
    const channel = supabase
      .channel("play_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "plays" },
        () => {
          void fetchCreatedPlays();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "play_mentions" },
        () => {
          void fetchCreatedPlays();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "play_tags" },
        () => {
          void fetchCreatedPlays();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (page === 1) void fetchCreatedPlays();
    else setPage(1);
  }, [isMobile]);

  useEffect(() => {
    void fetchCreatedPlays();
  }, [profileId, affIds, page]);

  return plays ? (
    <div className="flex flex-col items-center justify-center">
      <div className="grid grid-cols-1 justify-center gap-6" ref={topRef}>
        {plays.map((play) => (
          <PlayPreview key={play.play.id} preview={play} />
        ))}
      </div>
      {playCount && (
        <Pagination
          siblingCount={1}
          boundaryCount={0}
          size={isMobile ? "small" : "medium"}
          showFirstButton
          showLastButton
          sx={{ marginTop: "32px", marginBottom: "8px" }}
          variant="text"
          shape="rounded"
          count={getNumberOfPages(itemsPerPage, playCount)}
          page={page}
          onChange={handlePageChange}
        />
      )}
    </div>
  ) : (
    <EmptyMessage size="medium" message="user created plays" />
  );
};

export default CreatedFeed;
