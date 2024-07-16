import { Divider } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { TeamType, UserType } from "~/utils/types";
import EmptyMessage from "../empty-msg";
import PageTitle from "../page-title";
import TeamLogo from "../team-logo";

type UserProps = {
  user: UserType;
  goToProfile: boolean;
  small?: boolean;
};

const User = ({ user, goToProfile, small }: UserProps) => {
  const { backgroundStyle, hoverBorder } = useIsDarkContext();
  const router = useRouter();

  const [userTeams, setUserTeams] = useState<TeamType[] | null>(null);

  const handleClick = () => {
    if (goToProfile) {
      void router.push(`/profile/${user.id}`);
    }
  };

  const fetchUserTeams = async () => {
    const { data } = await supabase.from("user_teams").select("*").match({
      "affiliations->>user_id": user.id,
      "affiliations->>verified": true,
    });
    if (data && data.length > 0) setUserTeams(data.map((data) => data.team));
    else setUserTeams(null);
  };

  useEffect(() => {
    void fetchUserTeams();
  }, []);

  return (
    <div
      style={backgroundStyle}
      className={`${hoverBorder} flex w-full items-center ${
        small ? "gap-2" : "gap-4"
      } `}
      onClick={handleClick}
    >
      <PageTitle title={`${user.name}`} size={small ? "x-small" : "small"} />
      <Divider orientation="vertical" flexItem variant="middle" />
      <div
        className={`flex w-full shrink items-center justify-center ${
          small ? "gap-2" : "gap-4"
        }`}
      >
        {userTeams ? (
          userTeams.map((team) => <TeamLogo tm={team} size={small ? 35 : 45} />)
        ) : (
          <EmptyMessage message="affiliations" size="small" />
        )}
      </div>
    </div>
  );
};

export default User;
