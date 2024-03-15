import { Typography, useTheme } from "@mui/material";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import { VideoType } from "~/utils/types";
import { useIsDarkContext } from "../_app";

export const getServerSideProps = (async () => {
  const { user } = useAuthContext();
  const videosData = await supabase
    .from("videos")
    .select(`*`)
    .or(`private.eq.false, exclusive_to.eq.${user.currentAffiliation?.team.id}`)
    .order("uploaded_at");
  const videos: VideoType[] | null = videosData.data;
  return { props: { videos } };
}) satisfies GetServerSideProps<{ videos: VideoType[] | null }>;

const FilmRoomHome = ({
  videos,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { backgroundStyle, isDark } = useIsDarkContext();
  const theme = useTheme();

  const router = useRouter();

  useEffect(() => {
    console.log(videos);
  }, []);

  return (
    <div className="my-4 flex w-full flex-col items-center justify-center gap-4">
      <Typography variant="h1" fontSize={64}>
        Film
      </Typography>
      <div className="flex w-4/5 flex-col items-center justify-center gap-8">
        {videos?.map((v) => (
          <div
            style={{
              backgroundColor: `${backgroundStyle.backgroundColor}`,
              border: `2px solid ${theme.palette.primary.main}`,
            }}
            key={v.id}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg p-2"
            onClick={() => router.push(`/film-room/${v.id}/0`)}
          >
            <Typography
              color={isDark ? `white` : `black`}
              component="span"
              className="flex items-center justify-center gap-1"
            >
              <div>{v.season}</div>
              <div>{v.tournament}</div>
            </Typography>
            <div className="flex items-center gap-4"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilmRoomHome;
