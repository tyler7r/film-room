import { Button, Divider, Drawer, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useAuthContext } from "~/contexts/auth";
import { useInboxContext } from "~/contexts/inbox";
import { useMobileContext } from "~/contexts/mobile";
import InboxMentions from "./mentions";
import TeamHeader from "./team-header";

const Inbox = () => {
  const { isOpen, setIsOpen } = useInboxContext();
  const { user } = useAuthContext();
  const { screenWidth } = useMobileContext();
  const router = useRouter();

  return (
    <Drawer open={isOpen} anchor="right" onClose={() => setIsOpen(false)}>
      <div className="p-2" style={{ width: screenWidth * 0.5 }}>
        <Typography className="p-2 text-center font-extrabold" variant="h2">
          Inbox
        </Typography>
        <div className="flex flex-col gap-3">
          <TeamHeader />
          <Divider></Divider>
          <InboxMentions />
          {!user.isLoggedIn && (
            <div className="mt-2 flex items-center justify-center gap-2">
              <Button
                variant="contained"
                size="medium"
                onClick={() => {
                  setIsOpen(false);
                  router.push("/signup");
                }}
                className="lg:text-xl"
              >
                Signup
              </Button>
              <Button
                variant="outlined"
                disabled={false}
                size="medium"
                onClick={() => {
                  setIsOpen(false);
                  router.push("/login");
                }}
                className="lg:text-xl"
              >
                Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default Inbox;
