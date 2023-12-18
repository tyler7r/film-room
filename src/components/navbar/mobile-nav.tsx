import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { Button, Switch } from "@mui/material";
import { useState } from "react";
import { Logo } from "../logo/logo";
import MainMenu from "../main-menu/main-menu";

type MobileNavProps = {
  switchTheme: () => void;
  affiliation: string | null;
};

const MobileNav = ({ switchTheme }: MobileNavProps) => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex h-max items-center justify-center p-0">
          <Logo size="small" />
        </div>
        <div className="flex gap-1">
          <div className="flex items-center justify-center gap-2 px-1 py-4">
            <Button variant="contained" size="small" href="/signup">
              Signup
            </Button>
            <Button variant="outlined" size="small" href="/login">
              Login
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center gap-0 p-0">
            <Switch
              className="m-0"
              icon={<LightModeIcon color="primary" fontSize="small" />}
              onChange={switchTheme}
              checkedIcon={<DarkModeIcon fontSize="small" />}
            />
            <div
              className="m-0 hover:cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <MenuRoundedIcon fontSize="large" color="action" />
            </div>
          </div>
        </div>
      </div>
      {menuOpen && <MainMenu size="medium" />}
    </div>
  );
};

export default MobileNav;
