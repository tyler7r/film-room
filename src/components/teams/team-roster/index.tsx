import { useEffect, useState } from "react";
import { supabase } from "~/utils/supabase";
import type { PlayerType, TeamType } from "~/utils/types";
import User from "../../user";
import UserEdit from "../../user-edit";
import EmptyMessage from "../../utils/empty-msg";
import PageTitle from "../../utils/page-title";

type RosterProps = {
  team: TeamType;
  role: string;
};

const Roster = ({ team, role }: RosterProps) => {
  const [roster, setRoster] = useState<PlayerType[] | null>(null);
  const [rosterReload, setRosterReload] = useState<boolean>(false);

  const fetchRoster = async () => {
    const { data } = await supabase
      .from("user_view")
      .select("*")
      .match({
        "team->>id": team.id,
        "affiliation->>role": "player",
        "affiliation->>verified": true,
      })
      .order("affiliation->>number");
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
    if (rosterReload) void fetchRoster();
    else setRosterReload(false);
  }, [rosterReload]);

  useEffect(() => {
    void fetchRoster();
  }, [team.id]);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 p-2">
      <PageTitle size="medium" title="Roster" />
      {!roster && (
        <EmptyMessage message="active player accounts" size="small" />
      )}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {(role === "player" || role === "guest") &&
          roster?.map((p) => (
            <div key={p.affiliation.id}>
              <User
                user={p.profile}
                goToProfile={true}
                number={p.affiliation.number}
                small={true}
              />
            </div>
          ))}
        {(role === "coach" || role === "owner") &&
          roster?.map((p) => (
            <div key={p.affiliation.id}>
              <UserEdit
                user={p.profile}
                goToProfile={true}
                affiliation={p.affiliation}
                small={true}
                setRosterReload={setRosterReload}
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default Roster;
