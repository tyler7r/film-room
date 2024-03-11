import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Button, Divider, Drawer, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { useInboxContext } from "~/contexts/inbox";
import { useMobileContext } from "~/contexts/mobile";
import { supabase } from "~/utils/supabase";
import TeamLogo from "../team-logo";
import InboxMentions from "./mentions";

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

const Inbox = () => {
  const { isOpen, setIsOpen, page, setPage } = useInboxContext();
  const { user } = useAuthContext();
  const { screenWidth } = useMobileContext();
  const router = useRouter();

  const [mentions, setMentions] = useState<MentionType | null>(null);

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
    <Drawer open={isOpen} anchor="right" onClose={() => setIsOpen(false)}>
      <div className="p-2" style={{ width: screenWidth * 0.5 }}>
        <Typography className="p-2 text-center font-extrabold" variant="h2">
          Inbox
        </Typography>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col items-start gap-2">
            {user.currentAffiliation?.team && (
              <div className="flex w-full flex-col items-center justify-center gap-1">
                <div className="flex items-center justify-center gap-3">
                  <TeamLogo tm={user.currentAffiliation} size={55}></TeamLogo>
                  <Typography
                    variant="h5"
                    className="text-lg font-bold md:text-2xl lg:text-4xl"
                  >
                    {`${user.currentAffiliation.team.city}
                    ${user.currentAffiliation.team.name}`}
                  </Typography>
                </div>
                <Button
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => {
                    router.push(
                      `/team-hub/${user.currentAffiliation?.team.id}`,
                    );
                    setIsOpen(false);
                  }}
                  className="lg:text-lg"
                >
                  Go to Team Hub
                </Button>
              </div>
            )}
          </div>
          <Divider></Divider>
          <InboxMentions />
        </div>
      </div>
    </Drawer>
  );
};

export default Inbox;
