import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "~/utils/supabase";
import type { TeamAffiliationType, UserSession } from "~/utils/types";

type AuthProps = {
  children: ReactNode;
};

type AuthContextProps = {
  user: UserSession;
  setUser: (user: UserSession) => void;
  affiliations: TeamAffiliationType[] | null;
  setAffiliations: (affiliations: TeamAffiliationType[] | null) => void;
};

export const isAuthContext = createContext<AuthContextProps>({
  user: {
    isLoggedIn: false,
    userId: undefined,
    email: undefined,
    name: undefined,
    currentAffiliation: undefined,
  },
  setUser: () => null,
  affiliations: null,
  setAffiliations: () => null,
});

export const IsAuth = ({ children }: AuthProps) => {
  // const { setAffiliations } = useAffiliatedContext();
  const [user, setUser] = useState<UserSession>({
    isLoggedIn: false,
    userId: undefined,
    email: undefined,
    name: undefined,
    currentAffiliation: undefined,
  });
  const [affiliations, setAffiliations] = useState<
    TeamAffiliationType[] | null
  >(null);

  const fetchAffiliations = async (profileId?: string) => {
    if (profileId) {
      const { data } = await supabase
        .from("user_view")
        .select("*, teams!affiliations_team_id_fkey(*)")
        .eq("profile_id", profileId);
      if (data) {
        const typedAffiliations: TeamAffiliationType[] = data
          .filter((aff) => aff.verified)
          .map((aff) => ({
            team: aff.teams!,
            role: aff.role,
            affId: aff.id,
            number: aff.number,
          }));
        if (typedAffiliations && typedAffiliations.length > 0)
          setAffiliations(typedAffiliations);
        else setAffiliations(null);
      }
    } else setAffiliations(null);
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: string, session) => {
        // console.log({ event: event, aff: user.currentAffiliation });
        if ((event === "SIGNED_IN" || event === "USER_UPDATED") && session) {
          setUser({
            currentAffiliation: user.currentAffiliation,
            isLoggedIn: true,
            userId: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata.name as string,
          });
          void fetchAffiliations(session.user.id);
        } else if (event === "INITIAL_SESSION" && session) {
          setUser({
            isLoggedIn: false,
            userId: undefined,
            email: undefined,
            name: undefined,
            currentAffiliation: undefined,
          });
          setAffiliations(null);
        } else {
          setUser({
            isLoggedIn: false,
            userId: undefined,
            email: undefined,
            name: undefined,
            currentAffiliation: undefined,
          });
          setAffiliations(null);
        }
      },
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("affiliation_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "affiliations" },
        () => {
          void fetchAffiliations(user.userId);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user.userId]);

  return (
    <isAuthContext.Provider
      value={{ user, setUser, affiliations, setAffiliations }}
    >
      {children}
    </isAuthContext.Provider>
  );
};

export const useAuthContext = () => {
  return useContext(isAuthContext);
};
