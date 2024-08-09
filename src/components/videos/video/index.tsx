import PublicIcon from "@mui/icons-material/Public";
import { Divider, IconButton } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import TeamLogo from "~/components/teams/team-logo";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { convertTimestamp } from "~/utils/helpers";
import { supabase } from "~/utils/supabase";
import type { TeamType, VideoType } from "~/utils/types";
import DeleteMenu from "../../utils/delete-menu";
import PageTitle from "../../utils/page-title";
import StandardPopover from "../../utils/standard-popover";

type VideoProps = {
  video: VideoType | null;
  startTime?: string | null;
};

const Video = ({ video, startTime }: VideoProps) => {
  const { backgroundStyle, isDark, hoverBorder } = useIsDarkContext();
  const { user, affiliations } = useAuthContext();
  const router = useRouter();

  const [exclusiveTeam, setExclusiveTeam] = useState<
    TeamType | null | undefined
  >(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<{
    anchor1: HTMLElement | null;
    anchor2: HTMLElement | null;
  }>({
    anchor1: null,
    anchor2: null,
  });

  const handlePopoverOpen = (
    e: React.MouseEvent<HTMLElement>,
    target: "a" | "b",
  ) => {
    if (target === "a") {
      setAnchorEl({ ...anchorEl, anchor1: e.currentTarget });
    } else {
      setAnchorEl({ ...anchorEl, anchor2: e.currentTarget });
    }
  };

  const handlePopoverClose = () => {
    setAnchorEl({ anchor1: null, anchor2: null });
  };

  const open1 = Boolean(anchorEl.anchor1);
  const open2 = Boolean(anchorEl.anchor2);

  const fetchExclusiveToTeam = () => {
    if (video?.exclusive_to) {
      const tm = affiliations?.find((t) => t.team.id === video.exclusive_to);
      setExclusiveTeam(tm?.team);
    } else setExclusiveTeam(null);
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

  const handleDelete = async () => {
    if (video) {
      await supabase.from("videos").delete().eq("id", video.id);
    } else return;
  };

  useEffect(() => {
    void fetchExclusiveToTeam();
  }, []);

  return (
    video && (
      <div
        style={backgroundStyle}
        key={video.id}
        className={`${hoverBorder} flex flex-col items-center justify-center rounded-md p-2 px-4`}
        onClick={() => handleClick(video.id)}
      >
        <div className="flex w-full items-center justify-center">
          {!video.private && (
            <IconButton
              onMouseEnter={(e) => handlePopoverOpen(e, "a")}
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
              onMouseEnter={(e) => handlePopoverOpen(e, "b")}
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
          <div
            className={`${
              video.author_id === user.userId ? "w-11/12" : ""
            } flex items-center justify-center gap-2`}
          >
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
          {video.author_id === user.userId && (
            <div onClick={(e) => e.stopPropagation()}>
              <DeleteMenu
                isOpen={isDeleteOpen}
                setIsOpen={setIsDeleteOpen}
                handleDelete={handleDelete}
              />
            </div>
          )}
        </div>
        <PageTitle size="small" title={video.title} />
      </div>
    )
  );
};

export default Video;
