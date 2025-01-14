import MailIcon from "@mui/icons-material/Mail";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import { Badge, Button, IconButton } from "@mui/material";
import { useRouter } from "next/router";
import { useAuthContext } from "~/contexts/auth";
import { useInboxContext } from "~/contexts/inbox";
import type { ChildrenNavProps } from "../..";
import TeamPageButton from "../../team-profile-btn";

const UserDesktopNav = ({ logout }: ChildrenNavProps) => {
  const router = useRouter();
  const { user } = useAuthContext();
  const { isOpen, setIsOpen, unreadCount } = useInboxContext();

  return (
    <div className="ml-3 flex w-full items-center justify-between">
      <div className="flex w-full items-center justify-start gap-1">
        <Button
          variant="text"
          sx={{ fontWeight: "bold", wordSpacing: "-1px" }}
          size="large"
          onClick={() => void router.push("/film-room")}
        >
          Film Room
        </Button>
        <TeamPageButton />
        <IconButton
          size="small"
          onClick={() => void router.push("/search/users")}
        >
          <SearchIcon />
        </IconButton>
      </div>
      <div className="flex w-full items-center justify-end gap-2">
        <IconButton
          onClick={() => {
            setIsOpen(!isOpen);
          }}
          size="small"
        >
          <MailIcon />
          <Badge
            badgeContent={unreadCount}
            color="primary"
            sx={{ alignSelf: "start" }}
          />
        </IconButton>
        <IconButton
          onClick={() => {
            void router.push(`/profile/${user.userId}`);
          }}
          size="small"
        >
          <PersonIcon />
        </IconButton>
        <Button
          variant="contained"
          size="small"
          sx={{ fontWeight: "bold" }}
          onClick={logout}
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

export default UserDesktopNav;
