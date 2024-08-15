import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Announcements from "~/components/announcements/all-announcements";
import Requests from "~/components/requests";
import TeamActionBar from "~/components/teams/team-action-bar";
import TeamCollections from "~/components/teams/team-collections";
import TeamLogo from "~/components/teams/team-logo";
import Roster from "~/components/teams/team-roster";
import TeamVideos from "~/components/teams/team-videos";
import TransferTeamOwnershipModal from "~/components/teams/transfer-team-ownership";
import PageTitle from "~/components/utils/page-title";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { TeamActionBarType, TeamType } from "~/utils/types";

const TeamHub = () => {
  const router = useRouter();
  const { user, affiliations } = useAuthContext();
  const { isDark } = useIsDarkContext();

  const [team, setTeam] = useState<TeamType | null>(null);
  const [requestCount, setRequestCount] = useState<number>(0);

  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionBarStatus, setActionBarStatus] = useState<TeamActionBarType>({
    requests: false,
    transferOwner: false,
  });

  const fetchUserRole = () => {
    const affRole = affiliations?.find((aff) => aff.team.id === team?.id)?.role;
    if (team?.owner === user.userId) {
      setRole("owner");
    } else {
      setRole(affRole ? affRole : "guest");
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
    const channel = supabase
      .channel("team_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "teams" },
        () => {
          if (team) void fetchUserRole();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (team) {
      setLoading(false);
      void fetchUserRole();
    }
  }, [user, team]);

  useEffect(() => {
    setLoading(true);
    void fetchTeam();
    setActionBarStatus({ requests: false, transferOwner: false });
  }, [router.query.team, role]);

  return loading ? (
    <PageTitle size="large" title="Loading..." />
  ) : (
    team && (
      <div className="flex w-full flex-col items-center justify-center gap-8 p-4">
        <div className="m-2 flex items-center justify-center gap-3">
          <TeamLogo size={150} tm={team} />
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <PageTitle size="large" title={team.full_name} />
            <div
              className={`text-3xl font-bold tracking-tight ${
                isDark ? "text-purple-400" : "text-purple-A400"
              }`}
            >
              {team.division.toLocaleUpperCase()}
            </div>
          </div>
          <TeamActionBar
            role={role ? role : "guest"}
            actionBarStatus={actionBarStatus}
            setActionBarStatus={setActionBarStatus}
            team={team}
            requestCount={requestCount}
          />
        </div>
        <Requests
          team={team}
          isOpen={actionBarStatus.requests}
          setRequestCount={setRequestCount}
        />
        <TransferTeamOwnershipModal
          toggleOpen={() =>
            setActionBarStatus({
              ...actionBarStatus,
              transferOwner: !actionBarStatus.transferOwner,
            })
          }
          team={team}
          isOpen={actionBarStatus.transferOwner}
          setRole={setRole}
        />
        {role !== "guest" && (
          <div className="flex w-full flex-col items-center justify-center gap-6">
            <Announcements teamId={team.id} role={role ? role : "guest"} />
            <TeamCollections teamId={team.id} />
          </div>
        )}
        <Roster team={team} role={role ? role : "guest"} />
        <TeamVideos teamId={team.id} />
      </div>
    )
  );
};

export default TeamHub;
