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
  const { user } = useAuthContext();

  const [affiliations, setAffiliations] = useState<
    TeamAffiliationType[] | undefined
  >(undefined);

  const fetchAffiliations = async (profileId?: string) => {
    if (profileId) {
      const { data } = await supabase
        .from("user_view")
        .select("*")
        .eq("profile->>id", profileId);
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
          setAffiliations(typedAffiliations);
        else setAffiliations(undefined);
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
          void fetchAffiliations(user.userId);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    void fetchAffiliations(user.userId);
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
