import { useEffect, useState } from "react";
import Video from "~/components/video";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";

type LastWatchedType = {
  last_watched: string | null;
  last_watched_time: number | null;
  videos: {
    division: string;
    exclusive_to: string | null;
    id: string;
    link: string;
    private: boolean;
    season: string;
    title: string;
    tournament: string | null;
    uploaded_at: string;
    week: string | null;
  } | null;
};

export default function Home() {
  const { user } = useAuthContext();
  const [lastWatched, setLastWatched] = useState<LastWatchedType | null>(null);

  const fetchLastWatched = async () => {
    const { data } = await supabase
      .from("affiliations")
      .select("last_watched, last_watched_time, videos(*)")
      .eq("id", `${user.currentAffiliation?.affId}`)
      .single();
    if (data) setLastWatched(data);
  };

  useEffect(() => {
    void fetchLastWatched();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="text-5xl tracking-wide">Hello {user.name}!</div>
      {lastWatched && (
        <div>
          <div>Continue Watching</div>
          <Video
            video={lastWatched.videos}
            startTime={`${lastWatched.last_watched_time}`}
          />
        </div>
      )}
    </div>
  );
}
