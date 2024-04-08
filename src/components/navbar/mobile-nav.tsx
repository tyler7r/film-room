import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { Button, Switch } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { useInboxContext } from "~/contexts/inbox";
import { useIsDarkContext } from "~/pages/_app";
import Inbox from "../inbox";
import { Logo } from "../logo/logo";
import MainMenu from "../main-menu/main-menu";
import TeamLogo from "../team-logo";
import { type ChildrenNavProps } from "./navbar";

const MobileNav = ({ logout }: ChildrenNavProps) => {
  const { user } = useAuthContext();
  const { isOpen } = useInboxContext();
  const { isDark, setIsDark } = useIsDarkContext();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex h-max items-center justify-center p-0">
          <Logo size="small" />
        </div>
        <div className="flex gap-1">
          {user.isLoggedIn ? (
            <div className="flex items-center justify-center gap-3 px-1 py-2">
              {user.currentAffiliation && (
                <TeamLogo tm={user.currentAffiliation.team}></TeamLogo>
              )}
              <Button variant="contained" size="small" onClick={logout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 px-1 py-4">
              <Button
                variant="contained"
                size="small"
                onClick={() => router.push("/signup")}
              >
                Signup
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => router.push("/login")}
              >
                Login
              </Button>
            </div>
          )}
          <div className="flex flex-col items-center justify-center gap-0 p-0">
            <Switch
              className="m-0"
              icon={<LightModeIcon color="primary" fontSize="small" />}
              onChange={() => setIsDark(!isDark)}
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
      {isOpen && <Inbox />}
    </div>
  );
};

export default MobileNav;
