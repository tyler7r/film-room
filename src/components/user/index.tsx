import { Divider, IconButton } from "@mui/material";
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
  number?: number | null;
  small?: boolean;
};

const User = ({ user, goToProfile, small, number }: UserProps) => {
  const { backgroundStyle, hoverText } = useIsDarkContext();
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

  const handleTeamClick = (e: React.MouseEvent, teamId: string) => {
    e.stopPropagation();
    void router.push(`/team-hub/${teamId}`);
  };

  useEffect(() => {
    void fetchUserTeams();
  }, []);

  return (
    <div
      style={backgroundStyle}
      className={`flex items-center justify-center ${
        small ? "gap-2" : "gap-4"
      } rounded-sm p-1 px-2`}
      onClick={handleClick}
    >
      <div
        className={`flex items-center justify-center ${hoverText} ${
          small ? "gap-2" : "gap-4"
        }`}
      >
        <PageTitle title={`${user.name}`} size={small ? "x-small" : "small"} />
        {number && <div className="text-sm font-light">#{number}</div>}
      </div>
      <Divider orientation="vertical" flexItem variant="middle" />
      <div
        className={`flex items-center justify-center ${
          small ? "gap-1" : "gap-2"
        }`}
      >
        {userTeams ? (
          userTeams.map((team) => (
            <IconButton
              key={team.id}
              onClick={(e) => handleTeamClick(e, team.id)}
            >
              <TeamLogo
                tm={team}
                size={small ? 35 : 44}
                inactive={true}
                popover={true}
              />
            </IconButton>
          ))
        ) : (
          <EmptyMessage message="affiliations" size="small" />
        )}
      </div>
    </div>
  );
};

export default User;
