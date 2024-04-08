import { Button, Typography } from "@mui/material";
import {
  type GetServerSideProps,
  type GetServerSidePropsContext,
  type InferGetServerSidePropsType,
} from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Announcement from "~/components/announcement";
import Requests from "~/components/requests";
import Roster from "~/components/roster";
import TeamVideos from "~/components/team-videos";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import { type TeamHubType } from "~/utils/types";

export const getServerSideProps = (async (
  context: GetServerSidePropsContext,
) => {
  const tId = context.query.team as string;
  const teamData = await supabase.from("teams").select().eq("id", tId).single();
  const team: TeamHubType = teamData.data;
  return { props: { team } };
}) satisfies GetServerSideProps<{ team: TeamHubType }>;

const TeamHub = ({
  team,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const { user } = useAuthContext();
  const role = user.currentAffiliation?.role ?? "";
  const [loading, setLoading] = useState<boolean>(true);
  const [modalStatus, setModalStatus] = useState({
    settings: false,
    announcement: false,
    requests: false,
  });

  const handleModalToggle = (modal: string, open: boolean) => {
    if (modal === "roster") {
      setModalStatus({ settings: open, announcement: false, requests: false });
    } else if (modal === "announcement") {
      setModalStatus({ settings: false, announcement: open, requests: false });
    } else {
      setModalStatus({ settings: false, announcement: false, requests: open });
    }
  };

  useEffect(() => {
    console.log(user.currentAffiliation?.role);
    if (user.isLoggedIn && user.currentAffiliation?.role) setLoading(false);
  }, [user, router.query.team]);

  return loading ? (
    <Typography variant="h1" fontSize={72}>
      Loading...
    </Typography>
  ) : (
    team && (
      <div className="mx-2 my-4 flex flex-col items-center justify-center gap-4">
        <div className="m-2 flex items-center justify-center gap-5">
          {team.logo ? (
            <Image
              src={team.logo}
              className="rounded-full"
              alt="team-logo"
              height={150}
              width={150}
            />
          ) : (
            <div className="rounded-full bg-fuchsia-500 p-3 text-4xl text-white">{`${team.city.slice(
              0,
              1,
            )}${team.name.slice(0, 1)}`}</div>
          )}
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <Typography variant="h1" fontSize={64}>
              {team.full_name}
            </Typography>
            <Typography variant="caption" fontWeight="bold" fontSize={18}>
              Division: {team.division}
            </Typography>
          </div>
        </div>
        {(role === "coach" || role === "owner") && (
          <div className="flex w-full justify-center gap-4">
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
            {role === "owner" && (
              <Button
                size="small"
                onClick={() => router.push(`/team-settings/${team.id}`)}
              >
                Team Settings
              </Button>
            )}
          </div>
        )}
        {modalStatus.announcement && (
          <Announcement team={team} toggleOpen={handleModalToggle} />
        )}
        {modalStatus.requests && <Requests team={team} />}
        <Roster team={team} role={role} />
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
