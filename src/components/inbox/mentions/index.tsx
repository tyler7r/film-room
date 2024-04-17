import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import MailIcon from "@mui/icons-material/Mail";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PublicIcon from "@mui/icons-material/Public";
import { Button, Divider, IconButton, colors } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import TeamLogo from "~/components/team-logo";
import { useAffiliatedContext } from "~/contexts/affiliations";
import { useAuthContext } from "~/contexts/auth";
import { useInboxContext } from "~/contexts/inbox";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { RealMentionType } from "~/utils/types";

type InboxMentionsProps = {
  hide: boolean;
  setHide: (hide: boolean) => void;
};

const InboxMentions = ({ hide, setHide }: InboxMentionsProps) => {
  const { user, setUser } = useAuthContext();
  const { affiliations } = useAffiliatedContext();
  const { setIsOpen, page, setPage, setMentionCount } = useInboxContext();
  const { backgroundStyle, isDark } = useIsDarkContext();

  const searchParams = useSearchParams();
  const router = useRouter();
  const topRef = useRef<HTMLDivElement | null>(null);

  const [isUnreadOnly, setIsUnreadOnly] = useState(false);
  const [mentions, setMentions] = useState<RealMentionType | null>(null);
  const [isBtnDisabled, setIsBtnDisabled] = useState<boolean>(false);

  const fetchMentions = async (unreadOnly: boolean) => {
    const { from, to } = getFromAndTo();
    const mtns = supabase
      .from("inbox_mentions")
      .select(`*, team: teams!affiliations_team_id_fkey(*)`, {
        count: "exact",
      })
      .eq("receiver_id", `${user.userId}`)
      .range(from, to)
      .order("created_at", { ascending: false });
    setPage(page + 1);
    if (unreadOnly) {
      void mtns.eq("viewed", false);
    }
    const { data, count } = await mtns;
    if (count) {
      setMentionCount(count);
      if (to >= count - 1) setIsBtnDisabled(true);
    } else setMentionCount(0);
    if (data && data.length > 0) {
      setMentions(mentions ? [...mentions, ...data] : data);
    } else {
      setIsBtnDisabled(true);
      setMentions(null);
    }
  };

  const getFromAndTo = () => {
    const itemPerPage = 4;
    let from = page * itemPerPage;
    const to = from + itemPerPage;

    if (page > 0) {
      from += 1;
    }

    return { from, to };
  };

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

  const updateMention = async (mentionId: string) => {
    await supabase
      .from("play_mentions")
      .update({ viewed: true })
      .eq("id", mentionId);
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
    mentionId: string,
    teamId: string,
    viewed: boolean,
  ) => {
    const params = new URLSearchParams(searchParams);
    params.set("play", playId);
    params.set("start", `${start}`);
    if (!viewed) void updateMention(mentionId);
    void updateUserAffiliation(teamId);
    void updateLastWatched(videoId, start);
    void router.push(`/film-room/${videoId}?${params.toString()}`);
    setIsOpen(false);
  };

  const handleUnreadClick = () => {
    setMentions(null);
    setPage(0);
    setIsUnreadOnly(!isUnreadOnly);
  };

  const scrollToTop = () => {
    if (topRef) topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const channel = supabase
      .channel("affiliation_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "play_mentions" },
        () => {
          void fetchMentions(isUnreadOnly);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (user.isLoggedIn) void fetchMentions(isUnreadOnly);
  }, [isUnreadOnly]);

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={topRef}
        className="flex items-center justify-between text-2xl font-bold lg:mb-2 lg:text-3xl"
      >
        <div>Recent Mentions</div>
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
            {mentions &&
              mentions.length > 0 &&
              mentions.map((mention) => (
                <div key={mention.play_id + mention.created_at}>
                  <div className="flex items-center gap-2">
                    {mention.private && mention.team && (
                      <TeamLogo tm={mention.team} size={20} />
                    )}
                    {!mention.private && <PublicIcon fontSize="small" />}
                    <div>
                      <strong>{mention.author_name}</strong> mentioned you on:
                    </div>
                  </div>
                  <div
                    onClick={() =>
                      handleClick(
                        mention.video_id,
                        mention.play_id,
                        mention.start_time,
                        mention.mention_id,
                        mention.team_id,
                        mention.viewed,
                      )
                    }
                    className={`flex w-full cursor-pointer flex-col gap-2 rounded-sm border-2 border-solid border-transparent p-2 transition ease-in-out hover:rounded-md hover:border-solid ${
                      isDark
                        ? "hover:border-purple-400"
                        : "hover:border-purple-A400"
                    } hover:delay-100 ${
                      !mention.viewed ? "bg-purple-100" : ""
                    }`}
                    style={
                      !mention.viewed
                        ? { backgroundColor: `${colors.purple[50]}` }
                        : backgroundStyle
                    }
                  >
                    <div className="text-center text-lg font-bold tracking-tight lg:text-xl">
                      {mention.title}
                    </div>
                    <Divider
                      sx={{
                        marginLeft: "12px",
                        marginRight: "12px",
                      }}
                    ></Divider>
                    <div className="mx-4 text-center">{mention.play_title}</div>
                  </div>
                </div>
              ))}
          </div>
          {mentions && mentions.length > 0 ? (
            <div className="flex flex-col items-center justify-center">
              <Button
                disabled={isBtnDisabled}
                onClick={() => void fetchMentions(isUnreadOnly)}
                style={{ width: "100%" }}
              >
                Load More
              </Button>
              <Button
                size="small"
                variant="outlined"
                endIcon={<KeyboardDoubleArrowUpIcon />}
                onClick={() => scrollToTop()}
              >
                Jump to Top
              </Button>
            </div>
          ) : (
            <div className="-mt-4 pl-2 font-bold">No recent mentions</div>
          )}
        </>
      )}
    </div>
  );
};

export default InboxMentions;
