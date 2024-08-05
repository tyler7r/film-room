import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { Button, Switch } from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuthContext } from "~/contexts/auth";
import { useInboxContext } from "~/contexts/inbox";
import { useIsDarkContext } from "~/pages/_app";
import { type ChildrenNavProps } from "..";
import Inbox from "../../inbox";
import { Logo } from "../../logo/logo";
import MainMenu from "../navbar-main-menu/main-menu";
import NavbarSearch from "../navbar-search";

const DesktopNav = ({ logout }: ChildrenNavProps) => {
  const { user } = useAuthContext();
  const { isOpen } = useInboxContext();
  const { isDark, setIsDark } = useIsDarkContext();
  const router = useRouter();

  return (
    <div className="flex flex-col">
      <div className="flex w-full items-center justify-center px-3">
        <Logo size="large" />
        <div className="flex w-full items-center gap-2">
          {user.isLoggedIn ? (
            <div className="flex w-full items-center justify-end gap-3">
              <NavbarSearch />
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
              <NavbarSearch />
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
      <MainMenu size="large" />
      {isOpen && <Inbox />}
    </div>
  );
};

export default DesktopNav;
