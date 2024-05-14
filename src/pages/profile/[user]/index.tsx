import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ProfileActionBar from "~/components/profile-action-bar";
import TeamLogo from "~/components/team-logo";
import { useAffiliatedContext } from "~/contexts/affiliations";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import {
  BasicPlayType,
  ProfileActionBarType,
  RealMentionType,
  TeamAffiliationType,
} from "~/utils/types";

type FetchOptions = {
  profileId?: string | undefined;
};

type ProfileType = {
  name: string;
  join_date: string;
};

type StatsType = {
  mentions: RealMentionType | null;
  mentionCount: number;
  plays: BasicPlayType[] | null;
  playCount: number;
  highlights: RealMentionType | null;
  highlightCount: number;
};

const Profile = () => {
  const router = useRouter();
  const { isDark, backgroundStyle } = useIsDarkContext();
  const { affiliations } = useAffiliatedContext();
  const { user, setUser } = useAuthContext();

  const [options, setOptions] = useState<FetchOptions>({
    profileId: router.query.user as string,
  });
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [profileAffiliations, setProfileAffiliations] = useState<
    TeamAffiliationType[] | null
  >(null);
  const [stats, setStats] = useState<StatsType>({
    mentions: null,
    mentionCount: 0,
    plays: null,
    playCount: 0,
    highlights: null,
    highlightCount: 0,
  });
  const [actionBarStatus, setActionBarStatus] = useState<ProfileActionBarType>({
    createdPlays: false,
    mentions: false,
    highlights: false,
  });

  const fetchProfile = async (options?: FetchOptions) => {
    if (options?.profileId) {
      const { data } = await supabase
        .from("player_view")
        .select("*, teams!affiliations_team_id_fkey(*)")
        .match({ profile_id: options.profileId, verified: true });
      if (data && data[0]) {
        setProfile({ name: data[0].name, join_date: data[0].join_date });
        const typedAffiliations: TeamAffiliationType[] = data.map((aff) => ({
          team: aff.teams!,
          role: aff.role,
          affId: aff.id,
          number: aff.number,
        }));
        setProfileAffiliations(typedAffiliations);
      }
    }
  };

  //   const fetchPlay = async () => {
  //     const { data } = await supabase
  //       .from("plays")
  //       .select("*, videos(link)")
  //       .eq("id", "06af3f59-c8e8-4e0e-9919-405c283be89d")
  //       .single();
  //     if (data) setPlay(data);
  //   };

  const fetchStats = async (options?: FetchOptions) => {
    if (options?.profileId) {
      const getMentions = await supabase
        .from("inbox_mentions")
        .select("*, team: teams!affiliations_team_id_fkey(*)", {
          count: "exact",
        })
        .eq("receiver_id", options.profileId);
      const getHighlights = await supabase
        .from("inbox_mentions")
        .select("*, team: teams!affiliations_team_id_fkey(*)", {
          count: "exact",
        })
        .match({ highlight: true, receiver_id: options.profileId });
      const getPlays = await supabase
        .from("plays")
        .select("*, affiliation: public_plays_author_id_fkey!inner(user_id)", {
          count: "exact",
        })
        .eq("affiliation.user_id", options.profileId);
      setStats({
        mentions:
          getMentions.data && getMentions.data.length > 0
            ? getMentions.data
            : null,
        mentionCount: getMentions.count ? getMentions.count : 0,
        highlights:
          getHighlights.data && getHighlights.data.length > 0
            ? getHighlights.data
            : null,
        highlightCount: getHighlights.count ? getHighlights.count : 0,
        plays: getPlays.data && getPlays.data.length > 0 ? getPlays.data : null,
        playCount: getPlays.count ? getPlays.count : 0,
      });
    }
  };

  const handleTeamClick = (
    e: React.MouseEvent<HTMLDivElement>,
    teamId: string,
  ) => {
    e.stopPropagation();
    const isAffiliatedTeam = affiliations?.find(
      (aff) => aff.team.id === teamId,
    );
    if (isAffiliatedTeam && user.isLoggedIn) {
      setUser({ ...user, currentAffiliation: isAffiliatedTeam });
    }
    void router.push(`/team-hub/${teamId}`);
  };

  useEffect(() => {
    setOptions({ ...options, profileId: router.query.user as string });
  }, [router.query.user]);

  useEffect(() => {
    void fetchProfile(options);
    void fetchStats(options);
    void fetchStats(options);
    void fetchStats(options);
  }, [options]);

  return (
    profile && (
      <div className="flex w-full flex-col items-center justify-center gap-8 p-4">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="flex items-center justify-center text-6xl font-bold">
            {profile.name}
          </div>
          <div className="text-lg font-light leading-3 tracking-tight">
            Member since {profile.join_date.substring(0, 4)}
          </div>
          {stats && (
            <div className="mt-4 flex w-full cursor-default items-center justify-around gap-4">
              <div className="flex flex-col items-center justify-center">
                <div className="text-3xl font-bold">{stats.playCount}</div>
                <div className="text-sm font-light leading-4 tracking-tight">
                  CREATED PLAYS
                </div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="text-3xl font-bold">{stats.mentionCount}</div>
                <div className="text-sm font-light leading-4 tracking-tight">
                  MENTIONS
                </div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="text-3xl font-bold">{stats.highlightCount}</div>
                <div className="text-sm font-light leading-4 tracking-tight">
                  HIGHLIGHTS
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="align-center flex flex-wrap justify-center gap-6">
          {profileAffiliations?.map((aff) => (
            <div
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-sm border-2 border-solid border-transparent p-4 px-6 transition ease-in-out hover:rounded-md hover:border-solid ${
                isDark ? "hover:border-purple-400" : "hover:border-purple-A400"
              } hover:delay-100`}
              key={aff.team.id}
              style={backgroundStyle}
              onClick={(e) => handleTeamClick(e, aff.team.id)}
            >
              <TeamLogo tm={aff.team} size={55} />
              <div className="flex flex-col items-center justify-center">
                <div className="text-2xl font-bold">{aff.team.full_name}</div>
                {aff.number && <div className="leading-3">#{aff.number}</div>}
              </div>
            </div>
          ))}
        </div>
        <div className="w-full">
          <ProfileActionBar
            actionBarStatus={actionBarStatus}
            setActionBarStatus={setActionBarStatus}
          />
        </div>
        {/* {play && (
          <Youtube
            opts={{
              //   width: `${screenWidth * 0.8}`,
              //   height: `${(screenWidth * 0.8) / 1.778}`,
              playerVars: {
                enablejsapi: 1,
                playsinline: 1,
                fs: 1,
                rel: 0,
                color: "red",
                origin: "https://www.youtube.com",
              },
            }}
            id="player"
            videoId={play.videos.link.split("v=")[1]?.split("&")[0]}
            onReady={videoOnReady}
          />
        )} */}
      </div>
    )
  );
};

export default Profile;
