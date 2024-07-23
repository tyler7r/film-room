import { Pagination } from "@mui/material";
import { useEffect, useState } from "react";
import EmptyMessage from "~/components/empty-msg";
import PlayPreview from "~/components/play_preview";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { getNumberOfPages, getToAndFrom } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { PlayPreviewType } from "~/utils/types";

type SearchPlayTagsProps = {
  topic: string;
};

const SearchPlayTags = ({ topic }: SearchPlayTagsProps) => {
  const { isMobile } = useMobileContext();
  const { affIds } = useAuthContext();

  const [playTags, setPlayTags] = useState<PlayPreviewType[] | null>(null);
  const [playCount, setPlayCount] = useState<number | null>(null);

  const [page, setPage] = useState<number>(1);
  const itemsPerPage = isMobile ? 10 : 20;

  const fetchPlaysByTag = async () => {
    const { from, to } = getToAndFrom(itemsPerPage, page);
    const plays = supabase
      .from("plays_via_tag")
      .select("*", { count: "exact" })
      .ilike("tag->>title", topic ? `%${topic}%` : "%%")
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
    const uniquePlays = [...new Map(data?.map((x) => [x.play.id, x])).values()];
    setPlayTags(uniquePlays.length > 0 ? uniquePlays : null);
    if (uniquePlays.length > 0) setPlayCount(uniquePlays.length);
    else setPlayCount(null);
    if (!count) setPlayCount(null);
  };

  const handlePageChange = (e: React.ChangeEvent<unknown>, value: number) => {
    e.preventDefault();
    setPage(value);
  };

  useEffect(() => {
    if (page === 1) void fetchPlaysByTag();
    else setPage(1);
  }, [topic, isMobile, affIds]);

  useEffect(() => {
    void fetchPlaysByTag();
  }, [page]);

  return (
    <div className="mt-2 flex w-11/12 flex-col items-center justify-center gap-6">
      {!playTags && <EmptyMessage size="large" message="plays with that tag" />}
      {playTags?.map((play) => (
        <PlayPreview key={play.play.id} preview={play} />
      ))}
      {playTags && playCount && (
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
    </div>
  );
};

export default SearchPlayTags;
