import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { Switch } from "@mui/material";
import { Button } from "../button/button";
import { Logo } from "../logo/logo";

type DesktopNavProps = {
  switchTheme: () => void;
};

const DesktopNav = ({ switchTheme }: DesktopNavProps) => {
  return (
    <div className="align-center flex justify-between">
      <Logo size="large" />
      <Switch
        className="self-center"
        icon={<LightModeIcon color="primary" fontSize="small" />}
        onChange={switchTheme}
        checkedIcon={<DarkModeIcon fontSize="small" />}
      />
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

export default DesktopNav;
