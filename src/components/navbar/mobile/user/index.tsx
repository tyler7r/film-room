import MailIcon from "@mui/icons-material/Mail";
import PersonIcon from "@mui/icons-material/Person";
import { Badge, Button, IconButton } from "@mui/material";
import { useRouter } from "next/router";
import { useAuthContext } from "~/contexts/auth";
import { useInboxContext } from "~/contexts/inbox";
import type { ChildrenNavProps } from "../..";
import AddContentBtn from "../../add-content-btn";

const UserMobileNav = ({ logout }: ChildrenNavProps) => {
  const { isOpen, setIsOpen, unreadCount } = useInboxContext();
  const { user } = useAuthContext();
  const router = useRouter();

  return (
    <div className="flex items-center justify-center gap-3">
      <AddContentBtn />
      <IconButton
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        size="small"
        sx={{ padding: 0 }}
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
        sx={{ padding: 0 }}
      >
        <PersonIcon />
      </IconButton>
      <Button
        variant="contained"
        size="small"
        onClick={logout}
        sx={{
          fontSize: { xs: "10px", sm: "12px" }, // Responsive font size
          py: { xs: 0.4, sm: 0.5 },
          px: { xs: 1, sm: 1.5 }, // Responsive padding
          fontWeight: "bold",
        }}
      >
        Logout
      </Button>
    </div>
  );
};

export default UserMobileNav;
