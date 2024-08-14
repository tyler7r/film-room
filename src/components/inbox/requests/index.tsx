import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { Divider, IconButton } from "@mui/material";
import { useEffect, useState } from "react";
import PageTitle from "~/components/utils/page-title";
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

  const fetchPendingRequests = async () => {
    if (user.userId) {
      const { data } = await supabase
        .from("user_teams")
        .select()
        .eq("affiliations->>user_id", user.userId)
        .eq("affiliations->>verified", false);
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
          void fetchPendingRequests();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    void fetchPendingRequests();
  }, [reload, user.userId]);

  return (
    <div className="flex flex-col gap-2">
      {pendingRequests && (
        <>
          <div className="flex items-center justify-center gap-4">
            <div>
              <PageTitle title="Pending Requests" size="x-small" />
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
            <div className="flex flex-col gap-2 px-4">
              {pendingRequests.map((req) => (
                <PendingRequest
                  key={req.affiliations.id}
                  request={req}
                  reload={reload}
                  setReload={setReload}
                />
              ))}
            </div>
          )}
          <Divider flexItem />
        </>
      )}
    </div>
  );
};

export default PendingTeamRequests;
