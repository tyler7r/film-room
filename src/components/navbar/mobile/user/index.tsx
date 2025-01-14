import MailIcon from "@mui/icons-material/Mail";
import PersonIcon from "@mui/icons-material/Person";
import { Badge, Button, IconButton } from "@mui/material";
import { useRouter } from "next/router";
import { useAuthContext } from "~/contexts/auth";
import { useInboxContext } from "~/contexts/inbox";
import type { ChildrenNavProps } from "../..";

const UserMobileNav = ({ logout }: ChildrenNavProps) => {
  const { isOpen, setIsOpen, unreadCount } = useInboxContext();
  const { user } = useAuthContext();
  const router = useRouter();

  return (
    <div className="flex items-center justify-center gap-2">
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
        onClick={() => void router.push(`/profile/${user.userId}`)}
        size="small"
      >
        <PersonIcon />
      </IconButton>
      <Button
        variant="contained"
        size="small"
        onClick={logout}
        sx={{ fontWeight: "bold" }}
      >
        Logout
      </Button>
    </div>
  );
};

export default UserMobileNav;
