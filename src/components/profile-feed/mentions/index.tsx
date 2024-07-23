import { Pagination } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import EmptyMessage from "~/components/empty-msg";
import PlayPreview from "~/components/play_preview";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { getNumberOfPages, getToAndFrom } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { PlayPreviewType } from "~/utils/types";
import type { FeedProps } from "../created";

const MentionsFeed = ({ profileId }: FeedProps) => {
  const { isMobile } = useMobileContext();
  const { affIds } = useAuthContext();
  const itemsPerPage = isMobile ? 10 : 20;

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
      <div className="grid grid-cols-1 gap-6" ref={topRef}>
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
    <div className="mt-4">
      <EmptyMessage size="medium" message="user mentions" />
    </div>
  );
};

export default MentionsFeed;
