import PublicIcon from "@mui/icons-material/Public";
import { Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { VideoType } from "~/utils/types";
import TeamLogo from "../team-logo";

type VideoProps = {
  video: VideoType | null;
};

const Video = ({ video }: VideoProps) => {
  const { backgroundStyle, isDark } = useIsDarkContext();
  const { user } = useAuthContext();
  const router = useRouter();

  return (
    video && (
      <div
        style={backgroundStyle}
        key={video.id}
        className={`${
          isDark ? "hover:border-purple-400" : "hover:border-purple-A400"
        } flex w-full cursor-pointer flex-col gap-1 border-2 border-solid border-transparent p-2 px-10 transition ease-in-out hover:rounded-sm hover:border-solid hover:delay-100`}
        onClick={() => router.push(`/film-room/${video.id}`)}
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
          {video.private && user.currentAffiliation && (
            <div className="justify mb-1 flex items-center justify-center gap-2">
              <div className="lg:text-md text-sm tracking-tighter">
                PRIVATE TO:{" "}
              </div>
              <TeamLogo tm={user.currentAffiliation} size={20} />
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
