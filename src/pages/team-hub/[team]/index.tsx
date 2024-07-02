import { Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Announcements from "~/components/announcements";
import PageTitle from "~/components/page-title";
import Roster from "~/components/roster";
import TeamActionBar from "~/components/team-action-bar";
import TeamLogo from "~/components/team-logo";
import TeamVideos from "~/components/team-videos";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { TeamActionBarType, TeamType } from "~/utils/types";

const TeamHub = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { isDark } = useIsDarkContext();

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
      <div className="flex w-full flex-col items-center justify-center gap-4 p-2">
        <div className="m-2 flex items-center justify-center gap-3">
          <TeamLogo size={150} tm={team} />
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <PageTitle size="large" title={team.full_name} />
            <div
              className={`text-3xl font-bold ${
                isDark ? "text-purple-400" : "text-purple-A400"
              }`}
            >
              {team.division.toLocaleUpperCase()}
            </div>
          </div>
        </div>
        <TeamActionBar
          role={role ? role : "guest"}
          actionBarStatus={actionBarStatus}
          setActionBarStatus={setActionBarStatus}
          team={team}
        />
        {role !== "guest" && <Announcements teamId={team.id} />}
        <Roster team={team} role={role ? role : "guest"} />
        <div className="my-4 flex w-full flex-col items-center justify-center gap-4">
          <PageTitle size="medium" title="Team Film" />
          <TeamVideos teamId={team.id} />
        </div>
      </div>
    )
  );
};

export default TeamHub;
