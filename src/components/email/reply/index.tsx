import { Divider } from "@mui/material";
import { Html, Tailwind } from "@react-email/components";
import Link from "next/link";
import type {
  CommentType,
  EmailAuthorType,
  PlayType,
  ReplyType,
  VideoType,
} from "~/utils/types";

type EmailProps = {
  author: EmailAuthorType;
  video: VideoType;
  reply: ReplyType;
  comment: CommentType;
  play: PlayType;
};

const ReplyEmailTemplate = ({ author, reply, comment, video }: EmailProps) => {
  return (
    <Tailwind>
      <Html lang="en">
        <div className="flex w-full flex-col gap-2">
          <div className="text-2xl font-bold">{video.title}</div>
          <div className="text-xl">
            <strong className="text-purple-600">Your Comment: </strong>
            {comment.comment}
          </div>
          <div className="text-lg">
            <strong>{author.name} - </strong> {reply.reply}
          </div>
          <Divider flexItem orientation="horizontal" variant="middle" />
          <div className="flex w-full items-center gap-8">
            <Link
              href={`https://www.inside-break.com/play/${comment.play_id}?comment=${comment.id}`}
              className="text-lg font-bold text-purple-600"
            >
              View Play in Theatre
            </Link>
          </div>
        </div>
      </Html>
    </Tailwind>
  );
};

export default ReplyEmailTemplate;
