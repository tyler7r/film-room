import { Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Roster from "~/components/roster";
import TeamActionBar from "~/components/team-action-bar";
import TeamLogo from "~/components/team-logo";
import TeamVideos from "~/components/team-videos";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import { type TeamType } from "~/utils/types";

export type TeamActionBarType = {
  settings: boolean;
  announcement: boolean;
  requests: boolean;
};

const TeamHub = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const [team, setTeam] = useState<TeamType | null>(null);

  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionBarStatus, setActionBarStatus] = useState<TeamActionBarType>({
    settings: false,
    announcement: false,
    requests: false,
  });

  const fetchUserRole = () => {
    if (team?.owner === user.userId) {
      setRole("owner");
    } else if (
      user.currentAffiliation &&
      user.currentAffiliation?.team.id === team?.id
    ) {
      setRole(user.currentAffiliation.role);
    } else {
      setRole("guest");
    }
  };

  const fetchTeam = async () => {
    const tId = router.query.team as string;
    const { data } = await supabase
      .from("teams")
      .select()
      .eq("id", tId)
      .single();
    if (data) setTeam(data);
  };

  useEffect(() => {
    if (team) {
      setLoading(false);
      void fetchUserRole();
    }
  }, [user, team]);

  useEffect(() => {
    setLoading(true);
    void fetchTeam();
  }, [router.query.team]);

  return loading ? (
    <Typography variant="h1" fontSize={72}>
      Loading...
    </Typography>
  ) : (
    team && (
      <div className="mx-2 my-4 flex flex-col items-center justify-center gap-4">
        <div className="m-2 flex items-center justify-center gap-5">
          <TeamLogo size={150} tm={team} />
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <Typography variant="h1" fontSize={64}>
              {team.full_name}
            </Typography>
            <Typography variant="caption" fontWeight="bold" fontSize={18}>
              Division: {team.division}
            </Typography>
          </div>
        </div>
        <TeamActionBar
          role={role ? role : "guest"}
          actionBarStatus={actionBarStatus}
          setActionBarStatus={setActionBarStatus}
          team={team}
        />
        <Roster team={team} role={role ? role : "guest"} />
        <div className="my-4 flex w-full flex-col items-center justify-center gap-4">
          <Typography variant="h2" fontSize={42}>
            Team Film
          </Typography>
          <TeamVideos teamId={team.id} />
        </div>
      </div>
    )
  );
};

export default TeamHub;
