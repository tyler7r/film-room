import PublicIcon from "@mui/icons-material/Public";
import { Divider, Pagination, Typography } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AddVideo from "~/components/add-video";
import Search from "~/components/search";
import TeamLogo from "~/components/team-logo";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { getNumberOfPages } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import { VideoType } from "~/utils/types";
import { useIsDarkContext } from "../_app";

const FilmRoomHome = () => {
  const { user } = useAuthContext();
  const { isMobile } = useMobileContext();
  const { backgroundStyle, isDark } = useIsDarkContext();

  const query = useSearchParams().get("query") || "";
  const [videos, setVideos] = useState<VideoType[] | null>(null);
  const [page, setPage] = useState<number>(1);
  const [videoCount, setVideoCount] = useState<number | null>(null);

  const router = useRouter();

  const fetchVideos = async () => {
    const { from, to } = getFromAndTo();
    if (user.isLoggedIn && user.currentAffiliation?.team.id) {
      const { data, count } = await supabase
        .from("videos")
        .select(`*`, { count: "exact" })
        .ilike("title", `%${query}%`)
        .or(
          `private.eq.false, exclusive_to.eq.${user.currentAffiliation?.team.id}`,
        )
        .order("uploaded_at", { ascending: false })
        .range(from, to);
      if (count) setVideoCount(count);
      if (data) setVideos(data);
    } else {
      const { data, count } = await supabase
        .from("videos")
        .select(`*`, { count: "exact" })
        .eq("private", false)
        .ilike("title", `%${query}%`)
        .order("uploaded_at", { ascending: false })
        .range(from, to);
      if (count) setVideoCount(count);
      if (data && data.length > 0) setVideos(data);
    }
  };

  const handleChange = (e: React.ChangeEvent<unknown>, value: number) => {
    e.preventDefault();
    setPage(value);
  };

  const getFromAndTo = () => {
    const itemPerPage = isMobile ? 5 : 10;
    let from = (page - 1) * itemPerPage;
    let to = from + itemPerPage - 1;

    return { from, to };
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
    void fetchVideos();
  }, [page, isMobile, query]);

  return (
    <div className="my-4 flex w-full flex-col items-center justify-center">
      <Typography variant="h1" fontSize={64} className="m-2 text-center">
        The Film Room
      </Typography>
      <Divider flexItem variant="middle" className="mb-4"></Divider>
      <Search placeholder="Search videos..." />
      {user.isLoggedIn && <AddVideo />}
      <div className="flex w-4/5 flex-col items-center justify-center gap-6">
        {!videos && <Typography>No videos in the Film Room!</Typography>}
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
