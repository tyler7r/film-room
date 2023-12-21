import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "~/utils/supabase";
import { TeamAffiliationType } from "~/utils/types";
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
  const { user } = useAuthContext();

  const [affiliations, setAffiliations] = useState<
    TeamAffiliationType[] | undefined
  >(undefined);

  const fetchAffiliations = async () => {
    const { data } = await supabase
      .from("affiliations")
      .select(`teams!inner(id, name, city, division, logo)`)
      .match({ user_id: `${user.userId}`, verified: true });
    if (data) {
      const l: TeamAffiliationType[] = data.map((tm) => tm.teams!);
      console.log(l);
      setAffiliations(l);
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
  }, [user]);

  return (
    <isAffiliatedContext.Provider value={{ affiliations, setAffiliations }}>
      {children}
    </isAffiliatedContext.Provider>
  );
};

export const useAffiliatedContext = () => {
  return useContext(isAffiliatedContext);
};
