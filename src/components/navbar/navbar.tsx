import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMobileContext } from "~/contexts/mobile";
import { supabase } from "~/utils/supabase";
import DesktopNav from "./desktop-nav";
import MobileNav from "./mobile-nav";

export type ChildrenNavProps = {
  logout: () => void;
  isInboxOpen: boolean;
  setIsInboxOpen: () => void;
};

export const Navbar = () => {
  const { isMobile } = useMobileContext();
  const router = useRouter();
  const [isInboxOpen, setIsInboxOpen] = useState<boolean>(false);

  const toggleInbox = () => {
    setIsInboxOpen(!isInboxOpen);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return isMobile ? (
    <MobileNav
      logout={logout}
      isInboxOpen={isInboxOpen}
      setIsInboxOpen={toggleInbox}
    />
  ) : (
    <DesktopNav
      logout={logout}
      isInboxOpen={isInboxOpen}
      setIsInboxOpen={toggleInbox}
    />
  );
};
