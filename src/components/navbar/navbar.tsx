import { useMobileContext } from "~/contexts/mobile";
import { Button } from "../button/button";
import { Logo } from "../logo/logo";

export const Navbar = () => {
  const isMobile = useMobileContext();
  // const auth = useAuthContext();

  return isMobile ? (
    <div className="align-center flex justify-between">
      <Logo size="small" />
      <div className="align-center flex justify-center gap-2 px-1 py-4">
        <Button label="Signup" primary={true} size="small" />
        <Button label="Login" primary={false} size="small" />
      </div>
    </div>
  ) : (
    <div className="m-0 p-0">
      <Logo size="large" />
      <Button label="Login" primary={false} size="large" />
      <Button label="Signup" primary={true} size="large" />
    </div>
  );
};
