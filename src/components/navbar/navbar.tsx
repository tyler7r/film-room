import { useMobileContext } from "~/contexts/mobile";
import DesktopNav from "./desktop-nav";
import MobileNav from "./mobile-nav";

type NavbarProps = {
  switchTheme: () => void;
  affiliation: string | null;
};

export const Navbar = ({ switchTheme, affiliation }: NavbarProps) => {
  const isMobile = useMobileContext();
  // const auth = useAuthContext();

  return isMobile ? (
    <MobileNav switchTheme={switchTheme} affiliation={affiliation} />
  ) : (
    <DesktopNav switchTheme={switchTheme} affiliation={affiliation} />
  );
};
