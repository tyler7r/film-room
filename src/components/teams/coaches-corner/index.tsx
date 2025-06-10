import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { Divider, IconButton, Pagination } from "@mui/material";
import { useEffect, useState } from "react";
import EmptyMessage from "~/components/utils/empty-msg";
import PageTitle from "~/components/utils/page-title";
import Video from "~/components/videos/video";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { getNumberOfPages, getToAndFrom } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { TeamVideoType } from "~/utils/types";

type CoachesCornerProps = {
  teamId: string;
};

const CoachesCorner = ({ teamId }: CoachesCornerProps) => {
  const { isMobile } = useMobileContext();
  const { affIds } = useAuthContext();
  const [page, setPage] = useState<number>(1);

  const [videos, setVideos] = useState<TeamVideoType[] | null>(null);
  const [videoCount, setVideoCount] = useState<number | null>(null);
  const [hide, setHide] = useState(false);

  const itemsPerPage = isMobile ? 5 : 10;

  const fetchVideos = async () => {
    const { from, to } = getToAndFrom(itemsPerPage, page);
    const videos = supabase
      .from("team_video_view")
      .select("*", {
        count: "exact",
      })
      .eq("team->>id", teamId)
      .eq("video->>coach_video", true)
      .order("video->>uploaded_at", { ascending: false })
      .range(from, to);
    if (affIds && affIds.length > 0) {
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
    <div className="flex w-11/12 flex-col items-center justify-center gap-6">
      <div className="flex w-full items-center justify-center gap-2">
        <PageTitle size="small" title="Coaches Corner" />
        {hide ? (
          <IconButton onClick={() => setHide(false)} size="small">
            <KeyboardArrowRightIcon />
          </IconButton>
        ) : (
          <IconButton onClick={() => setHide(true)} size="small">
            <KeyboardArrowDownIcon />
          </IconButton>
        )}
      </div>
      {!hide && (
        <div className="flex w-full flex-col items-center justify-center gap-2">
          <div className="flex w-full flex-wrap justify-center gap-6">
            {!videos && <EmptyMessage message="coach uploaded videos" />}
            {videos?.map((video) => (
              <Video video={video.video} key={video.video.id} />
            ))}
          </div>
          {videos && videoCount && (
            <Pagination
              siblingCount={1}
              boundaryCount={0}
              size={isMobile ? "small" : "medium"}
              showFirstButton
              showLastButton
              sx={{ marginTop: "24px" }}
              variant="text"
              shape="rounded"
              count={getNumberOfPages(itemsPerPage, videoCount)}
              page={page}
              onChange={handleChange}
            />
          )}
        </div>
      )}
      {hide && <Divider flexItem className="mt-2" />}
    </div>
  );
};

export default CoachesCorner;
