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
  affIds: string[] | null;
  setAffIds: (affIds: string[] | null) => void;
};

export const isAuthContext = createContext<AuthContextProps>({
  user: {
    isLoggedIn: false,
    userId: undefined,
    email: undefined,
    name: undefined,
  },
  setUser: () => null,
  affiliations: null,
  setAffiliations: () => null,
  affIds: null,
  setAffIds: () => null,
});

export const IsAuth = ({ children }: AuthProps) => {
  const [user, setUser] = useState<UserSession>({
    isLoggedIn: false,
    userId: undefined,
    email: undefined,
    name: undefined,
  });
  const [affiliations, setAffiliations] = useState<
    TeamAffiliationType[] | null
  >(null);
  const [affIds, setAffIds] = useState<string[] | null>(null);

  const fetchAffiliations = async (profileId?: string) => {
    if (profileId) {
      const { data } = await supabase
        .from("user_view")
        .select("*")
        .match({ "profile->>id": profileId, "affiliation->>verified": true });
      if (data) {
        const typedAffiliations: TeamAffiliationType[] = data.map((aff) => ({
          team: aff.team,
          role: aff.affiliation.role,
          number: aff.affiliation.number,
          affId: aff.affiliation.id,
        }));
        if (typedAffiliations && typedAffiliations.length > 0) {
          setAffiliations(typedAffiliations);
          const affIds = typedAffiliations.map((aff) => aff.team.id);
          affIds ? setAffIds(affIds) : setAffIds(null);
        } else setAffiliations(null);
      }
    } else setAffiliations(null);
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: string, session) => {
        if ((event === "SIGNED_IN" || event === "USER_UPDATED") && session) {
          setUser({
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
          });
          setAffiliations(null);
          setAffIds(null);
        } else {
          setUser({
            isLoggedIn: false,
            userId: undefined,
            email: undefined,
            name: undefined,
          });
          setAffiliations(null);
          setAffIds(null);
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

  useEffect(() => {
    console.log(affIds);
  }, [affIds]);

  return (
    <isAuthContext.Provider
      value={{
        user,
        setUser,
        affiliations,
        setAffiliations,
        affIds,
        setAffIds,
      }}
    >
      {children}
    </isAuthContext.Provider>
  );
};

export const useAuthContext = () => {
  return useContext(isAuthContext);
};
