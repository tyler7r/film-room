import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthContext } from "~/contexts/auth";
import { useInboxContext } from "~/contexts/inbox";
import { useMobileContext } from "~/contexts/mobile";
import { supabase } from "~/utils/supabase";
import DesktopNav from "./desktop-nav";
import MobileNav from "./mobile-nav";

export type ChildrenNavProps = {
  logout: () => void;
};

export const Navbar = () => {
  const { isMobile } = useMobileContext();
  const { setUnreadCount } = useInboxContext();
  const { user } = useAuthContext();

  const router = useRouter();

  const fetchUnreadCount = async () => {
    const { count } = await supabase
      .from("inbox_mentions")
      .select("*", { count: "exact" })
      .match({ receiver_id: `${user.userId}`, viewed: false });
    console.log(count);
    if (count) setUnreadCount(count);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  useEffect(() => {
    if (user.isLoggedIn) void fetchUnreadCount();
  }, [user]);

  return isMobile ? (
    <MobileNav logout={logout} />
  ) : (
    <DesktopNav logout={logout} />
  );
};
