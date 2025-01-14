import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { supabase } from "~/utils/supabase";
import DesktopNav from "./desktop";
import MobileNav from "./mobile";

export type ChildrenNavProps = {
  logout: () => void;
};

type FetchOptions = {
  loggedIn: boolean;
  userId: string | undefined;
};

export const Navbar = () => {
  const { screenWidth } = useMobileContext();
  const { user } = useAuthContext();
  const router = useRouter();

  const [options, setOptions] = useState<FetchOptions>({
    loggedIn: user.isLoggedIn,
    userId: user.userId,
  });

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  useEffect(() => {
    setOptions({ ...options, loggedIn: user.isLoggedIn, userId: user.userId });
  }, [user]);

  return screenWidth <= 745 ? (
    <MobileNav logout={logout} />
  ) : (
    <DesktopNav logout={logout} />
  );
};
