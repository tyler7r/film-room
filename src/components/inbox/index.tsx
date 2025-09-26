import { Button, Divider, Drawer } from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { useInboxContext } from "~/contexts/inbox";
import { useMobileContext } from "~/contexts/mobile";
import PageTitle from "../utils/page-title";
import InboxNotification from "./notifications";
import PendingTeamRequests from "./requests";
import TeamHeader from "./team-header";

const Inbox = () => {
  const { isOpen, setIsOpen, inboxScrollableRef } = useInboxContext();
  const { user } = useAuthContext();
  const { screenWidth, isMobile } = useMobileContext();
  const router = useRouter();
  const [hideRequests, setHideRequests] = useState<boolean>(false);

  return (
    <Drawer
      open={isOpen}
      anchor="right"
      onClose={() => setIsOpen(false)}
      // This is the key change: apply the ref directly to the Drawer's paper component
      PaperProps={{
        style: {
          width: isMobile ? screenWidth * 0.75 : screenWidth * 0.5,
          overflowY: "auto", // Ensure the drawer itself is scrollable
        },
        ref: inboxScrollableRef,
        id: "inbox-scrollable-container", // Add ID for InfiniteScroll
      }}
    >
      <div
        className="flex flex-col gap-2 p-2"
        style={{ width: isMobile ? screenWidth * 0.75 : screenWidth * 0.5 }}
      >
        <PageTitle size="large" title="Inbox" />
        {!user.isLoggedIn && (
          <div className="mb-4 mt-4 flex items-center justify-center gap-2">
            <Button
              variant="contained"
              size="medium"
              onClick={() => {
                setIsOpen(false);
                void router.push("/signup");
              }}
              sx={{ fontSize: { lg: "20px" }, lineHeight: { lg: "28px" } }}
            >
              Signup
            </Button>
            <Button
              variant="outlined"
              disabled={false}
              size="medium"
              onClick={() => {
                setIsOpen(false);
                void router.push("/login");
              }}
              sx={{ fontSize: { lg: "20px" }, lineHeight: { lg: "28px" } }}
            >
              Login
            </Button>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <TeamHeader />
          <Divider></Divider>
          <PendingTeamRequests hide={hideRequests} setHide={setHideRequests} />
          <InboxNotification />
        </div>
      </div>
    </Drawer>
  );
};

export default Inbox;
