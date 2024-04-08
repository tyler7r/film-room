import { Pagination } from "@mui/material";
import { useEffect, useState } from "react";
import { useMobileContext } from "~/contexts/mobile";
import { getNumberOfPages } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import Video from "../video";

export type TeamVideoType = {
  exclusive_to: string | null;
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

const TeamVideos = ({ teamId }: TeamVideosProps) => {
  const { isMobile } = useMobileContext();
  const [page, setPage] = useState<number>(1);

  const [videos, setVideos] = useState<TeamVideoType | null>(null);
  const [videoCount, setVideoCount] = useState<number>(0);

  const fetchVideos = async () => {
    const { from, to } = getFromAndTo();
    const { data, count } = await supabase
      .from("team_videos")
      .select(`exclusive_to, uploaded_at, video:videos!inner(*)`, {
        count: "exact",
      })
      .eq("team_id", teamId)
      .order("uploaded_at", { ascending: false })
      .range(from, to);
    console.log({ data, count });
    if (data && data.length > 0) setVideos(data);
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
    void fetchVideos();
  }, []);

  return (
    <div className="flex w-11/12 flex-col items-center justify-center">
      {videos?.map((video) => (
        <Video video={video.video} key={video.video?.id} />
      ))}
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
    </div>
  );
};

export default TeamVideos;
