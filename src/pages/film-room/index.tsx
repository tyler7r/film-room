import { Divider, Pagination } from "@mui/material";
import { useEffect, useState } from "react";
import AddVideo from "~/components/add-video";
import EmptyMessage from "~/components/empty-msg";
import PageTitle from "~/components/page-title";
import Video from "~/components/video";
import VideoSearchFilters from "~/components/video-search-filters";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { getNumberOfPages, getToAndFrom } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { VideoType } from "~/utils/types";

export type SearchOptions = {
  currentAffiliation?: string;
  privateOnly?: boolean;
  topic?: string;
};

const FilmRoomHome = () => {
  const { user } = useAuthContext();
  const { isMobile } = useMobileContext();

  const [videos, setVideos] = useState<VideoType[] | null>(null);
  const [page, setPage] = useState<number>(1);
  const [videoCount, setVideoCount] = useState<number | null>(null);
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    currentAffiliation: user.currentAffiliation?.team.id,
    privateOnly: false,
    topic: "",
  });

  const itemsPerPage = isMobile ? 10 : 20;

  const fetchVideos = async (options?: SearchOptions) => {
    const { from, to } = getToAndFrom(itemsPerPage, page);
    const videos = supabase
      .from("videos")
      .select("*", { count: "exact" })
      .order("uploaded_at", { ascending: false })
      .range(from, to);
    if (options?.currentAffiliation) {
      void videos.or(
        `private.eq.false, exclusive_to.eq.${options.currentAffiliation}`,
      );
    } else {
      void videos.eq("private", false);
    }
    if (options?.privateOnly) {
      void videos.eq("private", true);
    }
    if (options?.topic && options.topic !== "") {
      void videos.or(
        `title.ilike.%${options.topic}%, tournament.ilike.%${options.topic}%, division.ilike.%${options.topic}%, week.ilike.%${options.topic}%, season.ilike.%${options.topic}%, keywords.ilike.%${options.topic}%`,
      );
    }

    const { data, count } = await videos;
    if (data && data.length > 0) setVideos(data);
    else setVideos(null);
    if (count) setVideoCount(count);
    else setVideoCount(null);
  };

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
          void fetchVideos(searchOptions);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    setSearchOptions({
      ...searchOptions,
      currentAffiliation: user.currentAffiliation?.team.id,
    });
  }, [user]);

  useEffect(() => {
    if (page === 1) void fetchVideos(searchOptions);
    else setPage(1);
  }, [searchOptions, isMobile]);

  useEffect(() => {
    void fetchVideos(searchOptions);
  }, [page]);

  return (
    <div className="mb-4 flex w-full flex-col items-center justify-center p-4">
      <PageTitle title="The Film Room" size="x-large" />
      <AddVideo />
      <Divider
        flexItem
        variant="middle"
        sx={{ marginBottom: "16px" }}
      ></Divider>
      <VideoSearchFilters
        searchOptions={searchOptions}
        setSearchOptions={setSearchOptions}
      />
      <div className="mt-6 flex w-4/5 flex-col items-center justify-center gap-6">
        {videos?.map((v) => <Video video={v} key={v.id} />)}
        {!videos && <EmptyMessage message="videos" size="large" />}
      </div>
      {videos && videoCount && (
        <Pagination
          showFirstButton
          showLastButton
          sx={{ marginTop: "24px" }}
          size="medium"
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
