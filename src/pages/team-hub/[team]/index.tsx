import { Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Announcements from "~/components/announcements";
import PageTitle from "~/components/page-title";
import Requests from "~/components/requests";
import Roster from "~/components/roster";
import TeamActionBar from "~/components/team-action-bar";
import TeamCollections from "~/components/team-collections";
import TeamLogo from "~/components/team-logo";
import TeamVideos from "~/components/team-videos";
import TransferOwnershipModal from "~/components/transfer-ownership";
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
  }, [router.query.team, role]);

  return loading ? (
    <Typography sx={{ textAlign: "center" }} variant="h1" fontSize={72}>
      Loading...
    </Typography>
  ) : (
    team && (
      <div className="flex w-full flex-col items-center justify-center gap-6 p-4">
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
        <TransferOwnershipModal
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
          <div className="flex flex-col items-center justify-center gap-6">
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
