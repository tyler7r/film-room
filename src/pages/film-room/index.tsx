import DeleteIcon from "@mui/icons-material/Delete";
import { Button, Divider, Pagination } from "@mui/material";
import { useEffect, useState } from "react";
import AddVideo from "~/components/add-video";
import PageTitle from "~/components/page-title";
import Video from "~/components/video";
import VideoSearchFilters from "~/components/video-search-filters";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { getNumberOfPages, getToAndFrom } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { VideoType } from "~/utils/types";

export type SearchOptions = {
  title?: string;
  season?: string;
  currentAffiliation?: string;
  division?: string;
  privateOnly?: boolean;
};

const FilmRoomHome = () => {
  const { user } = useAuthContext();
  const { isMobile } = useMobileContext();

  const [videos, setVideos] = useState<VideoType[] | null>(null);
  const [page, setPage] = useState<number>(1);
  const [videoCount, setVideoCount] = useState<number | null>(null);
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({
    title: "",
    season: "",
    currentAffiliation: user.currentAffiliation?.team.id,
    division: "",
    privateOnly: false,
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
    if (options?.title) {
      void videos.ilike("title", `%${options.title}%`);
    }
    if (options?.division) {
      void videos.ilike("division", `%${options.division}%`);
    }
    if (options?.season) {
      void videos.ilike("season", `%${options.season}%`);
    }
    if (options?.privateOnly) {
      void videos.eq("private", true);
    }

    const { data, count } = await videos;
    if (data) setVideos(data);
    if (count) setVideoCount(count);
  };

  const handleChange = (e: React.ChangeEvent<unknown>, value: number) => {
    e.preventDefault();
    setPage(value);
  };

  const clearSearchOptions = () => {
    setSearchOptions({
      ...searchOptions,
      division: "",
      season: "",
      title: "",
      privateOnly: false,
    });
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
      <PageTitle title="The Film Room" />
      <AddVideo />
      <Divider
        flexItem
        variant="middle"
        sx={{ marginBottom: "16px" }}
      ></Divider>
      <VideoSearchFilters
        searchOptions={searchOptions}
        setSearchOptions={setSearchOptions}
        setPage={setPage}
      />
      <Button endIcon={<DeleteIcon />} onClick={clearSearchOptions}>
        Clear Filters
      </Button>
      <div className="mt-6 flex w-4/5 flex-col items-center justify-center gap-6">
        {(!videos || videos.length === 0) && (
          <div className="flex flex-col items-center justify-center gap-1 text-center">
            <div className="text-2xl font-bold tracking-tight">
              No videos in the Film Room!
            </div>
            <div className="text-xl font-bold tracking-wide">
              Try a new search.
            </div>
          </div>
        )}
        {videos?.map((v) => <Video video={v} key={v.id} />)}
      </div>
      {videos && videoCount && (
        <Pagination
          showFirstButton
          showLastButton
          sx={{ marginTop: "24px" }}
          size="large"
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
