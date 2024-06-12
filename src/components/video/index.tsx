import PublicIcon from "@mui/icons-material/Public";
import { Typography, colors } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAffiliatedContext } from "~/contexts/affiliations";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { TeamType, VideoType } from "~/utils/types";
import TeamLogo from "../team-logo";

type VideoProps = {
  video: VideoType | null;
  startTime?: string | null;
  purpleBackground?: boolean;
};

const Video = ({ video, startTime, purpleBackground }: VideoProps) => {
  const { backgroundStyle, isDark, hoverBorder } = useIsDarkContext();
  const { affiliations } = useAffiliatedContext();
  const { user } = useAuthContext();
  const router = useRouter();

  const [exclusiveTeam, setExclusiveTeam] = useState<
    TeamType | null | undefined
  >(null);

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
        className={`${hoverBorder} flex w-full flex-col gap-1`}
        onClick={() => handleClick(video.id)}
      >
        <Typography
          color={isDark ? `white` : `black`}
          component="span"
          className="flex flex-col items-center justify-center gap-1"
        >
          {!video.private && (
            <div className="mb-1 flex items-center justify-center gap-1">
              <div className="lg:text-md text-sm tracking-tighter">PUBLIC</div>
              <PublicIcon fontSize="small" />
            </div>
          )}
          {video.private && exclusiveTeam && (
            <div className="justify mb-1 flex items-center justify-center gap-2">
              <div className="lg:text-md text-sm tracking-tighter">
                PRIVATE TO:{" "}
              </div>
              <TeamLogo tm={exclusiveTeam} size={20} />
            </div>
          )}
          <div className="flex gap-2 text-center text-xl font-medium tracking-wide">
            {video.season && <div>{video.season}</div>}
            {video.tournament && <div>{video.tournament}</div>}
            {video.week && <div>{video.week}</div>}
          </div>
          <div className="text-center text-2xl font-extrabold tracking-tighter lg:text-3xl">
            {video.title}
          </div>
        </Typography>
      </div>
    )
  );
};

export default Video;
