import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import PageTitle from "~/components/page-title";
import ProfileActionBar from "~/components/profile-action-bar";
import CreatedFeed from "~/components/profile-feed/created";
import HighlightsFeed from "~/components/profile-feed/highlights";
import MentionsFeed from "~/components/profile-feed/mentions";
import ProfileStats from "~/components/profile-stats";
import TeamAffiliation from "~/components/team-affiliation";
import Video from "~/components/video";
import { useAffiliatedContext } from "~/contexts/affiliations";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import type {
  LastWatchedType,
  ProfileActionBarType,
  TeamAffiliationType,
} from "~/utils/types";

type FetchOptions = {
  profileId?: string | undefined;
  currentAffiliation: string | undefined;
};

type ProfileType = {
  name: string;
  join_date: string;
};

const Profile = () => {
  const router = useRouter();
  const { affiliations } = useAffiliatedContext();
  const { user, setUser } = useAuthContext();

  const [options, setOptions] = useState<FetchOptions>({
    profileId: router.query.user as string,
    currentAffiliation: user.currentAffiliation?.team.id,
  });
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [profileAffiliations, setProfileAffiliations] = useState<
    TeamAffiliationType[] | null
  >(null);

  const [lastWatched, setLastWatched] = useState<LastWatchedType | null>(null);
  const [actionBarStatus, setActionBarStatus] = useState<ProfileActionBarType>({
    createdPlays: true,
    mentions: false,
    highlights: false,
  });

  const fetchProfile = async (options?: FetchOptions) => {
    if (options?.profileId) {
      const { data } = await supabase
        .from("user_view")
        .select("*, teams!affiliations_team_id_fkey(*)")
        .eq("profile_id", options.profileId);
      if (data?.[0]) {
        setProfile({ name: data[0].name, join_date: data[0].join_date });
        const typedAffiliations: TeamAffiliationType[] = data
          .filter((aff) => aff.verified)
          .map((aff) => ({
            team: aff.teams!,
            role: aff.role,
            affId: aff.id,
            number: aff.number,
          }));
        if (typedAffiliations && typedAffiliations.length > 0)
          setProfileAffiliations(typedAffiliations);
        else setProfileAffiliations(null);
      }
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
  }, [options]);

  return (
    profile && (
      <div className="flex w-full flex-col items-center justify-center gap-4 p-4">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex w-full flex-col items-center justify-center">
            <PageTitle size="x-large" title={profile.name} />
            <div className="text-lg font-light leading-5 tracking-tight">
              Member since {profile.join_date.substring(0, 4)}
            </div>
          </div>
          <ProfileStats
            profileId={options.profileId}
            changeActionBar={changeActionBar}
          />
        </div>
        {profileAffiliations && (
          <div className="my-4 flex flex-wrap items-center justify-center gap-1">
            {profileAffiliations.map((aff) => (
              <TeamAffiliation key={aff.affId} aff={aff} />
            ))}
          </div>
        )}
        {router.query.user === user.userId && (
          <div className="flex w-full items-center justify-center">
            {lastWatched && (
              <div className="flex w-11/12 flex-col items-center justify-center gap-3">
                <div className="flex items-center gap-2 text-2xl font-bold">
                  <PlayArrowIcon fontSize="large" />
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
        <div className="flex w-full items-center justify-center">
          <ProfileActionBar
            actionBarStatus={actionBarStatus}
            setActionBarStatus={setActionBarStatus}
          />
        </div>
        {actionBarStatus.createdPlays && (
          <CreatedFeed
            profileId={options.profileId}
            currentAffiliation={options.currentAffiliation}
          />
        )}
        {actionBarStatus.mentions && (
          <MentionsFeed
            profileId={options.profileId}
            currentAffiliation={options.currentAffiliation}
          />
        )}
        {actionBarStatus.highlights && (
          <HighlightsFeed
            profileId={options.profileId}
            currentAffiliation={options.currentAffiliation}
          />
        )}
      </div>
    )
  );
};

export default Profile;
