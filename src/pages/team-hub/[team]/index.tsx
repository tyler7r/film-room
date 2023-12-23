import SettingsIcon from "@mui/icons-material/Settings";
import { Button, Typography } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";

type TeamHubType = {
  city: string;
  division: string;
  id: string;
  logo: string | null;
  name: string;
  owner: string | null;
} | null;

const TeamHub = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState<boolean>(true);
  const [team, setTeam] = useState<TeamHubType | undefined>(undefined);
  const [role, setRole] = useState<string>("");
  const [roster, setRoster] = useState<string[] | undefined>(undefined);

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
      .select("profiles(name)")
      .match({
        team_id: `${router.query.team}`,
        verified: true,
      })
      .neq("role", "coach");
    if (data) {
      const ros: string[] = data.map((player) => player.profiles?.name!);
      setRoster(ros);
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
            <Button>Edit Roster</Button>
            <Button>Send Announcement</Button>
            <Button>Handle Requests</Button>
          </div>
        )}
        <div>
          <Typography variant="h2" fontSize={42}>
            Roster
          </Typography>
          {roster?.map((p) => <div key={p}>{p}</div>)}
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
