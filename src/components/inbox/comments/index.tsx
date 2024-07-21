import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import MailIcon from "@mui/icons-material/Mail";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { Button, Divider, IconButton, colors } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import EmptyMessage from "~/components/empty-msg";
import { useAuthContext } from "~/contexts/auth";
import { useInboxContext } from "~/contexts/inbox";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { CommentNotificationType } from "~/utils/types";

type InboxCommentsProps = {
  hide: boolean;
  setHide: (hide: boolean) => void;
};

const InboxComments = ({ hide, setHide }: InboxCommentsProps) => {
  const { user } = useAuthContext();
  const { setIsOpen, commentPage, setCommentPage, setCommentCount } =
    useInboxContext();
  const { backgroundStyle, isDark, hoverBorder, hoverText } =
    useIsDarkContext();

  const searchParams = useSearchParams();
  const router = useRouter();

  const topRef = useRef<HTMLDivElement | null>(null);

  const [isUnreadOnly, setIsUnreadOnly] = useState(false);
  const [comments, setComments] = useState<CommentNotificationType[] | null>(
    null,
  );
  const [isBtnDisabled, setIsBtnDisabled] = useState<boolean>(false);

  const fetchComments = async (unreadOnly: boolean) => {
    const { from, to } = getFromAndTo();
    const cmts = supabase
      .from("comment_notification")
      .select(`*`, {
        count: "exact",
      })
      .eq("play->>author_id", `${user.userId}`)
      .range(from, to)
      .order("comment->>created_at", { ascending: false });
    setCommentPage(commentPage + 1);
    if (unreadOnly) {
      void cmts.eq("comment->>viewed", false);
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
    const itemPerPage = 5;
    let from = commentPage * itemPerPage;
    const to = from + itemPerPage;

    if (commentPage > 0) {
      from += 1;
    }

    return { from, to };
  };

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

  const updateComment = async (commentId: string) => {
    await supabase
      .from("comments")
      .update({ viewed: true })
      .eq("id", commentId);
  };

  const handleClick = async (
    videoId: string,
    playId: string,
    start: number,
    commentId: string,
    viewed: boolean,
  ) => {
    const params = new URLSearchParams(searchParams);
    params.set("play", playId);
    params.set("start", `${start}`);
    if (!viewed) void updateComment(commentId);
    void updateLastWatched(videoId, start);
    void router.push(`/film-room/${videoId}?${params.toString()}`);
    setIsOpen(false);
  };

  const handleUnreadClick = () => {
    setComments(null);
    setCommentPage(0);
    setIsUnreadOnly(!isUnreadOnly);
  };

  const scrollToTop = () => {
    if (topRef) topRef.current?.scrollIntoView({ behavior: "smooth" });
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

  useEffect(() => {
    if (user.isLoggedIn) void fetchComments(isUnreadOnly);
  }, [isUnreadOnly]);

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={topRef}
        className="flex items-center justify-between text-2xl font-bold lg:mb-2 lg:text-3xl"
      >
        <div>Recent Comments</div>
        {hide && (
          <IconButton size="small" onClick={() => setHide(false)}>
            <KeyboardArrowRightIcon />
          </IconButton>
        )}
        {!hide && (
          <div className="flex gap-2">
            <IconButton size="small" onClick={() => handleUnreadClick()}>
              {isUnreadOnly ? (
                <MailIcon color="primary" />
              ) : (
                <MailOutlineIcon color="primary" />
              )}
            </IconButton>
            <IconButton size="small" onClick={() => setHide(true)}>
              <ExpandMoreIcon />
            </IconButton>
          </div>
        )}
      </div>
      {!hide && (
        <>
          <div className="flex flex-col gap-5 md:px-2 lg:px-4">
            {comments?.map((notification) => (
              <div key={notification.play.id + notification.comment.created_at}>
                <div>
                  <strong
                    className={hoverText}
                    onClick={() => {
                      setIsOpen(false);
                      void router.push(
                        `/profile/${notification.play.author_id}`,
                      );
                    }}
                  >
                    {notification.comment.author_name}
                  </strong>{" "}
                  commented on:
                </div>
                <div
                  onClick={() =>
                    handleClick(
                      notification.video.id,
                      notification.play.id,
                      notification.play.start_time,
                      notification.comment.id,
                      notification.comment.viewed,
                    )
                  }
                  className={`flex w-full flex-col gap-2 ${hoverBorder}`}
                  style={
                    !notification.comment.viewed
                      ? isDark
                        ? { backgroundColor: `${colors.purple[200]}` }
                        : { backgroundColor: `${colors.purple[50]}` }
                      : backgroundStyle
                  }
                >
                  <div className="text-center text-lg font-bold tracking-tight lg:text-xl">
                    {notification.video.title}
                  </div>
                  <Divider
                    sx={{ marginLeft: "12px", marginRight: "12px" }}
                  ></Divider>
                  <div className="ml-1 text-center">
                    {notification.play.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {comments && comments.length > 0 ? (
            <div className="flex flex-col items-center justify-center gap-1">
              <Button
                disabled={isBtnDisabled}
                onClick={() => void fetchComments(isUnreadOnly)}
                sx={{ width: "100%" }}
              >
                Load More
              </Button>
              <Button
                variant="outlined"
                endIcon={<KeyboardDoubleArrowUpIcon />}
                onClick={() => scrollToTop()}
                size="small"
              >
                Jump to Top
              </Button>
            </div>
          ) : (
            <EmptyMessage message="recent comments" size="small" />
          )}
        </>
      )}
    </div>
  );
};

export default InboxComments;
