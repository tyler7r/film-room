import { Button, Divider, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { useInboxContext } from "~/contexts/inbox";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";

type MentionType = {
  created_at: string;
  play_id: string;
  receiver_id: string;
  receiver_name: string;
  sender_id: string;
  sender_name: string;
  plays: {
    start_time: number;
    video_id: string;
    title: string;
    videos: {
      tournament: string | null;
      season: string | null;
      title: string;
    } | null;
  } | null;
}[];

const InboxMentions = () => {
  const { user } = useAuthContext();
  const { setIsOpen, page, setPage } = useInboxContext();
  const { backgroundStyle, isDark } = useIsDarkContext();
  const router = useRouter();

  const [mentions, setMentions] = useState<MentionType | null>(null);
  const [isBtnDisabled, setIsBtnDisabled] = useState<boolean>(false);

  const fetchMentions = async () => {
    const { from, to } = getFromAndTo();
    const { data } = await supabase
      .from(`play_mentions`)
      .select(
        `*, plays(start_time, video_id, title, videos(tournament, season, title))`,
      )
      .match({
        receiver_id: `${user.userId}`,
      })
      .order("created_at", { ascending: false })
      .range(from, to);
    setPage(page + 1);
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

  useEffect(() => {
    if (user.isLoggedIn) void fetchMentions();
  }, []);

  return (
    <div className="flex flex-col gap-1">
      <Typography variant="h5" className="font-bold lg:mb-2 lg:text-3xl">
        Recent Mentions
      </Typography>
      <div className="flex flex-col gap-5 md:px-2 lg:px-4">
        {mentions?.map((mention) => (
          <div
            key={mention.play_id + mention.created_at}
            onClick={() => {
              void router.push(
                `/film-room/${mention.plays?.video_id}/${mention.plays?.start_time}`,
              );
              setIsOpen(false);
            }}
            className={`flex w-full cursor-pointer flex-col gap-1 rounded-sm border-2 border-solid border-transparent p-2 transition ease-in-out hover:rounded-md hover:border-solid ${
              isDark ? "hover:border-purple-400" : "hover:border-purple-A400"
            } hover:delay-100`}
            style={backgroundStyle}
          >
            <div className="text-center text-lg lg:text-start lg:text-xl">
              {mention.plays?.videos?.title}
            </div>
            <Divider className="mx-3"></Divider>
            <div>
              <strong>{mention.sender_name}:</strong> {mention.plays?.title}
            </div>
          </div>
        ))}
      </div>
      {mentions ? (
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
