import { Pagination } from "@mui/material";
import { useEffect, useState } from "react";
import EmptyMessage from "~/components/utils/empty-msg";
import PageTitle from "~/components/utils/page-title";
import CreateVideo from "~/components/videos/create-video";
import Video from "~/components/videos/video";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import useDebounce from "~/utils/debounce";
import { getNumberOfPages, getToAndFrom } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { VideoType } from "~/utils/types";

type SearchVideosProps = {
  topic: string;
};

const SearchVideos = ({ topic }: SearchVideosProps) => {
  const { isMobile } = useMobileContext();
  const { affIds } = useAuthContext();

  const [loading, setLoading] = useState<boolean>(true);
  const [videos, setVideos] = useState<VideoType[] | null>(null);
  const [videoCount, setVideoCount] = useState<number | null>(null);

  const [page, setPage] = useState<number>(1);
  const itemsPerPage = isMobile ? 10 : 50;

  const fetchVideos = useDebounce(async () => {
    const { from, to } = getToAndFrom(itemsPerPage, page);
    const videos = supabase
      .from("videos")
      .select("*", { count: "exact" })
      .ilike("title", `%${topic}%`)
      .order("uploaded_at", { ascending: false })
      .range(from, to);
    if (affIds && affIds.length > 0) {
      void videos.or(`private.eq.false, exclusive_to.in.(${affIds})`);
    } else {
      void videos.eq("private", false);
    }
    const { data, count } = await videos;
    if (data && data.length > 0) setVideos(data);
    else setVideos(null);
    if (count) setVideoCount(count);
    else setVideoCount(null);
    setLoading(false);
  });

  const handlePageChange = (e: React.ChangeEvent<unknown>, value: number) => {
    e.preventDefault();
    setPage(value);
  };

  // useEffect(() => {
  //   const channel = supabase
  //     .channel("team_video_changes")
  //     .on(
  //       "postgres_changes",
  //       { event: "*", schema: "public", table: "team_videos" },
  //       () => {
  //         void fetchVideos();
  //       },
  //     )
  //     .subscribe();

  //   return () => {
  //     void supabase.removeChannel(channel);
  //   };
  // }, []);

  // useEffect(() => {
  //   const channel = supabase
  //     .channel("video_changes")
  //     .on(
  //       "postgres_changes",
  //       { event: "*", schema: "public", table: "videos" },
  //       () => {
  //         void fetchVideos();
  //       },
  //     )
  //     .subscribe();

  //   return () => {
  //     void supabase.removeChannel(channel);
  //   };
  // }, []);

  useEffect(() => {
    if (page === 1) void fetchVideos();
    else setPage(1);
  }, [topic, isMobile, affIds]);

  useEffect(() => {
    void fetchVideos();
  }, [page]);

  return (
    <div className="flex w-4/5 flex-col items-center justify-center gap-4">
      {loading && <PageTitle title="Loading..." size="medium" />}
      {!loading && <CreateVideo />}
      {videoCount && (
        <div className="font-bold tracking-tight">
          {videoCount} results found
        </div>
      )}
      {!videos && !loading && <EmptyMessage message="videos" />}
      <div className="flex w-full flex-wrap justify-center gap-6">
        {videos?.map((v) => <Video video={v} key={v.id} />)}
      </div>
      {videos && videoCount && (
        <Pagination
          siblingCount={1}
          boundaryCount={0}
          size={isMobile ? "small" : "medium"}
          showFirstButton
          showLastButton
          sx={{ marginTop: "8px" }}
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
