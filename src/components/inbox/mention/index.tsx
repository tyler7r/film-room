import PublicIcon from "@mui/icons-material/Public";
import { colors, Divider } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import TeamLogo from "~/components/team-logo";
import { useAuthContext } from "~/contexts/auth";
import { useInboxContext } from "~/contexts/inbox";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import { MentionNotificationType } from "~/utils/types";

type InboxMentionProps = {
  mention: MentionNotificationType;
};

const InboxMention = ({ mention }: InboxMentionProps) => {
  const { hoverText, hoverBorder, backgroundStyle, isDark } =
    useIsDarkContext();
  const { setIsOpen } = useInboxContext();
  const { user } = useAuthContext();

  const router = useRouter();
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

  const updateMention = async () => {
    await supabase
      .from("play_mentions")
      .update({ viewed: true })
      .eq("id", mention.mention.id);
  };

  const handleClick = async () => {
    const { mention: mntn, video, play } = mention;

    const params = new URLSearchParams(searchParams);
    params.set("play", play.id);
    params.set("start", `${play.start_time}`);
    if (!mntn.viewed) void updateMention();
    void updateLastWatched(video.id, play.start_time);
    void router.push(`/film-room/${video.id}?${params.toString()}`);
    setIsOpen(false);
  };

  return (
    <div key={mention.mention.id}>
      <div className="flex items-center gap-2">
        {mention.team && <TeamLogo tm={mention.team} size={20} />}
        {!mention.team && <PublicIcon fontSize="small" />}
        <div>
          <strong
            className={hoverText}
            onClick={() => {
              setIsOpen(false);
              void router.push(`/profile/${mention.play.author_id}`);
            }}
          >
            {mention.play.author_name}
          </strong>{" "}
          mentioned you on:
        </div>
      </div>
      <div
        onClick={handleClick}
        className={`flex w-full flex-col gap-2 ${
          !mention.mention.viewed ? "bg-purple-100" : ""
        } ${hoverBorder}`}
        style={
          !mention.mention.viewed
            ? isDark
              ? { backgroundColor: `${colors.purple[200]}` }
              : { backgroundColor: `${colors.purple[50]}` }
            : backgroundStyle
        }
      >
        <div className="text-center text-lg font-bold tracking-tight lg:text-xl">
          {mention.video.title}
        </div>
        <Divider
          sx={{
            marginLeft: "12px",
            marginRight: "12px",
          }}
        ></Divider>
        <div className="mx-4 text-center">{mention.play.title}</div>
      </div>
    </div>
  );
};

export default InboxMention;
