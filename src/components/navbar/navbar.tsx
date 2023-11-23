import { useContext } from "react";
import { IsMobileContext } from "~/pages/_app";
import { Logo } from "../logo/logo";

export const Navbar = () => {
  let isMobile = useContext(IsMobileContext);
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
