import { useEffect, useState } from "react";
import { Button } from "~/components/button/button";
import { supabase } from "~/utils/supabase";

import { type TeamType } from "~/utils/types";

export default function Home() {
  const [teams, setTeams] = useState<TeamType[] | null>(null);

  const getTeams = async () => {
    const { data } = await supabase.from("teams").select();
    setTeams(data);
  };

  useEffect(() => {
    void getTeams();
  }, []);

  return teams?.map((team) => (
    <div key={team.id}>
      {team.city} {team.name}
      <Button label={team.name!} primary={false} size="large" />
      <Button label={team.city!} primary={true} size="large" />
    </div>
  ));
}
