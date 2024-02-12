import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "~/utils/supabase";
import { type TeamAffiliationType } from "~/utils/types";
import { useAuthContext } from "./auth";

type AffiliationProps = {
  children: ReactNode;
};

type AffiliationContextProps = {
  affiliations: TeamAffiliationType[] | undefined;
  setAffiliations: (affiliations: TeamAffiliationType[] | undefined) => void;
};

export const isAffiliatedContext = createContext<AffiliationContextProps>({
  affiliations: undefined,
  setAffiliations: () => null,
});

export const IsAffiliated = ({ children }: AffiliationProps) => {
  const { user, setUser } = useAuthContext();

  const [affiliations, setAffiliations] = useState<
    TeamAffiliationType[] | undefined
  >(undefined);

  const fetchAffiliations = async () => {
    const { data } = await supabase
      .from("affiliations")
      .select(`teams!inner(id, name, city, division, logo)`)
      .match({ user_id: `${user.userId}`, verified: true });
    if (data && data.length > 0) {
      const typedAffiliations: TeamAffiliationType[] = data.map(
        (tm) => tm.teams!,
      );
      setAffiliations(typedAffiliations);
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel("affiliation_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "affiliations" },
        () => {
          void fetchAffiliations();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (user.userId) {
      void fetchAffiliations();
    }
    if (user.isLoggedIn && affiliations && !user.currentAffiliation) {
      setUser({ ...user, currentAffiliation: affiliations[0] });
    }
  }, [user]);

  return (
    <isAffiliatedContext.Provider
      value={{
        affiliations,
        setAffiliations,
      }}
    >
      {children}
    </isAffiliatedContext.Provider>
  );
};

export const useAffiliatedContext = () => {
  return useContext(isAffiliatedContext);
};
