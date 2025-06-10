import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { IconButton } from "@mui/material";
import { useEffect, useState } from "react";
import EmptyMessage from "~/components/utils/empty-msg";
import { supabase } from "~/utils/supabase";
import type { PlayerType, TeamType } from "~/utils/types";
import User from "../../user";
import UserEdit from "../../user-edit";
import PageTitle from "../../utils/page-title";

type RosterProps = {
  team: TeamType;
  role: string;
};

const Roster = ({ team, role }: RosterProps) => {
  const [roster, setRoster] = useState<PlayerType[] | null>(null);
  const [rosterReload, setRosterReload] = useState<boolean>(false);
  const [hide, setHide] = useState(false);

  const fetchRoster = async () => {
    const { data } = await supabase
      .from("user_view")
      .select("*")
      .match({
        "team->>id": team.id,
        "affiliation->>verified": true,
      })
      .order("profile->>name", { ascending: true });
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
    if (rosterReload) {
      void fetchRoster();
      setRosterReload(false);
    } else return;
  }, [rosterReload]);

  useEffect(() => {
    void fetchRoster();
  }, [team.id]);

  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 p-2">
      <div className="flex w-full items-center justify-center gap-2">
        <PageTitle size="small" title="Roster" fullWidth={false} />
        {hide ? (
          <IconButton onClick={() => setHide(false)} size="small">
            <KeyboardArrowRightIcon />
          </IconButton>
        ) : (
          <IconButton onClick={() => setHide(true)} size="small">
            <KeyboardArrowDownIcon />
          </IconButton>
        )}
      </div>
      {!hide &&
        (!roster ? (
          <EmptyMessage message="active player accounts" />
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-4">
            {(role === "player" || role === "guest") &&
              roster?.map((p) => (
                <div key={p.affiliation.id}>
                  <User
                    user={p.profile}
                    goToProfile={true}
                    number={p.affiliation.number}
                    small={true}
                    coach={p.affiliation.role === "coach" ? true : false}
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
        ))}
    </div>
  );
};

export default Roster;
