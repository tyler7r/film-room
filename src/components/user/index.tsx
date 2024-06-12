import { Divider } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { TeamType, UserType } from "~/utils/types";
import TeamLogo from "../team-logo";

type UserProps = {
  user: UserType;
};

const User = ({ user }: UserProps) => {
  const { backgroundStyle, isDark, hoverBorder } = useIsDarkContext();
  const router = useRouter();

  const [userTeams, setUserTeams] = useState<TeamType[] | null>(null);

  const handleClick = (userId: string) => {
    void router.push(`/profile/${userId}`);
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
      className={`${hoverBorder} flex w-full items-center gap-4 `}
      onClick={() => handleClick(user.id)}
    >
      <div className="w-full grow text-center text-2xl font-bold">
        {user.name}
      </div>
      <Divider orientation="vertical" flexItem variant="middle" />
      <div className="flex w-full shrink items-center justify-center gap-4">
        {userTeams?.map((team) => <TeamLogo tm={team} size={45} />)}
      </div>
    </div>
  );
};

export default User;
