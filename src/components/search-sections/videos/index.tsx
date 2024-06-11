import { Pagination } from "@mui/material";
import { useEffect, useState } from "react";
import EmptyMessage from "~/components/empty-msg";
import Video from "~/components/video";
import { useMobileContext } from "~/contexts/mobile";
import { SearchOptions } from "~/pages/search";
import { getNumberOfPages, getToAndFrom } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import { VideoType } from "~/utils/types";

type SearchVideosProps = {
  options: SearchOptions;
  topic: string;
};

const SearchVideos = ({ options, topic }: SearchVideosProps) => {
  const { isMobile } = useMobileContext();

  const [videos, setVideos] = useState<VideoType[] | null>(null);
  const [videoCount, setVideoCount] = useState<number | null>(null);

  const [page, setPage] = useState<number>(1);
  const itemsPerPage = isMobile ? 10 : 20;

  const fetchVideos = async (options?: SearchOptions) => {
    const { from, to } = getToAndFrom(itemsPerPage, page);
    const videos = supabase
      .from("videos")
      .select("*", { count: "exact" })
      .ilike("title", `%${topic}%`)
      .range(from, to);
    if (options?.currentAffiliation) {
      void videos.or(
        `private.eq.false, exclusive_to.eq.${options.currentAffiliation}`,
      );
    } else {
      void videos.eq("private", false);
    }
    const { data, count } = await videos;
    if (data && data.length > 0) setVideos(data);
    else setVideos(null);
    if (count) setVideoCount(count);
    else setVideoCount(null);
  };

  const handlePageChange = (e: React.ChangeEvent<unknown>, value: number) => {
    e.preventDefault();
    setPage(value);
  };

  useEffect(() => {
    if (page === 1) void fetchVideos();
    else setPage(1);
  }, [topic, isMobile]);

  useEffect(() => {
    void fetchVideos(options);
  }, [page, options]);

  return (
    <div className="mt-2 flex w-11/12 flex-col items-center justify-center gap-6">
      {!videos && <EmptyMessage message="videos" />}
      {videos?.map((v) => <Video video={v} key={v.id} />)}
      {videos && videoCount && (
        <Pagination
          showFirstButton
          showLastButton
          sx={{ marginTop: "8px" }}
          size="small"
          variant="text"
          shape="rounded"
          count={getNumberOfPages(itemsPerPage, videoCount)}
          page={page}
          onChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default SearchVideos;
