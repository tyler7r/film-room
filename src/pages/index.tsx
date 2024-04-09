import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useEffect, useState } from "react";
import TeamLogo from "~/components/team-logo";
import Video from "~/components/video";
import { useAffiliatedContext } from "~/contexts/affiliations";
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
  const { affiliations } = useAffiliatedContext();
  const [lastWatched, setLastWatched] = useState<LastWatchedType | null>(null);

  const fetchLastWatched = async () => {
    const { data } = await supabase
      .from("affiliations")
      .select("last_watched, last_watched_time, videos(*)")
      .eq("id", `${user.currentAffiliation?.affId}`)
      .single();
    if (data && data.last_watched) setLastWatched(data);
    else setLastWatched(null);
  };

  useEffect(() => {
    if (user.currentAffiliation?.affId) void fetchLastWatched();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-4">
      <div className="text-5xl tracking-wide">
        Hello {user.name ? user.name : "Fellow Film Fanatic"}!
      </div>
      {lastWatched && (
        <div className="flex w-11/12 flex-col items-center justify-center gap-3">
          <div className="flex items-center gap-2 text-xl font-bold">
            <PlayArrowIcon />
            <div>Continue Watching</div>
          </div>
          <Video
            video={lastWatched.videos}
            startTime={`${lastWatched.last_watched_time}`}
          />
        </div>
      )}
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="text-xl font-bold">Your Team Affiliations</div>
        {affiliations ? (
          <div className="flex flex-wrap gap-6">
            {affiliations.map((aff) => (
              <div
                className="flex items-center justify-center gap-2"
                key={aff.affId}
              >
                <TeamLogo tm={aff.team} />
                <div className="flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold">{aff.team.full_name}</div>
                  {aff.team.id === user.currentAffiliation?.team.id && (
                    <div className="text-xs">ACTIVE</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>No current affiliations</div>
        )}
      </div>
    </div>
  );
}
