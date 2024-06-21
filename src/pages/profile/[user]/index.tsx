import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Divider, colors } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import EmptyMessage from "~/components/empty-msg";
import PageTitle from "~/components/page-title";
import PlayPreview from "~/components/play_preview";
import ProfileActionBar from "~/components/profile-action-bar";
import TeamAffiliation from "~/components/team-affiliation";
import Video from "~/components/video";
import { useAffiliatedContext } from "~/contexts/affiliations";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type {
  PlayPreviewType,
  ProfileActionBarType,
  TeamAffiliationType,
} from "~/utils/types";

type FetchOptions = {
  profileId?: string | undefined;
  currentAffiliation: string | undefined;
};

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

type ProfileType = {
  name: string;
  join_date: string;
};

type StatsType = {
  mentionCount: number;
  playCount: number;
  highlightCount: number;
};

type FeedType = {
  mentions: PlayPreviewType[] | null;
  plays: PlayPreviewType[] | null;
  highlights: PlayPreviewType[] | null;
};

const Profile = () => {
  const router = useRouter();
  const { isDark } = useIsDarkContext();
  const { affiliations } = useAffiliatedContext();
  const { user, setUser } = useAuthContext();

  const [options, setOptions] = useState<FetchOptions>({
    profileId: (router.query.user as string) || user.userId,
    currentAffiliation: user.currentAffiliation?.team.id,
  });
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [profileAffiliations, setProfileAffiliations] = useState<
    TeamAffiliationType[] | null
  >(null);
  const [stats, setStats] = useState<StatsType>({
    mentionCount: 0,
    playCount: 0,
    highlightCount: 0,
  });
  const [lastWatched, setLastWatched] = useState<LastWatchedType | null>(null);
  const [feed, setFeed] = useState<FeedType>({
    mentions: null,
    plays: null,
    highlights: null,
  });
  const [actionBarStatus, setActionBarStatus] = useState<ProfileActionBarType>({
    createdPlays: true,
    mentions: false,
    highlights: false,
  });

  const fetchProfile = async (options?: FetchOptions) => {
    if (options?.profileId) {
      const { data } = await supabase
        .from("player_view")
        .select("*, teams!affiliations_team_id_fkey(*)")
        .match({ profile_id: options.profileId, verified: true });
      if (data?.[0]) {
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

  const fetchStats = async (options?: FetchOptions) => {
    if (options?.profileId) {
      const getMentions = await supabase
        .from("plays_via_user_mention")
        .select("*", {
          count: "exact",
        })
        .eq("mention->>receiver_id", options.profileId);
      const getHighlights = await supabase
        .from("plays_via_user_mention")
        .select("*", {
          count: "exact",
        })
        .match({
          "play->>highlight": true,
          "mention->>receiver_id": options.profileId,
        });
      const getPlays = await supabase
        .from("play_preview")
        .select("*", {
          count: "exact",
        })
        .eq("play->>author_id", options.profileId);
      setStats({
        mentionCount: getMentions.count ? getMentions.count : 0,
        highlightCount: getHighlights.count ? getHighlights.count : 0,
        playCount: getPlays.count ? getPlays.count : 0,
      });
    }
  };

  const fetchFeed = async (options?: FetchOptions) => {
    if (options?.profileId) {
      const mentions = supabase
        .from("plays_via_user_mention")
        .select("*")
        .eq("mention->>receiver_id", options.profileId);
      const highlights = supabase
        .from("plays_via_user_mention")
        .select("*")
        .match({
          "play->>highlight": true,
          "mention->>receiver_id": options.profileId,
        });
      const plays = supabase
        .from("play_preview")
        .select("*")
        .eq("play->>author_id", options.profileId);
      if (options.currentAffiliation) {
        void mentions.or(
          `play->>private.eq.false, play->>exclusive_to.eq.${options.currentAffiliation}`,
        );
        void highlights.or(
          `play->>private.eq.false, play->>exclusive_to.eq.${options.currentAffiliation}`,
        );
        void plays.or(
          `play->>private.eq.false, play->>exclusive_to.eq.${options.currentAffiliation}`,
        );
      } else {
        void mentions.eq("play->>private", false);
        void highlights.eq("play->>private", false);
        void plays.eq("play->>private", false);
      }
      const getMentions = await mentions;
      const getHighlights = await highlights;
      const getPlays = await plays;
      setFeed({
        mentions:
          getMentions.data && getMentions.data.length > 0
            ? getMentions.data
            : null,
        highlights:
          getHighlights.data && getHighlights.data.length > 0
            ? getHighlights.data
            : null,
        plays: getPlays.data && getPlays.data.length > 0 ? getPlays.data : null,
      });
    }
  };

  const fetchLastWatched = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("last_watched, last_watched_time, videos(*)")
      .eq("id", `${user.userId}`)
      .single();
    if (data?.last_watched) setLastWatched(data);
    else setLastWatched(null);
  };

  const changeActionBar = (
    topic: "createdPlays" | "highlights" | "mentions",
  ) => {
    topic === "createdPlays"
      ? setActionBarStatus({
          createdPlays: true,
          mentions: false,
          highlights: false,
        })
      : topic === "highlights"
        ? setActionBarStatus({
            highlights: true,
            mentions: false,
            createdPlays: false,
          })
        : setActionBarStatus({
            createdPlays: false,
            mentions: true,
            highlights: false,
          });
  };

  const updateUserAffiliation = (teamId: string | null | undefined) => {
    if (teamId) {
      const team = affiliations?.find((aff) => aff.team.id === teamId);
      if (user.currentAffiliation?.team.id === teamId) return;
      else {
        setUser({
          ...user,
          currentAffiliation: team ? team : user.currentAffiliation,
        });
      }
    } else return;
  };

  useEffect(() => {
    if (user.userId) void fetchLastWatched();
  }, [user]);

  useEffect(() => {
    setOptions({
      ...options,
      profileId: router.query.user as string,
      currentAffiliation: user.currentAffiliation?.team.id,
    });
  }, [router.query.user, user]);

  useEffect(() => {
    void fetchProfile(options);
    void fetchStats(options);
    void fetchFeed(options);
  }, [options]);

  return (
    profile && (
      <div className="flex w-full flex-col items-center justify-center gap-4 p-4">
        <div className="flex flex-col justify-center gap-4">
          <div className="flex w-full flex-col items-center justify-center">
            <PageTitle size="x-large" title={profile.name} />
            <div className="text-lg font-light leading-5 tracking-tight">
              Member since {profile.join_date.substring(0, 4)}
            </div>
          </div>
          {stats && (
            <div
              className="flex cursor-default items-center justify-around rounded-md p-2"
              style={
                isDark
                  ? { backgroundColor: `${colors.purple[200]}` }
                  : { backgroundColor: `${colors.purple[50]}` }
              }
            >
              <div
                className="flex cursor-pointer flex-col items-center justify-center"
                onClick={() => changeActionBar("createdPlays")}
              >
                <div className="text-3xl font-bold">{stats.playCount}</div>
                <div className="font-light leading-4 tracking-tight">
                  created
                </div>
              </div>
              <Divider flexItem orientation="vertical" />
              <div
                className="flex cursor-pointer flex-col items-center justify-center"
                onClick={() => changeActionBar("mentions")}
              >
                <div className="text-3xl font-bold">{stats.mentionCount}</div>
                <div className="font-light leading-4 tracking-tight">
                  mentions
                </div>
              </div>
              <Divider flexItem orientation="vertical" />
              <div
                className="flex cursor-pointer flex-col items-center justify-center"
                onClick={() => changeActionBar("highlights")}
              >
                <div className="text-3xl font-bold">{stats.highlightCount}</div>
                <div className="font-light leading-4 tracking-tight">
                  highlights
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="align-center my-4 flex flex-wrap justify-center gap-1">
          {profileAffiliations?.map((aff) => (
            <TeamAffiliation key={aff.affId} aff={aff} />
          ))}
        </div>
        {!router.query.user && (
          <div className="flex w-full items-center justify-center">
            {lastWatched && (
              <div className="flex w-11/12 flex-col items-center justify-center gap-3">
                <div className="flex items-center gap-2 text-2xl font-bold">
                  <PlayArrowIcon fontSize="large" />
                  {/* <div>Continue Watching</div> */}
                  <PageTitle size="small" title="Continue Watching" />
                </div>
                <div
                  className="w-full"
                  onClick={() =>
                    updateUserAffiliation(lastWatched.videos?.exclusive_to)
                  }
                >
                  <Video
                    video={lastWatched.videos}
                    startTime={`${lastWatched.last_watched_time}`}
                  />
                </div>
              </div>
            )}
          </div>
        )}
        <div className="w-full">
          <ProfileActionBar
            actionBarStatus={actionBarStatus}
            setActionBarStatus={setActionBarStatus}
          />
        </div>
        {actionBarStatus.createdPlays &&
          (feed.plays ? (
            feed.plays.map((play) => (
              <PlayPreview key={play.play.id} preview={play} />
            ))
          ) : (
            <EmptyMessage size="medium" message="user created plays" />
          ))}
        {actionBarStatus.mentions &&
          (feed.mentions ? (
            feed.mentions.map((play) => (
              <PlayPreview
                key={`${play.play.id + play.play.title}`}
                preview={play}
              />
            ))
          ) : (
            <EmptyMessage size="medium" message="user mentions" />
          ))}
        {actionBarStatus.highlights &&
          (feed.highlights ? (
            feed.highlights?.map((play) => (
              <PlayPreview
                key={`${play.play.id + play.video.id}`}
                preview={play}
              />
            ))
          ) : (
            <EmptyMessage size="medium" message="user highlights" />
          ))}
      </div>
    )
  );
};

export default Profile;
