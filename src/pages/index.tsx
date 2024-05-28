import { useRouter } from "next/router";
import { useAffiliatedContext } from "~/contexts/affiliations";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "./_app";
import Profile from "./profile/[user]";

export default function Home() {
  const { user, setUser } = useAuthContext();
  const { affiliations } = useAffiliatedContext();
  const { backgroundStyle, isDark } = useIsDarkContext();
  const router = useRouter();
  // const [lastWatched, setLastWatched] = useState<LastWatchedType | null>(null);

  // const fetchLastWatched = async () => {
  //   const { data } = await supabase
  //     .from("profiles")
  //     .select("last_watched, last_watched_time, videos(*)")
  //     .eq("id", `${user.userId}`)
  //     .single();
  //   if (data?.last_watched) setLastWatched(data);
  //   else setLastWatched(null);
  // };

  // const updateUserAffiliation = (teamId: string | null | undefined) => {
  //   if (teamId) {
  //     const team = affiliations?.find((aff) => aff.team.id === teamId);
  //     if (user.currentAffiliation?.team.id === teamId) return;
  //     else {
  //       setUser({
  //         ...user,
  //         currentAffiliation: team ? team : user.currentAffiliation,
  //       });
  //     }
  //   } else return;
  // };

  // const handleTeamClick = (
  //   e: React.MouseEvent<HTMLDivElement>,
  //   aff: TeamAffiliationType,
  // ) => {
  //   e.stopPropagation();
  //   if (aff.team.id === user.currentAffiliation?.team.id) {
  //     void router.push(`/team-hub/${aff.team.id}`);
  //   } else {
  //     setUser({ ...user, currentAffiliation: aff });
  //   }
  // };

  // const handleAddNewClick = (userId: string | undefined) => {
  //   if (userId) {
  //     void router.push(`/team-select`);
  //   } else {
  //     void router.push(`/signup`);
  //   }
  // };

  // useEffect(() => {
  //   if (user.userId) void fetchLastWatched();
  // }, [user]);

  return (
    <div className="mt-2 flex flex-col items-center justify-center gap-8 p-4">
      <Profile />
      {/* <div className="text-center text-6xl tracking-wide">
        Hello {user.name ? user.name : "Guest"}!
      </div>
      {lastWatched && (
        <div className="flex w-11/12 flex-col items-center justify-center gap-3">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <PlayArrowIcon />
            <div>Continue Watching</div>
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
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="text-2xl font-bold">Your Team Affiliations</div>
        {affiliations ? (
          <div className="align-center flex flex-wrap justify-center gap-6">
            {affiliations.map((aff) => (
              <div
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-sm border-2 border-solid border-transparent p-4 px-6 transition ease-in-out hover:rounded-md hover:border-solid ${
                  isDark
                    ? "hover:border-purple-400"
                    : "hover:border-purple-A400"
                } hover:delay-100`}
                key={aff.affId}
                style={backgroundStyle}
                onClick={(e) => handleTeamClick(e, aff)}
              >
                <TeamLogo tm={aff.team} size={55} />
                <div className="flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold">{aff.team.full_name}</div>
                  {aff.team.id === user.currentAffiliation?.team.id && (
                    <div className="text-sm">ACTIVE</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-lg">No team affiliations!</div>
        )}
        <Button
          size="large"
          sx={{ fontSize: "18px", lineHeight: "24px" }}
          startIcon={<AddIcon />}
          onClick={() => {
            handleAddNewClick(user.userId);
          }}
        >
          Add New Affiliation
        </Button>
      </div> */}
    </div>
  );
}
