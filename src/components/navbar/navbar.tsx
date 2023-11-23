import { Logo } from "../logo/logo";

type NavbarProps = {
  size: "mobile" | "desktop";
};

export const Navbar = ({ size }: NavbarProps) => {
  return size === "mobile" ? (
    <div className="m-0 p-0">
      <Logo size="large" />
    </div>
  ) : (
    <div className="m-0 p-0">
      <Logo size="small" />
    </div>
  );
};
