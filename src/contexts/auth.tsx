import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "~/utils/supabase";
import { type UserSession } from "~/utils/types";
import { useAffiliatedContext } from "./affiliations";

type AuthProps = {
  children: ReactNode;
};

type AuthContextProps = {
  user: UserSession;
  setUser: (user: UserSession) => void;
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
});

export const IsAuth = ({ children }: AuthProps) => {
  const { setAffiliations } = useAffiliatedContext();
  const [user, setUser] = useState<UserSession>({
    isLoggedIn: false,
    userId: undefined,
    email: undefined,
    name: undefined,
    currentAffiliation: undefined,
  });

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: string, session) => {
        console.log({ event: event, aff: user.currentAffiliation });
        if ((event === "SIGNED_IN" || event === "USER_UPDATED") && session) {
          setUser({
            currentAffiliation: user.currentAffiliation,
            isLoggedIn: true,
            userId: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata.name as string,
          });
        } else if (event === "INITIAL_SESSION" && session) {
          setUser({
            isLoggedIn: false,
            userId: undefined,
            email: undefined,
            name: undefined,
            currentAffiliation: undefined,
          });
        } else {
          setUser({
            isLoggedIn: false,
            userId: undefined,
            email: undefined,
            name: undefined,
            currentAffiliation: undefined,
          });
          setAffiliations(undefined);
        }
      },
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <isAuthContext.Provider value={{ user, setUser }}>
      {children}
    </isAuthContext.Provider>
  );
};

export const useAuthContext = () => {
  return useContext(isAuthContext);
};
