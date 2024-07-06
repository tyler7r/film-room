import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { IconButton } from "@mui/material";
import { useEffect, useState } from "react";
import EmptyMessage from "~/components/empty-msg";
import { useAuthContext } from "~/contexts/auth";
import { supabase } from "~/utils/supabase";
import type { UserTeamType } from "~/utils/types";
import PendingRequest from "./request";

type PendingTeamRequestsProps = {
  hide: boolean;
  setHide: (hide: boolean) => void;
};

const PendingTeamRequests = ({ hide, setHide }: PendingTeamRequestsProps) => {
  const { user } = useAuthContext();
  const [pendingRequests, setPendingRequests] = useState<UserTeamType[] | null>(
    null,
  );
  const [reload, setReload] = useState<boolean>(false);

  const fetchPendingRequests = async (profileId?: string) => {
    if (profileId) {
      const { data } = await supabase.from("user_teams").select().match({
        "affiliations->>user_id": profileId,
        "affiliations->>verified": false,
      });
      if (data && data.length > 0) setPendingRequests(data);
      else setPendingRequests(null);
    } else setPendingRequests(null);
  };

  useEffect(() => {
    const channel = supabase
      .channel("affiliation_changes")
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "affiliations" },
        () => {
          void fetchPendingRequests(user.userId);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    void fetchPendingRequests(user.userId);
  }, [reload]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold lg:mb-2 lg:text-3xl">
          Pending Join Requests
        </div>
        {hide && (
          <IconButton size="small" onClick={() => setHide(false)}>
            <KeyboardArrowRightIcon />
          </IconButton>
        )}
        {!hide && (
          <>
            <IconButton size="small" onClick={() => setHide(true)}>
              <ExpandMoreIcon />
            </IconButton>
          </>
        )}
      </div>
      {!hide && (
        <div className="flex flex-col gap-2">
          {pendingRequests?.map((req) => (
            <PendingRequest
              key={req.affiliations.id}
              request={req}
              reload={reload}
              setReload={setReload}
            />
          ))}
          {!pendingRequests && (
            <EmptyMessage message="pending team requests" size="small" />
          )}
        </div>
      )}
    </div>
  );
};

export default PendingTeamRequests;
