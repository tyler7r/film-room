import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import SearchIcon from "@mui/icons-material/Search";
import { IconButton } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Inbox from "~/components/inbox";
import { Logo } from "~/components/navbar/logo/logo";
import { useAuthContext } from "~/contexts/auth";
import { useInboxContext } from "~/contexts/inbox";
import type { ChildrenNavProps } from "..";
import GuestMobileNav from "./guest";
import MobileMainMenu from "./main-menu";
import UserMobileNav from "./user";

const MobileNav = ({ logout }: ChildrenNavProps) => {
  const { user } = useAuthContext();
  const { isOpen } = useInboxContext();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  return (
    <div className="flex flex-col">
      <div className="flex w-full items-center p-2">
        <Logo size="small" />
        <IconButton
          size="small"
          onClick={() => void router.push("/search/users")}
          sx={{ padding: 0 }}
        >
          <SearchIcon />
        </IconButton>
        <div className="flex w-full items-center justify-end gap-2">
          {user.isLoggedIn ? (
            <UserMobileNav logout={logout} />
          ) : (
            <GuestMobileNav />
          )}
          <IconButton
            className="m-0 hover:cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
            size="small"
            sx={{ padding: 0 }}
          >
            <MenuRoundedIcon fontSize="large" color="action" />
          </IconButton>
        </div>
      </div>
      {menuOpen && <MobileMainMenu />}
      {isOpen && <Inbox />}
    </div>
  );
};

export default MobileNav;
