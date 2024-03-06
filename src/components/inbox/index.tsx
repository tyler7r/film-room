import { Divider, Drawer, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";

type InboxProps = {
  isInboxOpen: boolean;
  setIsInboxOpen: () => void;
};

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

const Inbox = ({ isInboxOpen, setIsInboxOpen }: InboxProps) => {
  const { user } = useAuthContext();
  const { screenWidth } = useMobileContext();
  const { borderStyle, backgroundStyle } = useIsDarkContext();
  const router = useRouter();

  const [mentions, setMentions] = useState<MentionType | null>(null);

  const fetchMentions = async () => {
    const { data } = await supabase
      .from(`play_mentions`)
      .select(
        `*, plays(start_time, game_id, title, games(tournament, season, title))`,
      )
      .eq("receiver_id", `${user.userId}`)
      .order("created_at");
    if (data) setMentions(data);
  };

  useEffect(() => {
    if (user.isLoggedIn) void fetchMentions();
  }, []);

  return (
    <Drawer open={isInboxOpen} anchor="right" onClose={() => setIsInboxOpen()}>
      <div className="p-2" style={{ width: screenWidth * 0.5 }}>
        <Typography className="p-2 text-center" variant="h2" fontStyle="italic">
          Inbox
        </Typography>
        <div className="flex flex-col gap-3">
          <Typography variant="h5" className="">
            Your Mentions
          </Typography>
          {mentions?.map((mention) => (
            <div
              key={mention.play_id + mention.created_at}
              onClick={() => {
                router.push(
                  `film-room/${mention.plays?.game_id}/${mention.plays?.start_time}`,
                );
                setIsInboxOpen();
              }}
              className="flex w-full cursor-pointer flex-col p-2 hover:border-solid hover:border-purple-400"
              style={backgroundStyle}
            >
              <div className="text-lg">{mention.plays?.games?.title}</div>
              <div className="text-md flex items-center gap-2">
                <div className="font-bold">{mention.sender_name}</div>
                <div>{mention.plays?.title}</div>
              </div>
            </div>
          ))}
          <Divider></Divider>
          <Typography variant="h5" className="">
            Team Announcements
          </Typography>
        </div>
      </div>
    </Drawer>
  );
};

export default Inbox;
