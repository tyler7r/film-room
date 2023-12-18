import { useMobileContext } from "~/contexts/mobile";
import DesktopNav from "./desktop-nav";
import MobileNav from "./mobile-nav";

type NavbarProps = {
  switchTheme: () => void;
};

export const Navbar = ({ switchTheme }: NavbarProps) => {
  const isMobile = useMobileContext();

  return isMobile ? (
    <MobileNav switchTheme={switchTheme} />
  ) : (
    <DesktopNav switchTheme={switchTheme} />
  );
};
