import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { Button, Switch } from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuthContext } from "~/contexts/auth";
import { useInboxContext } from "~/contexts/inbox";
import { useIsDarkContext } from "~/pages/_app";
import Inbox from "../inbox";
import { Logo } from "../logo/logo";
import MainMenu from "../main-menu/main-menu";
import TeamLogo from "../team-logo";
import UniversalSearch from "../universal-search";
import { type ChildrenNavProps } from "./navbar";

const DesktopNav = ({ logout }: ChildrenNavProps) => {
  const { user } = useAuthContext();
  const { isOpen } = useInboxContext();
  const { isDark, setIsDark } = useIsDarkContext();
  const router = useRouter();

  return (
    <div className="flex flex-col">
      <div className="flex justify-between px-3">
        <Logo size="large" />
        <div className="flex items-center gap-2">
          {user.isLoggedIn ? (
            <div className="flex items-center justify-center gap-3">
              <UniversalSearch />
              {user.currentAffiliation && (
                <TeamLogo
                  tm={user.currentAffiliation.team}
                  size={45}
                ></TeamLogo>
              )}
              <Button
                variant="contained"
                size="medium"
                onClick={logout}
                sx={{ fontSize: { lg: "20px" }, lineHeight: { lg: "28px" } }}
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <UniversalSearch />
              <Button
                variant="contained"
                size="medium"
                onClick={() => router.push("/signup")}
                sx={{ fontSize: { lg: "20px" }, lineHeight: { lg: "28px" } }}
              >
                Signup
              </Button>
              <Button
                variant="outlined"
                disabled={false}
                size="medium"
                onClick={() => router.push("/login")}
                sx={{ fontSize: { lg: "20px" }, lineHeight: { lg: "28px" } }}
              >
                Login
              </Button>
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
