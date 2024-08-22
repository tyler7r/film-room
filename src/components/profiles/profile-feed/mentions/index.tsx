import { Pagination } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import PlayPreview from "~/components/plays/play_preview";
import EmptyMessage from "~/components/utils/empty-msg";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { getNumberOfPages, getToAndFrom } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { PlayPreviewType } from "~/utils/types";
import type { FeedProps } from "../created";

const MentionsFeed = ({ profileId }: FeedProps) => {
  const { isMobile } = useMobileContext();
  const { affIds } = useAuthContext();
  const itemsPerPage = isMobile ? 5 : 10;

  const [page, setPage] = useState<number>(1);
  const [playCount, setPlayCount] = useState<number | null>(null);

  const [plays, setPlays] = useState<PlayPreviewType[] | null>(null);

  const topRef = useRef<HTMLDivElement | null>(null);

  const fetchMentionPlays = async () => {
    const { from, to } = getToAndFrom(itemsPerPage, page);
    if (profileId) {
      const plays = supabase
        .from("plays_via_user_mention")
        .select("*", { count: "exact" })
        .eq("mention->>receiver_id", profileId)
        .order("play->>created_at", { ascending: false })
        .range(from, to);
      if (affIds) {
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

  useEffect(() => {
    const channel = supabase
      .channel("play_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "plays" },
        () => {
          void fetchMentionPlays();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "play_tags" },
        () => {
          void fetchMentionPlays();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "play_mentions" },
        () => {
          void fetchMentionPlays();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const scrollToTop = () => {
    if (topRef) topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePageChange = (e: React.ChangeEvent<unknown>, value: number) => {
    e.preventDefault();
    setPage(value);
    scrollToTop();
  };

  useEffect(() => {
    if (page === 1) void fetchMentionPlays();
    else setPage(1);
  }, [isMobile]);

  useEffect(() => {
    void fetchMentionPlays();
  }, [profileId, affIds, page]);

  return plays ? (
    <div className="flex flex-col items-center justify-center">
      <div
        className="grid grid-cols-1 items-center justify-center gap-6"
        ref={topRef}
      >
        {plays.map((play) => (
          <PlayPreview key={play.play.id} preview={play} />
        ))}
      </div>
      {playCount && (
        <Pagination
          showFirstButton
          showLastButton
          sx={{ marginTop: "32px", marginBottom: "8px" }}
          size="large"
          variant="text"
          shape="rounded"
          count={getNumberOfPages(itemsPerPage, playCount)}
          page={page}
          onChange={handlePageChange}
        />
      )}
    </div>
  ) : (
    <EmptyMessage size="medium" message="user mentions" />
  );
};

export default MentionsFeed;
