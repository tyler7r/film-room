import LinkIcon from "@mui/icons-material/Link";
import PublicIcon from "@mui/icons-material/Public";
import { Divider, IconButton } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Team from "~/components/teams/team";
import TeamLogo from "~/components/teams/team-logo";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { convertTimestamp } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { TeamType, VideoType } from "~/utils/types";
import PageTitle from "../../utils/page-title";
import StandardPopover from "../../utils/standard-popover";
import VideoActionsMenu from "../video-actions-menu";

type VideoProps = {
  video: VideoType | null;
  startTime?: string | null;
};

const Video = ({ video, startTime }: VideoProps) => {
  const { backgroundStyle, isDark, hoverBorder } = useIsDarkContext();
  const { user, affiliations } = useAuthContext();
  const router = useRouter();
  const [affiliatedTeams, setAffiliatedTeams] = useState<TeamType[] | null>(
    null,
  );
  const [exclusiveTeam, setExclusiveTeam] = useState<
    TeamType | null | undefined
  >(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const fetchExclusiveToTeam = () => {
    if (video?.exclusive_to) {
      const tm = affiliations?.find((t) => t.team.id === video.exclusive_to);
      setExclusiveTeam(tm?.team);
    } else setExclusiveTeam(null);
  };

  const fetchAffiliatedTeams = async () => {
    if (video) {
      const { data } = await supabase
        .from("team_video_view")
        .select("team")
        .eq("video->>id", video.id);
      if (data) setAffiliatedTeams(data.map((tm) => tm.team));
    }
  };

  const handleClick = async (id: string) => {
    if (!startTime) {
      if (user.userId) {
        await supabase
          .from("profiles")
          .update({
            last_watched: id,
            last_watched_time: 0,
          })
          .eq("id", user.userId);
      }
      void router.push(`/film-room/${id}`);
    } else {
      void router.push(`/film-room/${id}?start=${startTime}`);
    }
  };

  const copyToClipboard = () => {
    if (video) {
      const origin = window.location.origin;
      void navigator.clipboard.writeText(`${origin}/film-room/${video.id}`);
      setIsCopied(true);
    }
  };

  useEffect(() => {
    void fetchExclusiveToTeam();
    void fetchAffiliatedTeams();
  }, [video]);

  return (
    video && (
      <div
        style={backgroundStyle}
        key={video.id}
        className={`${hoverBorder} flex flex-col items-center justify-center rounded-md p-1 px-2`}
        onClick={() => handleClick(video.id)}
      >
        <div className="flex w-full items-center justify-between gap-1">
          {!video.private && (
            <StandardPopover
              content="Public video"
              children={
                <IconButton>
                  <PublicIcon />
                </IconButton>
              }
            />
          )}
          {video.private && exclusiveTeam && (
            <StandardPopover
              content={`Private to ${exclusiveTeam.full_name}`}
              children={
                <IconButton>
                  <TeamLogo tm={exclusiveTeam} size={25} inactive={true} />
                </IconButton>
              }
            />
          )}
          <div className={`flex w-full items-center justify-center gap-2`}>
            {
              <div className="text-xs font-light">
                {convertTimestamp(video.uploaded_at)}
              </div>
            }
            <Divider flexItem orientation="vertical" />
            <div
              className={`text-center text-sm font-bold leading-5 tracking-tight lg:text-base ${
                isDark ? "text-purple-400" : "text-purple-A400"
              }`}
            >
              {video.season}
              {video.week
                ? ` ${video.week.toLocaleUpperCase()}`
                : video.tournament
                  ? ` ${video.tournament.toLocaleUpperCase()}`
                  : null}
              {` - ${video.division}`}
            </div>
          </div>
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center"
          >
            <StandardPopover
              content={isCopied ? "Copied!" : `Copy video link`}
              children={
                <IconButton onClick={copyToClipboard}>
                  <LinkIcon />
                </IconButton>
              }
            />
            <VideoActionsMenu video={video} />
          </div>
        </div>
        <PageTitle size="x-small" title={video.title} />
        <div className="flex w-full flex-wrap items-center justify-center gap-1">
          {affiliatedTeams?.map((tm) => (
            <Team team={tm} key={tm.id} small={true} onVideo={true} />
          ))}
        </div>
      </div>
    )
  );
};

export default Video;
