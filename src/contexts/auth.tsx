import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "~/utils/supabase";
import { type UserSession } from "~/utils/types";

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
    currentAffiliation: undefined,
    affiliations: undefined,
  },
  setUser: () => null,
});

export const IsAuth = ({ children }: AuthProps) => {
  const [user, setUser] = useState<UserSession>({
    isLoggedIn: false,
    userId: undefined,
    email: undefined,
    currentAffiliation: undefined,
    affiliations: undefined,
  });

  useEffect(() => {
    console.log(user);
  }, [user]);

  // const checkForAffiliation = async (user: string) => {
  //   const { data } = await supabase
  //     .from("affiliations")
  //     .select(`team_id`)
  //     .eq("user_id", user);
  //   if (data) return data.map((tm) => tm.team_id) as string[];
  //   else return undefined;
  // };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: string, session) => {
        // console.log(event, session);
        if ((event === "SIGNED_IN" || event === "USER_UPDATED") && session) {
          setUser({
            isLoggedIn: true,
            userId: session.user.id,
            email: session.user.email,
            // affiliations: await checkForAffiliation(session.user.id),
          });
        } else if (event === "INITIAL_SESSION" && session) {
          setUser({
            isLoggedIn: false,
            userId: session.user.id,
            email: session.user.email,
            // affiliations: await checkForAffiliation(session.user.id),
          });
        } else {
          setUser({
            isLoggedIn: false,
            userId: undefined,
            email: undefined,
            affiliations: undefined,
          });
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
