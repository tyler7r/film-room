import { Divider, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import { VideoType } from "~/utils/types";
import { useIsDarkContext } from "../_app";

// export const getServerSideProps = (async () => {
//   const { user } = useAuthContext();
//   const videosData = await supabase
//     .from("videos")
//     .select(`*`)
//     .or(`private.eq.false, exclusive_to.eq.${user.currentAffiliation?.team.id}`)
//     .order("uploaded_at");
//   const videos: VideoType[] | null = videosData.data;
//   return { props: { videos } };
// }) satisfies GetServerSideProps<{ videos: VideoType[] | null }>;

const FilmRoomHome = () => {
  const { user } = useAuthContext();
  const { backgroundStyle, isDark } = useIsDarkContext();
  const [videos, setVideos] = useState<VideoType[] | null>(null);

  const router = useRouter();

  const fetchVideos = async () => {
    if (user.isLoggedIn && user.currentAffiliation?.team.id) {
      const { data } = await supabase
        .from("videos")
        .select(`*`)
        .or(
          `private.eq.false, exclusive_to.eq.${user.currentAffiliation?.team.id}`,
        )
        .order("uploaded_at");
      if (data) setVideos(data);
    } else {
      const { data } = await supabase
        .from("videos")
        .select(`*`)
        .eq("private", false)
        .order("uploaded_at");
      if (data && data.length > 0) setVideos(data);
    }
  };

  useEffect(() => {
    void fetchVideos();
    console.log(videos);
  }, []);

  return (
    <div className="my-4 flex w-full flex-col items-center justify-center">
      <Typography variant="h1" fontSize={64} className="m-2">
        The Film Room
      </Typography>
      <Divider flexItem variant="middle" className="mb-4"></Divider>
      <div className="flex w-4/5 w-full flex-wrap items-center justify-center gap-6">
        {!videos && <Typography>No videos in the Film Room!</Typography>}
        {videos?.map((v) => (
          <div
            style={backgroundStyle}
            key={v.id}
            className="flex cursor-pointer flex-col flex-wrap gap-1 border-2 border-solid border-transparent p-2 px-10 transition ease-in-out hover:rounded-sm hover:border-solid hover:border-purple-400 hover:delay-100"
            onClick={() => router.push(`/film-room/${v.id}/0`)}
          >
            <Typography
              color={isDark ? `white` : `black`}
              component="span"
              className="flex flex-col items-center justify-center gap-1"
            >
              <div className="flex gap-2 text-xl font-medium tracking-wider">
                {v.season && <div>{v.season}</div>}
                {v.tournament && <div>{v.tournament}</div>}
                {v.week && <div>{v.week}</div>}
              </div>
              <div className="text-2xl font-extrabold tracking-tighter lg:text-3xl">
                {v.title}
              </div>
            </Typography>
            <div className="flex items-center gap-4"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilmRoomHome;
