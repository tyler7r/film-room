import { Button, Typography } from "@mui/material";
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
    game_id: string;
    title: string;
    games: {
      tournament: string | null;
      season: string | null;
      title: string;
    } | null;
  } | null;
}[];

const InboxMentions = () => {
  const { user } = useAuthContext();
  const { setIsOpen, page, setPage } = useInboxContext();
  const { backgroundStyle } = useIsDarkContext();
  const router = useRouter();

  const [mentions, setMentions] = useState<MentionType | null>(null);
  const [isBtnDisabled, setIsBtnDisabled] = useState<boolean>(false);

  const fetchMentions = async () => {
    const { from, to } = getFromAndTo();
    const { data } = await supabase
      .from(`play_mentions`)
      .select(
        `*, plays(start_time, game_id, title, games(tournament, season, title))`,
      )
      .eq("receiver_id", `${user.userId}`)
      .order("created_at", { ascending: false })
      .range(from, to);
    setPage(page + 1);
    if (data) setMentions(mentions ? [...mentions, ...data] : data);
    if (data?.length === 0) setIsBtnDisabled(true);
  };

  const getFromAndTo = () => {
    const itemPerPage = 2;
    let from = page * itemPerPage;
    let to = from + itemPerPage;

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
      <Typography variant="h5" className="font-bold">
        Recent Mentions
      </Typography>
      <div className="flex flex-col gap-2">
        {mentions?.map((mention) => (
          <div
            key={mention.play_id + mention.created_at}
            onClick={() => {
              router.push(
                `/film-room/${mention.plays?.game_id}/${mention.plays?.start_time}`,
              );
              setIsOpen(false);
            }}
            className="flex w-full cursor-pointer flex-col gap-1 border-solid border-white p-2 hover:border-solid hover:border-purple-400"
            style={backgroundStyle}
          >
            <div className="text-lg">{mention.plays?.games?.title}</div>
            {/* <Divider></Divider> */}
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
