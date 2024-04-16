import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MailIcon from "@mui/icons-material/Mail";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PublicIcon from "@mui/icons-material/Public";
import { Button, Divider, IconButton, colors } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import TeamLogo from "~/components/team-logo";
import { useAffiliatedContext } from "~/contexts/affiliations";
import { useAuthContext } from "~/contexts/auth";
import { useInboxContext } from "~/contexts/inbox";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { RealCommentType } from "~/utils/types";

type InboxCommentsProps = {
  hide: boolean;
  setHide: (hide: boolean) => void;
};

const InboxComments = ({ hide, setHide }: InboxCommentsProps) => {
  const { user, setUser } = useAuthContext();
  const { affiliations } = useAffiliatedContext();
  const { setIsOpen, commentPage, setCommentPage, setCommentCount } =
    useInboxContext();
  const { backgroundStyle, isDark } = useIsDarkContext();

  const searchParams = useSearchParams();
  const router = useRouter();

  const [isUnreadOnly, setIsUnreadOnly] = useState(false);
  const [comments, setComments] = useState<RealCommentType | null>(null);
  const [isBtnDisabled, setIsBtnDisabled] = useState<boolean>(false);

  const fetchComments = async (unreadOnly: boolean) => {
    const { from, to } = getFromAndTo();
    const cmts = supabase
      .from("comment_notifications")
      .select(`*, team: teams!inner(*)`, {
        count: "exact",
      })
      .eq("play_author_id", `${user.userId}`)
      .range(from, to)
      .order("created_at", { ascending: false });
    setCommentPage(commentPage + 1);
    if (unreadOnly) {
      void cmts.eq("viewed_by_author", false);
    }
    const { data, count } = await cmts;
    if (count) {
      setCommentCount(count);
      if (to >= count - 1) setIsBtnDisabled(true);
    } else setCommentCount(0);
    if (data && data.length > 0) {
      setComments(comments ? [...comments, ...data] : data);
    } else {
      setIsBtnDisabled(true);
      setComments(null);
    }
  };

  const getFromAndTo = () => {
    const itemPerPage = 4;
    let from = commentPage * itemPerPage;
    const to = from + itemPerPage;

    if (commentPage > 0) {
      from += 1;
    }

    return { from, to };
  };

  useEffect(() => {
    const channel = supabase
      .channel("comment_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        () => {
          void fetchComments(isUnreadOnly);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const updateLastWatched = async (video: string, time: number) => {
    await supabase
      .from("profiles")
      .update({
        last_watched: video,
        last_watched_time: time,
      })
      .eq("id", `${user.userId}`)
      .select();
  };

  const updateComment = async (commentId: string) => {
    await supabase
      .from("comments")
      .update({ viewed_by_author: true })
      .eq("id", commentId);
  };

  const updateUserAffiliation = (teamId: string) => {
    const team = affiliations?.find((aff) => aff.team.id === teamId);
    if (user.currentAffiliation?.team.id === teamId) return;
    else {
      setUser({
        ...user,
        currentAffiliation: team ? team : user.currentAffiliation,
      });
    }
  };

  const handleClick = async (
    videoId: string,
    playId: string,
    start: number,
    commentId: string,
    teamId: string,
    viewed: boolean,
  ) => {
    const params = new URLSearchParams(searchParams);
    params.set("play", playId);
    params.set("start", `${start}`);
    if (!viewed) void updateComment(commentId);
    void updateUserAffiliation(teamId);
    void updateLastWatched(videoId, start);
    void router.push(`/film-room/${videoId}?${params.toString()}`);
    setIsOpen(false);
  };

  const handleUnreadClick = () => {
    setComments(null);
    setCommentPage(0);
    setIsUnreadOnly(!isUnreadOnly);
  };

  useEffect(() => {
    if (user.isLoggedIn) void fetchComments(isUnreadOnly);
  }, [isUnreadOnly]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-2xl font-bold lg:mb-2 lg:text-3xl">
        <div>Recent Comments</div>
        {hide && (
          <Button
            variant="outlined"
            size="small"
            endIcon={<ExpandMoreIcon />}
            onClick={() => setHide(false)}
          >
            Show
          </Button>
        )}
        {!hide && (
          <div>
            <IconButton onClick={() => handleUnreadClick()}>
              {isUnreadOnly ? (
                <MailIcon color="primary" />
              ) : (
                <MailOutlineIcon color="primary" />
              )}
            </IconButton>
            <Button
              size="small"
              variant="outlined"
              endIcon={<ExpandLessIcon />}
              onClick={() => setHide(true)}
            >
              Hide
            </Button>
          </div>
        )}
      </div>
      {!hide && (
        <>
          <div className="flex flex-col gap-5 md:px-2 lg:px-4">
            {comments &&
              comments.length > 0 &&
              comments.map((comment) => (
                <div key={comment.play_id + comment.created_at}>
                  <div className="flex items-center gap-2">
                    {comment.private && comment.team && (
                      <TeamLogo tm={comment.team} size={20} />
                    )}
                    {!comment.private && <PublicIcon fontSize="small" />}
                    <div>
                      <strong>{comment.comment_author_name}</strong> commented
                      on:
                    </div>
                  </div>
                  <div
                    onClick={() =>
                      handleClick(
                        comment.video_id,
                        comment.play_id,
                        comment.start_time,
                        comment.comment_id,
                        comment.team_id,
                        comment.viewed_by_author,
                      )
                    }
                    className={`flex w-full cursor-pointer flex-col gap-2 rounded-sm border-2 border-solid border-transparent p-2 transition ease-in-out hover:rounded-md hover:border-solid ${
                      isDark
                        ? "hover:border-purple-400"
                        : "hover:border-purple-A400"
                    } hover:delay-100 ${
                      !comment.viewed_by_author ? "bg-purple-100" : ""
                    }`}
                    style={
                      !comment.viewed_by_author
                        ? { backgroundColor: `${colors.purple[50]}` }
                        : backgroundStyle
                    }
                  >
                    <div className="text-center text-lg font-bold tracking-tight lg:text-xl">
                      {comment.video_title}
                    </div>
                    <Divider
                      sx={{ marginLeft: "12px", marginRight: "12px" }}
                    ></Divider>
                    <div className="ml-1 text-center">{comment.play_title}</div>
                  </div>
                </div>
              ))}
          </div>
          {comments && comments.length > 0 ? (
            <Button
              disabled={isBtnDisabled}
              onClick={() => void fetchComments(isUnreadOnly)}
            >
              Load More
            </Button>
          ) : (
            <div className="-mt-4 pl-2 font-bold">No recent comments</div>
          )}
        </>
      )}
    </div>
  );
};

export default InboxComments;
