import { useRouter } from "next/navigation";
import { useMobileContext } from "~/contexts/mobile";
import { supabase } from "~/utils/supabase";
import DesktopNav from "./desktop-nav";
import MobileNav from "./mobile-nav";

type NavbarProps = {
  switchTheme: () => void;
};

export type ChildrenNavProps = {
  switchTheme: () => void;
  logout: () => void;
};

export const Navbar = ({ switchTheme }: NavbarProps) => {
  const isMobile = useMobileContext();
  const router = useRouter();

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return isMobile ? (
    <MobileNav switchTheme={switchTheme} logout={logout} />
  ) : (
    <DesktopNav switchTheme={switchTheme} logout={logout} />
  );
};
