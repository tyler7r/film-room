import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { Divider, IconButton, TextField } from "@mui/material";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import Video from "~/components/video";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import { PlayerType, TeamType, VideoType } from "~/utils/types";

type SearchOptions = {
  loggedIn: boolean;
  currentAffiliation: string | undefined;
};

type ActionBarType = {
  videos: boolean;
  users: boolean;
  teams: boolean;
};

const Search = () => {
  const { user } = useAuthContext();
  const topic = useSearchParams().get("topic") ?? "";
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [users, setUsers] = useState<PlayerType[] | null>(null);
  const [videos, setVideos] = useState<VideoType[] | null>(null);
  const [teams, setTeams] = useState<TeamType[] | null>(null);
  const [options, setOptions] = useState<SearchOptions>({
    loggedIn: user.isLoggedIn,
    currentAffiliation: user.currentAffiliation?.team.id,
  });

  const [actionBar, setActionBar] = useState<ActionBarType>({
    videos: true,
    users: true,
    teams: true,
  });

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("topic", term);
    } else {
      params.delete("topic");
    }
    void router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  const fetchUsers = async () => {
    console.log(topic);
    const { data, count } = await supabase
      .from("player_view")
      .select("*", { count: "exact" })
      .ilike("name", `%${topic}%`);
    console.log("users", { data });
    if (data && data.length > 0) setUsers(data);
    else setUsers(null);
  };

  const fetchVideos = async (options?: SearchOptions) => {
    const videos = supabase
      .from("videos")
      .select("*")
      .ilike("title", `%${topic}%`);
    if (options?.currentAffiliation) {
      videos.or(
        `private.eq.false, exclusive_to.eq.${options.currentAffiliation}`,
      );
    } else {
      videos.eq("private", false);
    }
    const { data } = await videos;
    console.log("videos", { data });
    if (data && data.length > 0) setVideos(data);
    else setVideos(null);
  };

  const fetchTeams = async () => {
    const { data, count } = await supabase
      .from("teams")
      .select("*", { count: "exact" })
      .ilike("full_name", `%${topic}%`);
    console.log("teams", { data });
    if (data && data.length > 0) setTeams(data);
    else setTeams(null);
  };

  useEffect(() => {
    void fetchUsers();
    void fetchTeams();
    void fetchVideos(options);
  }, [topic, user]);

  return (
    <div
      className="my-4 flex w-full flex-col items-center
    justify-center gap-2"
    >
      <TextField
        className="w-4/5"
        sx={{ marginBottom: "8px" }}
        label="Search"
        placeholder="New search..."
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get("topic")?.toString()}
      />
      <div className="flex gap-4">
        <div className="text-4xl font-bold tracking-tight">Videos</div>
        {actionBar.videos ? (
          <IconButton
            onClick={() => setActionBar({ ...actionBar, videos: false })}
          >
            <KeyboardArrowDownIcon />
          </IconButton>
        ) : (
          <IconButton
            onClick={() => setActionBar({ ...actionBar, videos: true })}
          >
            <KeyboardArrowRightIcon />
          </IconButton>
        )}
      </div>
      {actionBar.videos && (
        <div className="mt-2 flex w-4/5 flex-col items-center justify-center gap-6">
          {!videos ||
            (videos.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-1 text-center">
                <div className="text-2xl font-bold tracking-tight">
                  No videos found!
                </div>
                <div className="text-xl font-bold tracking-wide">
                  Try a new search.
                </div>
              </div>
            ))}
          {videos?.map((v) => <Video video={v} key={v.id} />)}
        </div>
      )}
      <Divider flexItem variant="middle" sx={{ margin: "8px 24px 8px 24px" }} />
      <div className="flex gap-4">
        <div className="text-4xl font-bold tracking-tight">Users</div>
        {actionBar.users ? (
          <IconButton
            onClick={() => setActionBar({ ...actionBar, users: false })}
          >
            <KeyboardArrowDownIcon />
          </IconButton>
        ) : (
          <IconButton
            onClick={() => setActionBar({ ...actionBar, users: true })}
          >
            <KeyboardArrowRightIcon />
          </IconButton>
        )}
      </div>
      {actionBar.users && (
        <div className="mt-2 flex w-4/5 flex-col items-center justify-center gap-6">
          {!users ||
            (users.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-1 text-center">
                <div className="text-2xl font-bold tracking-tight">
                  No users found!
                </div>
                <div className="text-xl font-bold tracking-wide">
                  Try a new search.
                </div>
              </div>
            ))}
          {videos?.map((v) => <Video video={v} key={v.id} />)}
        </div>
      )}
      <Divider flexItem variant="middle" sx={{ margin: "8px 24px 8px 24px" }} />
      <div className="flex gap-4">
        <div className="text-4xl font-bold tracking-tight">Teams</div>
        {actionBar.teams ? (
          <IconButton
            onClick={() => setActionBar({ ...actionBar, teams: false })}
          >
            <KeyboardArrowDownIcon />
          </IconButton>
        ) : (
          <IconButton
            onClick={() => setActionBar({ ...actionBar, teams: true })}
          >
            <KeyboardArrowRightIcon />
          </IconButton>
        )}
      </div>
      {actionBar.teams && (
        <div className="mt-2 flex w-4/5 flex-col items-center justify-center gap-6">
          {!teams ||
            (teams.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-1 text-center">
                <div className="text-2xl font-bold tracking-tight">
                  No teams found!
                </div>
                <div className="text-xl font-bold tracking-wide">
                  Try a new search.
                </div>
              </div>
            ))}
          {videos?.map((v) => <Video video={v} key={v.id} />)}
        </div>
      )}
    </div>
  );
};

export default Search;
