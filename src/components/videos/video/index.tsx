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
  const [anchorEl, setAnchorEl] = useState<{
    anchor1: HTMLElement | null;
    anchor2: HTMLElement | null;
    anchor3: HTMLElement | null;
  }>({
    anchor1: null,
    anchor2: null,
    anchor3: null,
  });

  const handlePopoverOpen = (
    e: React.MouseEvent<HTMLElement>,
    target: 1 | 2 | 3,
  ) => {
    if (target === 1) {
      setAnchorEl({ anchor1: e.currentTarget, anchor2: null, anchor3: null });
    } else if (target === 2) {
      setAnchorEl({ anchor2: e.currentTarget, anchor1: null, anchor3: null });
    } else {
      setAnchorEl({ anchor1: null, anchor2: null, anchor3: e.currentTarget });
    }
  };

  const handlePopoverClose = () => {
    setAnchorEl({ anchor1: null, anchor2: null, anchor3: null });
    setIsCopied(false);
  };

  const open1 = Boolean(anchorEl.anchor1);
  const open2 = Boolean(anchorEl.anchor2);
  const open3 = Boolean(anchorEl.anchor3);

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
        className={`${hoverBorder} flex flex-col items-center justify-center rounded-md p-2 px-4`}
        onClick={() => handleClick(video.id)}
      >
        <div className="flex w-full items-center justify-between">
          {!video.private && (
            <IconButton
              onMouseEnter={(e) => handlePopoverOpen(e, 1)}
              onMouseLeave={handlePopoverClose}
            >
              <PublicIcon />
              <StandardPopover
                content="Public video"
                open={open1}
                handlePopoverClose={handlePopoverClose}
                anchorEl={anchorEl.anchor1}
              />
            </IconButton>
          )}
          {video.private && exclusiveTeam && (
            <IconButton
              onMouseEnter={(e) => handlePopoverOpen(e, 2)}
              onMouseLeave={handlePopoverClose}
            >
              <TeamLogo
                tm={exclusiveTeam}
                size={25}
                inactive={true}
                popover={false}
              />
              <StandardPopover
                content={`Private to ${exclusiveTeam.full_name}`}
                open={open2}
                anchorEl={anchorEl.anchor2}
                handlePopoverClose={handlePopoverClose}
              />
            </IconButton>
          )}
          <div className={`flex w-full items-center justify-center gap-2`}>
            {
              <div className="text-sm font-light">
                {convertTimestamp(video.uploaded_at)}
              </div>
            }
            <Divider flexItem orientation="vertical" />
            <div
              className={`text-center text-base font-bold leading-5 tracking-tight lg:text-lg ${
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
            <IconButton
              onClick={copyToClipboard}
              onMouseEnter={(e) => handlePopoverOpen(e, 3)}
              onMouseLeave={handlePopoverClose}
            >
              <LinkIcon />
              <StandardPopover
                open={open3}
                anchorEl={anchorEl.anchor3}
                content={isCopied ? "Copied!" : `Copy video link`}
                handlePopoverClose={handlePopoverClose}
              />
            </IconButton>
            <VideoActionsMenu video={video} />
          </div>
        </div>
        <PageTitle size="small" title={video.title} />
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
