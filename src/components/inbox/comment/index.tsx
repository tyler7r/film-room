import { colors, Divider } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useAuthContext } from "~/contexts/auth";
import { useInboxContext } from "~/contexts/inbox";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { CommentNotificationType } from "~/utils/types";

type InboxCommentProps = {
  comment: CommentNotificationType;
};

const InboxComment = ({ comment }: InboxCommentProps) => {
  const { hoverText, backgroundStyle, isDark, hoverBorder } =
    useIsDarkContext();
  const { setIsOpen } = useInboxContext();
  const { user } = useAuthContext();
  const searchParams = useSearchParams();

  const updateLastWatched = async (video: string, time: number) => {
    if (user.userId) {
      await supabase
        .from("profiles")
        .update({
          last_watched: video,
          last_watched_time: time,
        })
        .eq("id", user.userId)
        .select();
    }
  };

  const updateComment = async () => {
    await supabase
      .from("comments")
      .update({ viewed: true })
      .eq("id", comment.comment.id);
  };

  const handleClick = async () => {
    const { comment: cmt, video, play } = comment;

    const params = new URLSearchParams(searchParams);
    params.set("play", play.id);
    params.set("start", `${play.start_time}`);
    if (!cmt.viewed) void updateComment();
    void updateLastWatched(video.id, play.start_time);
    void router.push(`/film-room/${video.id}?${params.toString()}`);
    setIsOpen(false);
  };

  const router = useRouter();
  return (
    <div key={comment.play.id + comment.comment.created_at}>
      <div>
        <strong
          className={hoverText}
          onClick={() => {
            setIsOpen(false);
            void router.push(`/profile/${comment.play.author_id}`);
          }}
        >
          {comment.comment.author_name}
        </strong>{" "}
        commented on:
      </div>
      <div
        onClick={() => handleClick()}
        className={`flex w-full flex-col gap-2 ${hoverBorder}`}
        style={
          !comment.comment.viewed
            ? isDark
              ? { backgroundColor: `${colors.purple[200]}` }
              : { backgroundColor: `${colors.purple[50]}` }
            : backgroundStyle
        }
      >
        <div className="text-center text-lg font-bold tracking-tight lg:text-xl">
          {comment.video.title}
        </div>
        <Divider sx={{ marginLeft: "12px", marginRight: "12px" }}></Divider>
        <div className="ml-1 text-center">{comment.play.title}</div>
      </div>
    </div>
  );
};

export default InboxComment;
