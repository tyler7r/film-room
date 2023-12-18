import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { Button, Switch } from "@mui/material";
// import { Button } from "../button/button";
import { Logo } from "../logo/logo";
import MainMenu from "../main-menu/main-menu";

type DesktopNavProps = {
  switchTheme: () => void;
  affiliation: string | null;
};

const DesktopNav = ({ switchTheme }: DesktopNavProps) => {
  return (
    <div className="flex flex-col">
      <div className="flex justify-between px-3">
        <Logo size="large" />
        <div className="flex items-center gap-2">
          <Button variant="contained" size="large" href="/signup">
            Signup
          </Button>
          <Button
            variant="outlined"
            disabled={false}
            size="large"
            href="/login"
          >
            Login
          </Button>
          <Switch
            className="items-center justify-center"
            icon={<LightModeIcon color="primary" fontSize="small" />}
            onChange={switchTheme}
            checkedIcon={<DarkModeIcon fontSize="small" />}
          />
        </div>
      </div>
      <MainMenu size="large" />
    </div>
  );
};

export default DesktopNav;
