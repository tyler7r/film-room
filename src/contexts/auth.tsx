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
  affReload: boolean;
  setAffReload: (affReload: boolean) => void;
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
  affReload: false,
  setAffReload: () => null,
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
  const [affReload, setAffReload] = useState<boolean>(false);

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
          affIds ? setAffIds(affIds) : setAffIds([]);
        } else {
          setAffIds([]);
          setAffiliations(null);
        }
      }
    } else {
      setAffiliations(null);
      setAffIds([]);
    }
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: string, session) => {
        if (event !== "SIGNED_OUT" && session) {
          setUser({
            isLoggedIn: true,
            userId: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata.name as string,
          });
          void fetchAffiliations(session.user.id);
        } else {
          setUser({
            isLoggedIn: false,
            userId: undefined,
            email: undefined,
            name: undefined,
          });
          setAffiliations(null);
          setAffIds([]);
        }
      },
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // useEffect(() => {
  //   const channel = supabase
  //     .channel("affiliation_changes")
  //     .on(
  //       "postgres_changes",
  //       { event: "*", schema: "public", table: "affiliations" },
  //       () => {
  //         void fetchAffiliations(user.userId);
  //       },
  //     )
  //     .subscribe();

  //   return () => {
  //     void supabase.removeChannel(channel);
  //   };
  // }, []);

  useEffect(() => {
    void fetchAffiliations(user.userId);
  }, [user.userId]);

  useEffect(() => {
    if (affReload) {
      void fetchAffiliations(user.userId);
      setAffReload(false);
    } else return;
  }, [affReload]);

  return (
    <isAuthContext.Provider
      value={{
        user,
        setUser,
        affiliations,
        setAffiliations,
        affIds,
        setAffIds,
        affReload,
        setAffReload,
      }}
    >
      {affIds && children}
    </isAuthContext.Provider>
  );
};

export const useAuthContext = () => {
  return useContext(isAuthContext);
};
