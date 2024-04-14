import { Button } from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";
import { useIsDarkContext } from "~/pages/_app";
import { TeamActionBarType } from "~/pages/team-hub/[team]";
import { TeamType } from "~/utils/types";
import Announcement from "../announcement";
import Requests from "../requests";

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
  const { colorBackground } = useIsDarkContext();
  const [requestCount, setRequestCount] = useState<number>(0);

  const handleModalToggle = (modal: string, open: boolean) => {
    if (modal === "roster") {
      setActionBarStatus({
        settings: open,
        announcement: false,
        requests: false,
      });
    } else if (modal === "announcement") {
      setActionBarStatus({
        settings: false,
        announcement: open,
        requests: false,
      });
    } else {
      setActionBarStatus({
        settings: false,
        announcement: false,
        requests: open,
      });
    }
  };

  return (
    <div>
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
            >
              Handle Requests
            </Button>
            {requestCount > 0 && !actionBarStatus.requests && (
              <div className="-ml-2 self-start text-xs font-bold">
                {requestCount}
              </div>
            )}
          </div>
          <Button
            size="small"
            onClick={() => router.push(`/team-settings/${team.id}`)}
          >
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
          <Button
            variant={actionBarStatus.requests ? "outlined" : "text"}
            onClick={() =>
              handleModalToggle("requests", !actionBarStatus.requests)
            }
          >
            {`Handle Requests ${requestCount !== 0 ? requestCount : null}`}
          </Button>
        </div>
      ) : null}
      {actionBarStatus.announcement && (
        <Announcement team={team} toggleOpen={handleModalToggle} />
      )}
      <Requests
        team={team}
        isOpen={actionBarStatus.requests}
        setRequestCount={setRequestCount}
      />
    </div>
  );
};

export default TeamActionBar;
