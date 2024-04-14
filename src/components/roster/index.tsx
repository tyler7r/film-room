import { Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { supabase } from "~/utils/supabase";
import type { PlayerType, TeamType } from "~/utils/types";
import Player from "../player";
import PlayerEdit from "../player-edit";

type RosterProps = {
  team: TeamType;
  role: string;
};

const Roster = ({ team, role }: RosterProps) => {
  const [roster, setRoster] = useState<PlayerType[] | null>(null);

  const fetchRoster = async () => {
    const { data } = await supabase
      .from("player_view")
      .select("*")
      .match({
        team_id: team.id,
        role: "player",
        verified: true,
      })
      .order("number");
    if (data && data.length > 0) {
      setRoster(data);
    } else {
      setRoster(null);
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel("roster_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "affiliations" },
        () => {
          void fetchRoster();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    void fetchRoster();
  }, [team.id]);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-2">
      <Typography variant="h2" fontSize={42}>
        Roster
      </Typography>
      {!roster && (
        <div className="text-xl font-bold">No Active Player Accounts</div>
      )}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {(role === "player" || role === "guest") &&
          roster?.map((p) => <Player key={p.id} player={p} />)}
        {(role === "coach" || role === "owner") &&
          roster?.map((p) => <PlayerEdit key={p.id} player={p} />)}
      </div>
    </div>
  );
};

export default Roster;
