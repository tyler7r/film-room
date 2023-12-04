import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { Switch } from "@mui/material";
import { useState } from "react";
import { Button } from "../button/button";
import { Logo } from "../logo/logo";
import { MobileMenu } from "../mobile-menu/mobile-menu";

type MobileNavProps = {
  switchTheme: () => void;
};

const MobileNav = ({ switchTheme }: MobileNavProps) => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  return (
    <div className="flex flex-col">
      <div className="align-center flex justify-between">
        <div className="align-center flex h-max justify-center self-center p-0">
          <Logo size="small" />
        </div>
        <div className="flex gap-1">
          <div className="align-center flex justify-center gap-2 px-1 py-4">
            <Button
              label="Signup"
              variant="contained"
              disabled={false}
              size="small"
              href="/signup"
            />
            <Button
              label="Login"
              variant="outlined"
              disabled={false}
              size="small"
              href="/login"
            />
          </div>
          <div className="align-center flex flex-col justify-center gap-0 p-0">
            <Switch
              className="m-0"
              icon={<LightModeIcon color="primary" fontSize="small" />}
              onChange={switchTheme}
              checkedIcon={<DarkModeIcon fontSize="small" />}
            />
            <div
              className="m-0 self-center hover:cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <MenuRoundedIcon fontSize="large" color="action" />
            </div>
          </div>
        </div>
      </div>
      {menuOpen && <MobileMenu />}
    </div>
  );
};

export default MobileNav;
