import { Switch } from "@mui/material";
import { useMobileContext } from "~/contexts/mobile";
import { Button } from "../button/button";
import { Logo } from "../logo/logo";

type NavbarProps = {
  switchTheme: () => void;
};

export const Navbar = ({ switchTheme }: NavbarProps) => {
  const isMobile = useMobileContext();
  // const auth = useAuthContext();

  return isMobile ? (
    <div className="align-center flex justify-between">
      <Logo size="small" />
      <Switch onChange={switchTheme} />
      <div className="align-center flex justify-center gap-2 px-1 py-4">
        <Button
          label="Signup"
          variant="contained"
          disabled={false}
          size="small"
        />
        <Button
          label="Login"
          variant="outlined"
          disabled={false}
          size="small"
        />
      </div>
    </div>
  ) : (
    <div className="m-0 p-0">
      <Logo size="large" />
      <Button label="Login" variant="outlined" disabled={false} size="large" />
      <Button
        label="Signup"
        variant="contained"
        disabled={false}
        size="large"
      />
    </div>
  );
};
