import SettingsIcon from "@mui/icons-material/Settings";
import { Button, Typography } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Announcement from "~/components/announcement";
import Requests from "~/components/requests";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";

export type TeamHubType = {
  city: string;
  division: string;
  id: string;
  logo: string | null;
  name: string;
  owner: string | null;
} | null;

type RosterType = {
  id: string;
  name: string;
  num: number | null;
}[];

const TeamHub = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState<boolean>(true);
  const [team, setTeam] = useState<TeamHubType | undefined>(undefined);
  const [role, setRole] = useState<string>("");
  const [roster, setRoster] = useState<RosterType | undefined>(undefined);
  const [modalStatus, setModalStatus] = useState({
    roster: false,
    announcement: false,
    requests: false,
  });

  const fetchTeam = async () => {
    const { data } = await supabase
      .from("affiliations")
      .select(`role, teams(*)`)
      .match({ team_id: `${router.query.team}`, user_id: user.userId })
      .single();
    if (data) {
      setTeam(data.teams);
      setRole(data.role);
      setLoading(false);
    }
  };

  const fetchRoster = async () => {
    const { data } = await supabase
      .from("affiliations")
      .select("number, user_id, profiles(name)")
      .match({
        team_id: `${router.query.team}`,
        role: "player",
        verified: true,
      });
    if (data) {
      const r = data.map((p) => {
        return { id: p.user_id, name: p.profiles?.name!, num: p.number };
      });
      setRoster(r);
    }
  };

  const handleModalToggle = (modal: string, open: boolean) => {
    if (modal === "roster") {
      setModalStatus({ roster: open, announcement: false, requests: false });
    } else if (modal === "announcement") {
      setModalStatus({ roster: false, announcement: open, requests: false });
    } else {
      setModalStatus({ roster: false, announcement: false, requests: open });
    }
  };

  useEffect(() => {
    void fetchTeam();
    void fetchRoster();
  }, [user]);

  return loading ? (
    <Typography variant="h1" fontSize={72}>
      Loading...
    </Typography>
  ) : (
    team && (
      <div className="mx-2 flex flex-col items-center justify-center">
        <div className="m-2 flex items-center justify-center gap-2">
          <Image
            src={team.logo!}
            className="rounded-full"
            alt="team-logo"
            height={80}
            width={80}
          />
          <Typography variant="h1" fontSize={64} className="text-center">
            {team.city} {team.name}
          </Typography>
        </div>
        {role === "owner" && (
          <Button size="small" endIcon={<SettingsIcon />}>
            Team Settings
          </Button>
        )}
        {(role === "owner" || role === "coach") && (
          <div>
            <Button
              variant={modalStatus.roster ? "outlined" : "text"}
              onClick={() => handleModalToggle("roster", !modalStatus.roster)}
            >
              Edit Roster
            </Button>
            <Button
              variant={modalStatus.announcement ? "outlined" : "text"}
              onClick={() =>
                handleModalToggle("announcement", !modalStatus.announcement)
              }
            >
              Send Announcement
            </Button>
            <Button
              variant={modalStatus.requests ? "outlined" : "text"}
              onClick={() =>
                handleModalToggle("requests", !modalStatus.requests)
              }
            >
              Handle Requests
            </Button>
          </div>
        )}
        {modalStatus.announcement && (
          <Announcement team={team} toggleOpen={handleModalToggle} />
        )}
        {modalStatus.requests && (
          <Requests toggleOpen={handleModalToggle} team={team} />
        )}
        <div>
          <Typography variant="h2" fontSize={42}>
            Roster
          </Typography>
          {roster?.map((p) => (
            <div key={p.id}>
              {p.name} {p.num}
            </div>
          ))}
        </div>
        <div>
          <Typography variant="h2" fontSize={42}>
            Recent Games
          </Typography>
        </div>
      </div>
    )
  );
};

export default TeamHub;
