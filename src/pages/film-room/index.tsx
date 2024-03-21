import DeleteIcon from "@mui/icons-material/Delete";
import PublicIcon from "@mui/icons-material/Public";
import { Button, Divider, Pagination, Typography } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AddVideo from "~/components/add-video";
import Search from "~/components/search";
import TeamLogo from "~/components/team-logo";
import VideoSearchFilters from "~/components/video-search-filters";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { getNumberOfPages } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { VideoType } from "~/utils/types";
import { useIsDarkContext } from "../_app";

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
  const { backgroundStyle, isDark } = useIsDarkContext();
  const router = useRouter();

  const query = useSearchParams().get("query") ?? "";
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

  const fetchVideos = async (options?: SearchOptions) => {
    const { from, to } = getFromAndTo();
    let videos = supabase
      .from("videos")
      .select("*", { count: "exact" })
      .order("uploaded_at", { ascending: false })
      .range(from, to);
    videos = options?.currentAffiliation
      ? videos.or(
          `private.eq.false, exclusive_to.eq.${user.currentAffiliation?.team.id}`,
        )
      : videos.eq("private", false);
    if (options?.title) {
      void videos.ilike("title", `%${options.title}%`);
    }
    if (options?.division) {
      void videos.ilike("division", `%${options.division}`);
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

  const getFromAndTo = () => {
    const itemPerPage = isMobile ? 5 : 10;
    const from = (page - 1) * itemPerPage;
    const to = from + itemPerPage - 1;

    return { from, to };
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
    void fetchVideos(searchOptions);
  }, [page, isMobile, query, searchOptions]);

  return (
    <div className="my-4 flex w-full flex-col items-center justify-center">
      <Typography variant="h1" fontSize={64} className="m-2 text-center">
        The Film Room
      </Typography>
      <Divider flexItem variant="middle" className="mb-4"></Divider>
      <Search
        searchOptions={searchOptions}
        setSearchOptions={setSearchOptions}
      />
      <VideoSearchFilters
        searchOptions={searchOptions}
        setSearchOptions={setSearchOptions}
      />
      <Button endIcon={<DeleteIcon />} onClick={clearSearchOptions}>
        Clear Filters
      </Button>
      <AddVideo />
      <div className="flex w-4/5 flex-col items-center justify-center gap-6">
        {!videos ||
          (videos.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="text-4xl font-bold tracking-tight">
                No videos in the Film Room!
              </div>
              <div className="text-2xl font-bold tracking-wide">
                Try a new search.
              </div>
            </div>
          ))}
        {videos?.map((v) => (
          <div
            style={backgroundStyle}
            key={v.id}
            className={`${
              isDark ? "hover:border-purple-400" : "hover:border-purple-A400"
            } flex w-full cursor-pointer flex-col gap-1 border-2 border-solid border-transparent p-2 px-10 transition ease-in-out hover:rounded-sm hover:border-solid hover:delay-100`}
            onClick={() => router.push(`/film-room/${v.id}/0`)}
          >
            <Typography
              color={isDark ? `white` : `black`}
              component="span"
              className="flex flex-col items-center justify-center gap-1"
            >
              {!v.private && (
                <div className="mb-1 flex items-center justify-center gap-1">
                  <div className="lg:text-md text-sm tracking-tighter">
                    PUBLIC
                  </div>
                  <PublicIcon fontSize="small" />
                </div>
              )}
              {v.private && user.currentAffiliation && (
                <div className="justify mb-1 flex items-center justify-center gap-2">
                  <div className="lg:text-md text-sm tracking-tighter">
                    PRIVATE TO:{" "}
                  </div>
                  <TeamLogo tm={user.currentAffiliation} size={20} />
                </div>
              )}
              <div className="flex gap-2 text-center text-xl font-medium tracking-wide">
                {v.season && <div>{v.season}</div>}
                {v.tournament && <div>{v.tournament}</div>}
                {v.week && <div>{v.week}</div>}
              </div>
              <div className="text-center text-2xl font-extrabold tracking-tighter lg:text-3xl">
                {v.title}
              </div>
            </Typography>
          </div>
        ))}
      </div>
      {videos && videoCount && (
        <Pagination
          showFirstButton
          showLastButton
          className="mt-6"
          size="large"
          variant="text"
          shape="rounded"
          count={getNumberOfPages(isMobile, videoCount)}
          page={page}
          onChange={handleChange}
        />
      )}
    </div>
  );
};

export default FilmRoomHome;
