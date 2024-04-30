import { Pagination } from "@mui/material";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { getNumberOfPages } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import Video from "../video";

export type TeamVideoType = {
  video: {
    division: string;
    exclusive_to: string | null;
    id: string;
    link: string;
    private: boolean;
    season: string;
    title: string;
    tournament: string | null;
    uploaded_at: string;
    week: string | null;
  } | null;
}[];

type TeamVideosProps = {
  teamId: string;
};

type SearchOptions = {
  loggedIn: boolean;
  currentAffiliation: string | undefined;
};

const TeamVideos = ({ teamId }: TeamVideosProps) => {
  const { isMobile } = useMobileContext();
  const { user } = useAuthContext();
  const [page, setPage] = useState<number>(1);

  const [videos, setVideos] = useState<TeamVideoType | null>(null);
  const [videoCount, setVideoCount] = useState<number>(0);
  const [options, setOptions] = useState<SearchOptions>({
    loggedIn: user.isLoggedIn,
    currentAffiliation: user.currentAffiliation?.team.id,
  });

  const fetchVideos = async (options?: SearchOptions) => {
    const { from, to } = getFromAndTo();
    const videos = supabase
      .from("team_videos")
      .select(`uploaded_at, video:videos!inner(*)`, {
        count: "exact",
      })
      .match({ team_id: teamId })
      .order("uploaded_at", { ascending: false })
      .range(from, to);
    if (options?.currentAffiliation) {
      videos.or(
        `private.eq.false, exclusive_to.eq.${options.currentAffiliation}`,
        { referencedTable: "videos" },
      );
    } else {
      videos.eq("video.private", false);
    }
    const { data, count } = await videos;
    if (data && data.length > 0) setVideos(data);
    else setVideos(null);
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

  useEffect(() => {
    setOptions({
      loggedIn: user.isLoggedIn,
      currentAffiliation: user.currentAffiliation?.team.id,
    });
  }, [user]);

  useEffect(() => {
    void fetchVideos(options);
  }, [teamId, options]);

  return (
    <div className="flex w-11/12 flex-col items-center justify-center">
      <div className="flex w-full flex-col gap-4">
        {videos?.map((video) => (
          <Video video={video.video} key={video.video?.id} />
        ))}
      </div>
      {videos && videoCount && (
        <Pagination
          showFirstButton
          showLastButton
          sx={{ marginTop: "24px" }}
          size="large"
          variant="text"
          shape="rounded"
          count={getNumberOfPages(isMobile, videoCount)}
          page={page}
          onChange={handleChange}
        />
      )}
      {!videos && (
        <div className="text-xl font-bold">No videos in the database!</div>
      )}
    </div>
  );
};

export default TeamVideos;
