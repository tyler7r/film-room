import AddIcon from "@mui/icons-material/Add";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ProfileActionBar from "~/components/profiles/profile-action-bar";
import ProfileCollections from "~/components/profiles/profile-collections";
import ProfileEdit from "~/components/profiles/profile-edit";
import CreatedFeed from "~/components/profiles/profile-feed/created";
import HighlightsFeed from "~/components/profiles/profile-feed/highlights";
import MentionsFeed from "~/components/profiles/profile-feed/mentions";
import ProfileStats from "~/components/profiles/profile-stats";
import TeamAffiliation from "~/components/teams/team-affiliation";
import PageTitle from "~/components/utils/page-title";
import Video from "~/components/videos/video";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type {
  LastWatchedType,
  ProfileActionBarType,
  TeamAffiliationType,
  UserType,
} from "~/utils/types";

type FetchOptions = {
  profileId?: string | undefined;
};

const Profile = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { backgroundStyle, hoverBorder } = useIsDarkContext();

  const [options, setOptions] = useState<FetchOptions>({
    profileId: router.query.user as string,
  });
  const [profile, setProfile] = useState<UserType | null>(null);
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
      const profile = await supabase
        .from("profiles")
        .select("*")
        .eq("id", options.profileId)
        .single();
      if (profile.data) {
        setProfile(profile.data);
        const { data } = await supabase
          .from("user_view")
          .select("*")
          .eq("profile->>id", options.profileId);
        if (data) {
          const typedAffiliations: TeamAffiliationType[] = data
            .filter((aff) => aff.affiliation.verified)
            .map((aff) => ({
              team: aff.team,
              role: aff.affiliation.role,
              number: aff.affiliation.number,
              affId: aff.affiliation.id,
            }));
          if (typedAffiliations && typedAffiliations.length > 0)
            setProfileAffiliations(typedAffiliations);
          else setProfileAffiliations(null);
        } else setProfileAffiliations(null);
      }
    }
  };

  const fetchLastWatched = async () => {
    if (user.userId === options.profileId) {
      const { data } = await supabase
        .from("last_watched_view")
        .select()
        .eq("profile->>id", `${user.userId}`)
        .single();
      if (data?.video) setLastWatched(data);
      else setLastWatched(null);
    }
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

  useEffect(() => {
    const channel = supabase
      .channel("profile_changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        () => {
          void fetchProfile();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (user.userId) void fetchLastWatched();
  }, [user]);

  useEffect(() => {
    setOptions({
      ...options,
      profileId: router.query.user as string,
    });
  }, [router.query.user, user]);

  useEffect(() => {
    void fetchProfile(options);
  }, [options]);

  return (
    profile && (
      <div className="flex w-full flex-col items-center justify-center gap-8 p-4">
        <div className="flex w-4/5 flex-col items-center justify-center gap-4">
          <div className="flex w-full flex-col items-center justify-center">
            <PageTitle
              size="x-large"
              title={profile.name === "" ? profile.email! : profile.name}
            />
            <div className="flex w-full items-center justify-center gap-2">
              <div className="text-lg font-light leading-5 tracking-tighter">
                Member since {profile.join_date.substring(0, 4)}
              </div>
              {user.userId === router.query.user && (
                <ProfileEdit profile={profile} />
              )}
            </div>
          </div>
          <ProfileStats
            profileId={options.profileId}
            changeActionBar={changeActionBar}
          />
        </div>
        {router.query.user === user.userId && lastWatched && (
          <div className="flex w-full items-center justify-center">
            <div className="flex w-11/12 flex-col items-center justify-center gap-3">
              <div className="flex items-center gap-2">
                <PlayArrowIcon fontSize="large" />
                <PageTitle size="small" title="Continue Watching" />
              </div>
              <Video
                video={lastWatched.video}
                startTime={`${lastWatched.profile.last_watched_time}`}
              />
            </div>
          </div>
        )}
        <div className=" flex flex-col items-center justify-center gap-2">
          <PageTitle title="Team Affiliations" size="small" />
          {profileAffiliations && (
            <div className="flex w-full flex-wrap items-center justify-center gap-1">
              {profileAffiliations.map((aff) => (
                <TeamAffiliation key={aff.affId} aff={aff} />
              ))}
            </div>
          )}
          {!profileAffiliations && router.query.user === user.userId && (
            <div
              onClick={() => void router.push("/team-select")}
              style={backgroundStyle}
              className={`${hoverBorder} flex cursor-pointer items-center justify-center gap-1 p-2`}
            >
              <AddIcon fontSize="small" />
              <div className="text-sm font-bold">JOIN A NEW TEAM!</div>
            </div>
          )}
        </div>
        <ProfileCollections profileId={profile.id} />
        <div className="flex w-full items-center justify-center">
          <ProfileActionBar
            actionBarStatus={actionBarStatus}
            setActionBarStatus={setActionBarStatus}
          />
        </div>
        {actionBarStatus.createdPlays && (
          <CreatedFeed profileId={options.profileId} />
        )}
        {actionBarStatus.mentions && (
          <MentionsFeed profileId={options.profileId} />
        )}
        {actionBarStatus.highlights && (
          <HighlightsFeed profileId={options.profileId} />
        )}
      </div>
    )
  );
};

export default Profile;
