import { Pagination } from "@mui/material";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { getNumberOfPages, getToAndFrom } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { TeamVideoType } from "~/utils/types";
import EmptyMessage from "../empty-msg";
import Video from "../video";

type TeamVideosProps = {
  teamId: string;
};

const TeamVideos = ({ teamId }: TeamVideosProps) => {
  const { isMobile } = useMobileContext();
  const { affIds } = useAuthContext();
  const [page, setPage] = useState<number>(1);

  const [videos, setVideos] = useState<TeamVideoType[] | null>(null);
  const [videoCount, setVideoCount] = useState<number | null>(null);

  const itemsPerPage = isMobile ? 10 : 20;

  const fetchVideos = async () => {
    const { from, to } = getToAndFrom(itemsPerPage, page);
    const videos = supabase
      .from("team_video_view")
      .select("*", {
        count: "exact",
      })
      .eq("team->>id", teamId)
      .order("video->>uploaded_at", { ascending: false })
      .range(from, to);
    if (affIds) {
      void videos.or(
        `video->>private.eq.false, video->>exclusive_to.in.(${affIds})`,
      );
    } else {
      void videos.eq("video->>private", false);
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
    if (page === 1) void fetchVideos();
    else setPage(1);
  }, [isMobile, affIds, teamId]);

  useEffect(() => {
    void fetchVideos();
  }, [page]);

  return (
    <div className="flex w-11/12 flex-col items-center justify-center">
      <div className="flex w-full flex-col gap-4">
        {videos?.map((video) => (
          <Video video={video.video} key={video.video.id} />
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
          count={getNumberOfPages(itemsPerPage, videoCount)}
          page={page}
          onChange={handleChange}
        />
      )}
      {!videos && (
        <EmptyMessage message="team videos in the database" size="small" />
      )}
    </div>
  );
};

export default TeamVideos;
