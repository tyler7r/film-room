import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { Switch } from "@mui/material";
import { useAuthContext } from "~/contexts/auth";
import { useInboxContext } from "~/contexts/inbox";
import { useIsDarkContext } from "~/pages/_app";
import { type ChildrenNavProps } from "..";
import Inbox from "../../inbox";
import { Logo } from "../logo/logo";
import GuestDesktopNav from "./guest";
import UserDesktopNav from "./user";

const DesktopNav = ({ logout }: ChildrenNavProps) => {
  const { user } = useAuthContext();
  const { isOpen } = useInboxContext();
  const { isDark, setIsDark } = useIsDarkContext();

  return (
    <div className="flex flex-col gap-2">
      <div className="mt-2 flex w-full items-center justify-center p-2">
        <Logo size="small" />
        <div className="flex w-full items-center gap-2">
          {user.isLoggedIn ? (
            <UserDesktopNav logout={logout} />
          ) : (
            <GuestDesktopNav />
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
      {isOpen && <Inbox />}
    </div>
  );
};

export default DesktopNav;
