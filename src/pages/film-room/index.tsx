import { Box, Divider, Pagination } from "@mui/material";
import { useEffect, useState } from "react";
import VideoSearchFilters from "~/components/search-filters/video-search-filters";
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

export type SearchOptions = {
  privateOnly?: string;
  topic?: string;
};

const FilmRoomHome = () => {
  const { affIds } = useAuthContext();
  const { isMobile } = useMobileContext();

  const [videos, setVideos] = useState<VideoType[] | null>(null);
  const [page, setPage] = useState<number>(1);
  const [videoCount, setVideoCount] = useState<number | null>(null);
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    privateOnly: "all",
    topic: "",
  });

  const itemsPerPage = isMobile ? 10 : 20;

  const fetchVideos = useDebounce(async () => {
    const { from, to } = getToAndFrom(itemsPerPage, page);
    const videos = supabase
      .from("videos")
      .select("*", { count: "exact" })
      .order("uploaded_at", { ascending: false })
      .range(from, to);
    if (affIds && affIds.length > 0) {
      if (searchOptions.privateOnly === "all") {
        void videos.or(`private.eq.false, exclusive_to.in.(${affIds})`);
      } else if (
        searchOptions.privateOnly &&
        searchOptions.privateOnly !== "all"
      ) {
        void videos.eq("exclusive_to", searchOptions.privateOnly);
      }
    } else {
      void videos.eq("private", false);
    }
    if (searchOptions.topic && searchOptions.topic !== "") {
      void videos.or(
        `title.ilike.%${searchOptions.topic}%, tournament.ilike.%${searchOptions.topic}%, division.ilike.%${searchOptions.topic}%, week.ilike.%${searchOptions.topic}%, season.ilike.%${searchOptions.topic}%, keywords.ilike.%${searchOptions.topic}%`,
      );
    }

    const { data, count } = await videos;
    if (data && data.length > 0) setVideos(data);
    else setVideos(null);
    if (count) setVideoCount(count);
    else setVideoCount(null);
  });

  const handleChange = (e: React.ChangeEvent<unknown>, value: number) => {
    e.preventDefault();
    setPage(value);
  };

  useEffect(() => {
    const channel = supabase
      .channel("video_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "videos" },
        () => {
          void fetchVideos();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "team_videos" },
        () => {
          void fetchVideos();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (page === 1) void fetchVideos();
    else setPage(1);
  }, [searchOptions, isMobile]);

  useEffect(() => {
    void fetchVideos();
  }, [page]);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 p-4">
      <div className="flex w-full flex-col items-center justify-center gap-4">
        <PageTitle title="The Film Room" size="large" />
        <CreateVideo standaloneTrigger={true} />
        <Divider flexItem variant="middle"></Divider>
        <VideoSearchFilters
          searchOptions={searchOptions}
          setSearchOptions={setSearchOptions}
        />
      </div>
      <Box
        sx={{
          display: "grid",
          width: "100%",
          gridTemplateColumns: {
            xs: "repeat(auto-fit, minmax(280px, 1fr))", // Min width for video card
            sm: "repeat(2, minmax(280px, 1fr))", // 2 columns on small screens
            md: "repeat(3, minmax(280px, 1fr))", // 3 columns on medium screens
          },
          gap: { xs: 2, md: 3 },
        }}
      >
        {videos?.map((v) => <Video video={v} key={v.id} />)}
        {!videos && <EmptyMessage message="videos" />}
      </Box>
      {videos && videoCount && (
        <Pagination
          siblingCount={1}
          boundaryCount={0}
          size={isMobile ? "small" : "medium"}
          showFirstButton
          showLastButton
          sx={{ marginTop: "16px" }}
          variant="text"
          shape="rounded"
          count={getNumberOfPages(itemsPerPage, videoCount)}
          page={page}
          onChange={handleChange}
        />
      )}
    </div>
  );
};

export default FilmRoomHome;
