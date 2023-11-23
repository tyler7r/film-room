import { Logo } from "../logo/logo";

type NavbarProps = {
  size: "mobile" | "desktop";
};

export const Navbar = ({ size }: NavbarProps) => {
  return <Logo size="large" />;
};
