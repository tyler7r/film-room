import { useMobileContext } from "~/contexts/mobile";
import { Logo } from "../logo/logo";

export const Navbar = () => {
  const isMobile = useMobileContext();
  return isMobile ? (
    <div className="m-0 p-0">
      <Logo size="small" />
    </div>
  ) : (
    <div className="m-0 p-0">
      <Logo size="large" />
    </div>
  );
};
