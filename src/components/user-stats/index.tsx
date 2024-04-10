import { useState } from "react";
import { supabase } from "~/utils/supabase";

const UserStats = () => {
  const [mentions, setMentions] = useState<any>(null);
  const [highlights, setHighlights] = useState<any>(null);
  const [authoredPlays, setAuthoredPlays] = useState<any>(null);

  const fetchStats = async () => {
    const { data, count } = await supabase.from("plays").select(`*, `);
  };

  return (
    <div className="flex flex-col">
      <div className="text-center text-2xl font-bold">User Stats</div>
    </div>
  );
};

export default UserStats;
