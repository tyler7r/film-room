import { Button, Divider, Drawer } from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { useInboxContext } from "~/contexts/inbox";
import { useMobileContext } from "~/contexts/mobile";
import PageTitle from "../page-title";
import InboxComments from "./comments";
import InboxMentions from "./mentions";
import PendingTeamRequests from "./requests";
import TeamHeader from "./team-header";

const Inbox = () => {
  const { isOpen, setIsOpen } = useInboxContext();
  const { user } = useAuthContext();
  const { screenWidth } = useMobileContext();
  const router = useRouter();
  const [hideMentions, setHideMentions] = useState<boolean>(false);
  const [hideComments, setHideComments] = useState<boolean>(false);
  const [hideRequests, setHideRequests] = useState<boolean>(false);

  return (
    <Drawer open={isOpen} anchor="right" onClose={() => setIsOpen(false)}>
      <div
        className="flex flex-col gap-2 p-2"
        style={{ width: screenWidth * 0.5 }}
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
        <div className="flex flex-col gap-3">
          <TeamHeader />
          <Divider></Divider>
          <PendingTeamRequests hide={hideRequests} setHide={setHideRequests} />
          <InboxMentions hide={hideMentions} setHide={setHideMentions} />
          <Divider />
          <InboxComments hide={hideComments} setHide={setHideComments} />
        </div>
      </div>
    </Drawer>
  );
};

export default Inbox;
