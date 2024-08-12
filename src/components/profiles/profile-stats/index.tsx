import { Divider, colors } from "@mui/material";
import { useEffect, useState } from "react";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { StatsType } from "~/utils/types";

type ProfileStatsProps = {
  profileId: string | undefined;
  changeActionBar: (topic: "createdPlays" | "highlights" | "mentions") => void;
};

const ProfileStats = ({ profileId, changeActionBar }: ProfileStatsProps) => {
  const { isDark } = useIsDarkContext();

  const [stats, setStats] = useState<StatsType>({
    mentionCount: 0,
    playCount: 0,
    highlightCount: 0,
  });

  const fetchStats = async () => {
    if (profileId) {
      const getMentions = await supabase
        .from("plays_via_user_mention")
        .select("*", {
          count: "exact",
        })
        .eq("mention->>receiver_id", profileId);
      const getHighlights = await supabase
        .from("plays_via_user_mention")
        .select("*", {
          count: "exact",
        })
        .match({
          "play->>highlight": true,
          "mention->>receiver_id": profileId,
        });
      const getPlays = await supabase
        .from("play_preview")
        .select("*", {
          count: "exact",
        })
        .eq("play->>author_id", profileId);
      setStats({
        mentionCount: getMentions.count ? getMentions.count : 0,
        highlightCount: getHighlights.count ? getHighlights.count : 0,
        playCount: getPlays.count ? getPlays.count : 0,
      });
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel("play_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "plays" },
        () => {
          void fetchStats();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("mention_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mentions" },
        () => {
          void fetchStats();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    void fetchStats();
  }, [profileId]);

  return (
    stats && (
      <div
        className="flex w-full cursor-default items-center justify-around gap-2 rounded-md p-2 md:w-4/5"
        style={
          isDark
            ? { backgroundColor: `${colors.purple[200]}` }
            : { backgroundColor: `${colors.purple[50]}` }
        }
      >
        <div
          className="flex cursor-pointer flex-col items-center justify-center"
          onClick={() => changeActionBar("createdPlays")}
        >
          <div className="text-3xl font-bold tracking-tight">
            {stats.playCount}
          </div>
          <div className="text-base font-light italic leading-4 tracking-tighter">
            created
          </div>
        </div>
        <Divider flexItem orientation="vertical" />
        <div
          className="flex cursor-pointer flex-col items-center justify-center"
          onClick={() => changeActionBar("mentions")}
        >
          <div className="text-3xl font-bold tracking-tight">
            {stats.mentionCount}
          </div>
          <div className="font-light italic leading-4 tracking-tighter">
            mentions
          </div>
        </div>
        <Divider flexItem orientation="vertical" />
        <div
          className="flex cursor-pointer flex-col items-center justify-center"
          onClick={() => changeActionBar("highlights")}
        >
          <div className="text-3xl font-bold tracking-tight">
            {stats.highlightCount}
          </div>
          <div className="font-light italic leading-4 tracking-tighter">
            highlights
          </div>
        </div>
      </div>
    )
  );
};

export default ProfileStats;
