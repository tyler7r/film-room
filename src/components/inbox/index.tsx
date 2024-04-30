import { Button, Divider, Drawer, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { useInboxContext } from "~/contexts/inbox";
import { useMobileContext } from "~/contexts/mobile";
import InboxComments from "./comments";
import InboxMentions from "./mentions";
import TeamHeader from "./team-header";

const Inbox = () => {
  const { isOpen, setIsOpen } = useInboxContext();
  const { user } = useAuthContext();
  const { screenWidth } = useMobileContext();
  const router = useRouter();
  const [hideMentions, setHideMentions] = useState<boolean>(false);
  const [hideComments, setHideComments] = useState<boolean>(false);

  return (
    <Drawer open={isOpen} anchor="right" onClose={() => setIsOpen(false)}>
      <div className="p-2" style={{ width: screenWidth * 0.5 }}>
        <Typography
          className="p-2 text-center"
          sx={{ fontWeight: "800" }}
          variant="h2"
        >
          Inbox
        </Typography>
        {!user.isLoggedIn && (
          <div className="mb-4 flex items-center justify-center gap-2">
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
          <InboxMentions hide={hideMentions} setHide={setHideMentions} />
          <Divider />
          <InboxComments hide={hideComments} setHide={setHideComments} />
        </div>
      </div>
    </Drawer>
  );
};

export default Inbox;
