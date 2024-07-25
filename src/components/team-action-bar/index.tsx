import { Badge, Button } from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";
import { useIsDarkContext } from "~/pages/_app";
import type { TeamActionBarType, TeamType } from "~/utils/types";
import AnnouncementModal from "../announcement-modal";
import Requests from "../requests";
import TransferOwnershipModal from "../transfer-ownership";

type TeamActionBarProps = {
  role: string;
  actionBarStatus: TeamActionBarType;
  setActionBarStatus: (status: TeamActionBarType) => void;
  team: TeamType;
};

const TeamActionBar = ({
  role,
  actionBarStatus,
  setActionBarStatus,
  team,
}: TeamActionBarProps) => {
  const router = useRouter();
  const { isDark } = useIsDarkContext();
  const [requestCount, setRequestCount] = useState<number>(0);

  const handleModalToggle = (modal: string, open: boolean) => {
    if (modal === "roster") {
      setActionBarStatus({
        settings: open,
        announcement: false,
        requests: false,
        transferOwner: false,
      });
    } else if (modal === "announcement") {
      setActionBarStatus({
        settings: false,
        announcement: open,
        requests: false,
        transferOwner: false,
      });
    } else if (modal === "requests") {
      setActionBarStatus({
        settings: false,
        announcement: false,
        requests: open,
        transferOwner: false,
      });
    } else {
      setActionBarStatus({
        settings: false,
        announcement: false,
        requests: false,
        transferOwner: open,
      });
    }
  };

  return (
    <div className={`w-full`}>
      {role === "owner" ? (
        <div className="flex w-full justify-center gap-4">
          <Button
            variant={actionBarStatus.announcement ? "outlined" : "text"}
            onClick={() =>
              handleModalToggle("announcement", !actionBarStatus.announcement)
            }
          >
            Send Announcement
          </Button>
          <div className="flex items-center">
            <Button
              variant={actionBarStatus.requests ? "outlined" : "text"}
              onClick={() =>
                handleModalToggle("requests", !actionBarStatus.requests)
              }
              sx={{ display: "flex", gap: 1 }}
            >
              <div>Handle Requests</div>
              {!actionBarStatus.requests && (
                <Badge
                  badgeContent={requestCount}
                  color="primary"
                  sx={{ alignSelf: "start" }}
                />
              )}
            </Button>
          </div>
          <Button
            onClick={() =>
              handleModalToggle("transferOwner", !actionBarStatus.transferOwner)
            }
          >
            Transfer Ownership
          </Button>
          <Button onClick={() => void router.push(`/team-settings/${team.id}`)}>
            Team Settings
          </Button>
        </div>
      ) : role === "coach" ? (
        <div className="flex w-full justify-center gap-4">
          <Button
            variant={actionBarStatus.announcement ? "outlined" : "text"}
            onClick={() =>
              handleModalToggle("announcement", !actionBarStatus.announcement)
            }
          >
            Send Announcement
          </Button>
          <div className="flex items-center">
            <Button
              variant={actionBarStatus.requests ? "outlined" : "text"}
              onClick={() =>
                handleModalToggle("requests", !actionBarStatus.requests)
              }
              sx={{ display: "flex", gap: 1 }}
            >
              <div>Handle Requests</div>
              {!actionBarStatus.requests && (
                <Badge
                  badgeContent={requestCount}
                  color="primary"
                  sx={{ alignSelf: "start" }}
                />
              )}
            </Button>
          </div>
        </div>
      ) : null}
      {actionBarStatus.announcement && (
        <AnnouncementModal team={team} toggleOpen={handleModalToggle} />
      )}
      <Requests
        team={team}
        isOpen={actionBarStatus.requests}
        setRequestCount={setRequestCount}
      />
      <TransferOwnershipModal
        toggleOpen={handleModalToggle}
        team={team}
        isOpen={actionBarStatus.transferOwner}
      />
    </div>
  );
};

export default TeamActionBar;
