import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { Button, Switch } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAffiliatedContext } from "~/contexts/affiliations";
import { useAuthContext } from "~/contexts/auth";
import { Logo } from "../logo/logo";
import MainMenu from "../main-menu/main-menu";
import { type ChildrenNavProps } from "./navbar";

const DesktopNav = ({ switchTheme, logout }: ChildrenNavProps) => {
  const { user } = useAuthContext();
  const { affiliations } = useAffiliatedContext();
  const router = useRouter();

  useEffect(() => {
    console.log(affiliations);
  }, [affiliations]);

  return (
    <div className="flex flex-col">
      <div className="flex justify-between px-3">
        <Logo size="large" />
        <div className="flex items-center gap-2">
          {user.isLoggedIn ? (
            <div className="flex items-center justify-center gap-3">
              <Button variant="contained" size="medium" onClick={logout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="contained"
                size="medium"
                onClick={() => router.push("/signup")}
              >
                Signup
              </Button>
              <Button
                variant="outlined"
                disabled={false}
                size="medium"
                onClick={() => router.push("/login")}
              >
                Login
              </Button>
            </div>
          )}
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
