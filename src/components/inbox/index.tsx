import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Button, Divider, Drawer, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useAuthContext } from "~/contexts/auth";
import { useInboxContext } from "~/contexts/inbox";
import { useMobileContext } from "~/contexts/mobile";
import TeamLogo from "../team-logo";
import InboxMentions from "./mentions";

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
          <div className="flex flex-col items-start gap-2">
            {user.currentAffiliation?.team && (
              <div className="flex w-full flex-col items-center justify-center gap-1">
                <div className="flex items-center justify-center gap-3">
                  <TeamLogo tm={user.currentAffiliation} size={55}></TeamLogo>
                  <Typography
                    variant="h5"
                    className="text-lg font-bold md:text-2xl lg:text-4xl"
                  >
                    {`${user.currentAffiliation.team.city}
                    ${user.currentAffiliation.team.name}`}
                  </Typography>
                </div>
                <Button
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => {
                    void router.push(
                      `/team-hub/${user.currentAffiliation?.team.id}`,
                    );
                    setIsOpen(false);
                  }}
                  className="lg:text-lg"
                >
                  Go to Team Hub
                </Button>
              </div>
            )}
          </div>
          <Divider></Divider>
          <InboxMentions />
          {!user.isLoggedIn && (
            <div className="flex gap-2">
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
