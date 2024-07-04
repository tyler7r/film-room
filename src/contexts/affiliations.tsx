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
    if (user.userId) {
      const { data } = await supabase
        .from("affiliations")
        .select(
          `role, id, number, teams!inner(id, name, city, division, logo, full_name, owner)`,
        )
        .match({ user_id: `${user.userId}`, verified: true });
      if (data && data.length > 0) {
        const typedAffiliations: TeamAffiliationType[] = data.map((tm) => ({
          team: tm.teams!,
          role: tm.role,
          affId: tm.id,
          number: tm.number,
        }));
        if (user.isLoggedIn) {
          setAffiliations(typedAffiliations);
          setUser({ ...user, currentAffiliation: typedAffiliations[0] });
        }
      }
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
    if (user.isLoggedIn) {
      void fetchAffiliations();
    } else setAffiliations(undefined);
  }, [user.isLoggedIn]);

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
