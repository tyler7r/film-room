import { useAuthContext } from "~/contexts/auth";
import { useMobileContext } from "~/contexts/mobile";
import { Button } from "../button/button";
import { Logo } from "../logo/logo";

export const Navbar = () => {
  const isMobile = useMobileContext();
  const auth = useAuthContext();

  return isMobile ? (
    <div className="m-0 p-0">
      <Logo size="small" />
      <Button label="Login" primary={false} size="small" />
      <Button label="Signup" primary={true} size="small" />
    </div>
  ) : (
    <div className="m-0 p-0">
      <Logo size="large" />
      <Button label="Login" primary={false} size="large" />
      <Button label="Signup" primary={true} size="large" />
    </div>
  );
};
