import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { Switch } from "@mui/material";
import { useMobileContext } from "~/contexts/mobile";
import { Button } from "../button/button";
import { Logo } from "../logo/logo";

type NavbarProps = {
  switchTheme: () => void;
  isDark: boolean;
};

export const Navbar = ({ switchTheme, isDark }: NavbarProps) => {
  const isMobile = useMobileContext();
  // const auth = useAuthContext();

  return isMobile ? (
    <div className="align-center flex justify-between">
      <Logo size="small" />
      <Switch
        className="self-center"
        icon={<LightModeIcon color="primary" fontSize="small" />}
        onChange={switchTheme}
        checkedIcon={<DarkModeIcon fontSize="small" />}
      />
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
    <div className="align-center flex justify-between">
      <Logo size="large" />
      <Switch className="self-center" onChange={switchTheme} />
      <div className="align-center flex justify-center gap-2 px-1 py-8">
        <Button
          label="Signup"
          variant="contained"
          disabled={false}
          size="large"
        />
        <Button
          label="Login"
          variant="outlined"
          disabled={false}
          size="large"
        />
      </div>
    </div>
  );
};
