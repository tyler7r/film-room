import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import MailIcon from "@mui/icons-material/Mail";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { Badge, Button, IconButton, Switch } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Inbox from "~/components/inbox";
import { Logo } from "~/components/navbar/logo/logo";
import { useAuthContext } from "~/contexts/auth";
import { useInboxContext } from "~/contexts/inbox";
import { useIsDarkContext } from "~/pages/_app";
import type { ChildrenNavProps } from "..";
import MobileMainMenu from "../mobile-main-menu";

const MobileNav = ({ logout }: ChildrenNavProps) => {
  const { user } = useAuthContext();
  const { isOpen, setIsOpen, unreadCount } = useInboxContext();
  const { isDark, setIsDark } = useIsDarkContext();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  return (
    <div className="flex flex-col">
      <div className="flex w-full items-center">
        <Logo size="small" />
        <div className="flex w-full items-center gap-1">
          {user.isLoggedIn ? (
            <div className="flex w-full items-center justify-end gap-3 px-1 py-2">
              <div className="flex items-center justify-center gap-2">
                <IconButton
                  onClick={() => {
                    setIsOpen(!isOpen);
                  }}
                  size="small"
                >
                  <MailIcon fontSize="large" />
                  <Badge
                    badgeContent={unreadCount}
                    color="primary"
                    sx={{ alignSelf: "start" }}
                  />
                </IconButton>
                <Button variant="contained" size="small" onClick={logout}>
                  Logout
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex w-full items-center justify-end gap-2 px-1">
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
      {menuOpen && <MobileMainMenu />}
      {isOpen && <Inbox />}
    </div>
  );
};

export default MobileNav;
