import { Divider } from "@mui/material";
import { Html, Link, Tailwind } from "@react-email/components";
import type { EmailAuthorType, PlayType, VideoType } from "~/utils/types";

type EmailProps = {
  author: EmailAuthorType;
  video: VideoType;
  play: PlayType;
};

const PlayEmailTemplate = ({ author, play, video }: EmailProps) => {
  return (
    <Tailwind>
      <Html lang="en">
        <div className="flex w-full flex-col gap-2">
          <div className="text-xl font-bold">{video.title}</div>
          <div className="text-lg">
            <strong>{author.name} - </strong> {play.title}
          </div>
          <Divider flexItem orientation="horizontal" variant="middle" />
          <div className="flex w-full items-center gap-8">
            <Link
              href={`https://www.inside-break.com/play/${play.id}`}
              className="text-lg font-bold text-purple-600"
            >
              View Play in Theatre
            </Link>
            <Link
              href={`https://www.inside-break.com/film-room/${video.id}/?play=${play.id}&start=${play.start_time}`}
              className="text-lg font-bold text-purple-600"
            >
              View Play in Film Room
            </Link>
          </div>
        </div>
      </Html>
    </Tailwind>
  );
};

export default PlayEmailTemplate;
