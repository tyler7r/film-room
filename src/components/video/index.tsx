import PublicIcon from "@mui/icons-material/Public";
import { colors } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { TeamType, VideoType } from "~/utils/types";
import DeleteMenu from "../delete-menu";
import PageTitle from "../page-title";
import TeamLogo from "../team-logo";

type VideoProps = {
  video: VideoType | null;
  startTime?: string | null;
  purpleBackground?: boolean;
};

const Video = ({ video, startTime, purpleBackground }: VideoProps) => {
  const { backgroundStyle, isDark, hoverBorder } = useIsDarkContext();
  // const { affiliations } = useAffiliatedContext();
  const { user, affiliations } = useAuthContext();
  const router = useRouter();

  const [exclusiveTeam, setExclusiveTeam] = useState<
    TeamType | null | undefined
  >(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);

  const fetchExclusiveToTeam = () => {
    if (video?.exclusive_to) {
      const tm = affiliations?.find((t) => t.team.id === video.exclusive_to);
      setExclusiveTeam(tm?.team);
    } else setExclusiveTeam(null);
  };

  const handleClick = async (id: string) => {
    if (!startTime) {
      await supabase
        .from("profiles")
        .update({
          last_watched: id,
          last_watched_time: 0,
        })
        .eq("id", `${user.userId}`);
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
        style={
          !purpleBackground
            ? backgroundStyle
            : isDark
              ? { backgroundColor: `${colors.purple[200]}` }
              : { backgroundColor: `${colors.purple[50]}` }
        }
        key={video.id}
        className={`${hoverBorder} flex w-full flex-col p-2`}
        onClick={() => handleClick(video.id)}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="flex items-center justify-center gap-2">
            {!video.private && (
              <div className="flex items-center justify-center gap-1">
                <div className="text-sm font-bold tracking-tighter lg:text-base">
                  PUBLIC
                </div>
                <PublicIcon fontSize="small" />
              </div>
            )}
            {video.private && exclusiveTeam && (
              <div className="justify flex items-center justify-center gap-2">
                <div className="text-sm font-bold tracking-tighter lg:text-base">
                  PRIVATE TO:{" "}
                </div>
                <TeamLogo tm={exclusiveTeam} size={20} />
              </div>
            )}
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
          <div
            className={`text-center text-base font-bold leading-5 lg:text-lg ${
              isDark ? "text-purple-400" : "text-purple-A400"
            }`}
          >
            {video.season} -{" "}
            {video.week
              ? video.week.toLocaleUpperCase()
              : video.tournament
                ? video.tournament.toLocaleUpperCase()
                : null}
          </div>
          <PageTitle size="small" title={video.title} />
        </div>
      </div>
    )
  );
};

export default Video;
