import DarkModeIcon from "@mui/icons-material/DarkMode";
import InboxIcon from "@mui/icons-material/Inbox";
import LightModeIcon from "@mui/icons-material/LightMode";
import { Badge, Button, IconButton, Switch } from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuthContext } from "~/contexts/auth";
import { useInboxContext } from "~/contexts/inbox";
import { useMobileContext } from "~/contexts/mobile";
import { useIsDarkContext } from "~/pages/_app";
import { type ChildrenNavProps } from "..";
import Inbox from "../../inbox";
import DesktopMainMenu from "../desktop-main-menu";
import { Logo } from "../logo/logo";
import MobileMainMenu from "../mobile-main-menu";

const DesktopNav = ({ logout }: ChildrenNavProps) => {
  const { user } = useAuthContext();
  const { screenWidth } = useMobileContext();
  const { isOpen, setIsOpen, unreadCount } = useInboxContext();
  const { isDark, setIsDark } = useIsDarkContext();
  const router = useRouter();

  return (
    <div className="flex flex-col gap-2">
      <div className="mt-2 flex w-full items-center justify-center p-2">
        <Logo size="small" />
        <div className="flex w-full items-center gap-2">
          {user.isLoggedIn ? (
            <div className="flex w-full items-center justify-end gap-3">
              <IconButton
                onClick={() => {
                  setIsOpen(!isOpen);
                }}
                size="small"
              >
                <InboxIcon fontSize="large" />
                <Badge
                  badgeContent={unreadCount}
                  color="primary"
                  sx={{ alignSelf: "start" }}
                />
              </IconButton>
              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="contained"
                  size="medium"
                  onClick={logout}
                  sx={{
                    fontSize: { lg: "20px" },
                    lineHeight: { lg: "28px" },
                  }}
                >
                  Logout
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex w-full items-center justify-end gap-2">
              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="contained"
                  size="medium"
                  onClick={() => router.push("/signup")}
                  sx={{
                    fontSize: { lg: "20px" },
                    lineHeight: { lg: "28px" },
                  }}
                >
                  Signup
                </Button>
                <Button
                  variant="outlined"
                  disabled={false}
                  size="medium"
                  onClick={() => router.push("/login")}
                  sx={{
                    fontSize: { lg: "20px" },
                    lineHeight: { lg: "28px" },
                  }}
                >
                  Login
                </Button>
              </div>
            </div>
          )}
          <Switch
            className="items-center justify-center"
            sx={{ fontSize: { lg: "20px" }, lineHeight: { lg: "28px" } }}
            icon={<LightModeIcon color="primary" fontSize="small" />}
            onChange={() => setIsDark(!isDark)}
            checkedIcon={<DarkModeIcon fontSize="small" />}
          />
        </div>
      </div>
      {screenWidth > 749 ? <DesktopMainMenu /> : <MobileMainMenu />}
      {isOpen && <Inbox />}
    </div>
  );
};

export default DesktopNav;
