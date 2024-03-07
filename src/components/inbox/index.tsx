import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Button, Divider, Drawer, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { useInboxContext } from "~/contexts/inbox";
import { useMobileContext } from "~/contexts/mobile";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";

// type InboxProps = {
//   isInboxOpen: boolean;
//   setIsInboxOpen: () => void;
// };

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

type AnnouncementType = {
  author_id: string;
  author_name: string;
  created_at: string;
  id: string;
  team_id: string;
  text: string;
};

const Inbox = () => {
  const { isOpen, setIsOpen, page, setPage } = useInboxContext();
  const { user } = useAuthContext();
  const { screenWidth } = useMobileContext();
  const { backgroundStyle } = useIsDarkContext();
  const router = useRouter();

  const [mentions, setMentions] = useState<MentionType | null>(null);
  const [announcement, setAnnouncement] = useState<AnnouncementType | null>(
    null,
  );

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
  };

  const fetchLastAnnouncement = async () => {
    const { data } = await supabase
      .from("announcements")
      .select()
      .order("created_at")
      .limit(1)
      .single();
    if (data) setAnnouncement(data);
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
    if (user.isLoggedIn && user.currentAffiliation)
      void fetchLastAnnouncement();
  }, []);

  return (
    <Drawer open={isOpen} anchor="right" onClose={() => setIsOpen(false)}>
      <div className="p-2" style={{ width: screenWidth * 0.5 }}>
        <Typography className="p-2 text-center" variant="h3" fontStyle="italic">
          Inbox
        </Typography>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col items-start gap-2">
            <Typography variant="h5">Last Team Announcement</Typography>
            <div>
              <strong>{announcement?.author_name}:</strong> {announcement?.text}
            </div>
            <Button
              endIcon={<ArrowForwardIcon />}
              onClick={() => {
                router.push(`/team-hub/${announcement?.team_id}`);
                setIsOpen(false);
              }}
            >
              Go to Team Hub
            </Button>
          </div>
          <Divider></Divider>
          <div className="flex flex-col gap-2">
            <Typography variant="h5" className="">
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
                  className="flex w-full cursor-pointer flex-col border-solid border-white p-2 hover:border-solid hover:border-purple-400"
                  style={backgroundStyle}
                >
                  <div className="text-lg">{mention.plays?.games?.title}</div>
                  <div>
                    <strong>{mention.sender_name}:</strong>{" "}
                    {mention.plays?.title}
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={() => void fetchMentions()}>Load More</Button>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default Inbox;
