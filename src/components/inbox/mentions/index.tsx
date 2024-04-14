import PublicIcon from "@mui/icons-material/Public";
import { Button, Divider, colors } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import TeamLogo from "~/components/team-logo";
import { useAuthContext } from "~/contexts/auth";
import { useInboxContext } from "~/contexts/inbox";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { RealMentionType } from "~/utils/types";

const InboxMentions = () => {
  const { user } = useAuthContext();
  const { setIsOpen, page, setPage, setMentionCount, setUnreadCount } =
    useInboxContext();
  const { backgroundStyle, isDark } = useIsDarkContext();

  const searchParams = useSearchParams();
  const router = useRouter();

  const [mentions, setMentions] = useState<RealMentionType | null>(null);
  const [isBtnDisabled, setIsBtnDisabled] = useState<boolean>(false);

  const fetchMentions = async () => {
    const { from, to } = getFromAndTo();
    const { data, count } = await supabase
      .from("inbox_mentions")
      .select(`*, team: teams!affiliations_team_id_fkey(*)`, {
        count: "exact",
      })
      .eq("receiver_id", `${user.userId}`)
      .range(from, to)
      .order("created_at", { ascending: false });
    setPage(page + 1);
    if (count) {
      setMentionCount(count);
      if (to >= count - 1) setIsBtnDisabled(true);
    }
    if (data) setMentions(mentions ? [...mentions, ...data] : data);
    if (data?.length === 0) setIsBtnDisabled(true);
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

  useEffect(() => {
    const channel = supabase
      .channel("affiliation_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "play_mentions" },
        () => {
          void fetchMentions();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const updateLastWatched = async (video: string, time: number) => {
    await supabase
      .from("affiliations")
      .update({
        last_watched: video,
        last_watched_time: time,
      })
      .eq("id", `${user.currentAffiliation?.affId}`)
      .select();
  };

  const updateMention = async (playId: string) => {
    await supabase
      .from("play_mentions")
      .update({ viewed: true })
      .eq("play_id", playId);
  };

  const handleClick = async (
    videoId: string,
    playId: string,
    start: number,
  ) => {
    const params = new URLSearchParams(searchParams);
    params.set("play", playId);
    params.set("start", `${start}`);
    void updateMention(playId);
    void updateLastWatched(videoId, start);
    void router.push(`/film-room/${videoId}?${params.toString()}`);
    setIsOpen(false);
  };

  useEffect(() => {
    if (user.isLoggedIn) void fetchMentions();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="text-2xl font-bold lg:mb-2 lg:text-3xl">
        Recent Mentions
      </div>
      <div className="flex flex-col gap-5 md:px-2 lg:px-4">
        {mentions?.map((mention) => (
          <div
            key={mention.play_id + mention.created_at}
            onClick={() =>
              handleClick(mention.video_id, mention.play_id, mention.start_time)
            }
            className={`flex w-full cursor-pointer flex-col gap-2 rounded-sm border-2 border-solid border-transparent p-2 transition ease-in-out hover:rounded-md hover:border-solid ${
              isDark ? "hover:border-purple-400" : "hover:border-purple-A400"
            } hover:delay-100 ${!mention.viewed ? "bg-purple-100" : ""}`}
            style={
              !mention.viewed
                ? { backgroundColor: `${colors.purple[50]}` }
                : backgroundStyle
            }
          >
            {!mention.private && (
              <div className="flex items-center justify-center gap-1">
                <div className="lg:text-md text-sm tracking-tighter">
                  PUBLIC
                </div>
                <PublicIcon fontSize="small" />
              </div>
            )}
            {mention.private && mention.team && (
              <div className="flex items-center justify-center gap-2">
                <div className="lg:text-md text-sm tracking-tighter">
                  PRIVATE TO:{" "}
                </div>
                <TeamLogo tm={mention.team} size={20} />
              </div>
            )}
            <div className="text-center text-lg lg:text-xl">
              {mention.title}
            </div>
            <Divider sx={{ marginLeft: "12px", marginRight: "12px" }}></Divider>
            <div className="ml-1">
              <strong>{mention.author_name}:</strong> {mention.play_title}
            </div>
          </div>
        ))}
      </div>
      {mentions && mentions.length > 0 ? (
        <Button disabled={isBtnDisabled} onClick={() => void fetchMentions()}>
          Load More
        </Button>
      ) : (
        <div className="pl-2 font-bold">No recent mentions</div>
      )}
    </div>
  );
};

export default InboxMentions;
