import { Pagination } from "@mui/material";
import { useEffect, useState } from "react";
import EmptyMessage from "~/components/empty-msg";
import PlayPreview from "~/components/play_preview";
import { useMobileContext } from "~/contexts/mobile";
import { getNumberOfPages, getToAndFrom } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import { PlayPreviewType } from "~/utils/types";

export type FeedProps = {
  profileId: string | undefined;
  currentAffiliation: string | undefined;
};

const CreatedFeed = ({ profileId, currentAffiliation }: FeedProps) => {
  const { isMobile } = useMobileContext();
  const itemsPerPage = isMobile ? 10 : 20;

  const [page, setPage] = useState<number>(1);
  const [playCount, setPlayCount] = useState<number | null>(null);

  const [plays, setPlays] = useState<PlayPreviewType[] | null>(null);

  const fetchCreatedPlays = async () => {
    const { from, to } = getToAndFrom(itemsPerPage, page);
    if (profileId) {
      const plays = supabase
        .from("play_preview")
        .select("*", { count: "exact" })
        .eq("play->>author_id", profileId)
        .range(from, to);
      if (currentAffiliation) {
        void plays.or(
          `play->>private.eq.false, play->>exclusive_to.eq.${currentAffiliation}`,
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

  const handlePageChange = (e: React.ChangeEvent<unknown>, value: number) => {
    e.preventDefault();
    setPage(value);
  };

  useEffect(() => {
    if (page === 1) void fetchCreatedPlays();
    else setPage(1);
  }, [isMobile]);

  useEffect(() => {
    void fetchCreatedPlays();
  }, [profileId, currentAffiliation]);

  return plays ? (
    <div className="flex flex-col items-center justify-center">
      <div className="grid grid-cols-1 gap-6">
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
    <EmptyMessage size="medium" message="user created plays" />
  );
};

export default CreatedFeed;
