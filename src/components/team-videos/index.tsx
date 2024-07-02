import { Pagination } from "@mui/material";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { getNumberOfPages, getToAndFrom } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import EmptyMessage from "../empty-msg";
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

  const itemsPerPage = isMobile ? 10 : 20;

  const fetchVideos = async (options?: SearchOptions) => {
    const { from, to } = getToAndFrom(itemsPerPage, page);
    const videos = supabase
      .from("team_videos")
      .select(`uploaded_at, video:videos!inner(*)`, {
        count: "exact",
      })
      .match({ team_id: teamId })
      .order("uploaded_at", { ascending: false })
      .range(from, to);
    if (options?.currentAffiliation) {
      void videos.or(
        `private.eq.false, exclusive_to.eq.${options.currentAffiliation}`,
        { referencedTable: "videos" },
      );
    } else {
      void videos.eq("video.private", false);
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

  useEffect(() => {
    setOptions({
      loggedIn: user.isLoggedIn,
      currentAffiliation: user.currentAffiliation?.team.id,
    });
  }, [user]);

  useEffect(() => {
    if (page === 1) void fetchVideos(options);
    else setPage(1);
  }, [isMobile]);

  useEffect(() => {
    void fetchVideos(options);
  }, [teamId, options, page]);

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
