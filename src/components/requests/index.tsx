import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import { useAuthContext } from "~/contexts/auth";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import type { PlayerType, TeamType } from "~/utils/types";
import EmptyMessage from "../utils/empty-msg";
import PageTitle from "../utils/page-title";

type RequestsProps = {
  team: TeamType;
  setRequestCount: (count: number) => void;
  isOpen: boolean;
};

const Requests = ({ team, setRequestCount, isOpen }: RequestsProps) => {
  const { backgroundStyle } = useIsDarkContext();
  const { setAffReload } = useAuthContext();
  const [requests, setRequests] = useState<PlayerType[] | null>(null);

  const fetchRequests = async () => {
    const { data, count } = await supabase
      .from("user_view")
      .select("*", { count: "exact" })
      .match({ "team->>id": team.id, "affiliation->>verified": false });
    if (data && data.length > 0) {
      setRequests(data);
    } else setRequests(null);
    if (count && count > 0) setRequestCount(count);
    else setRequestCount(0);
  };

  const handleAccept = async (id: string) => {
    const { data } = await supabase
      .from("affiliations")
      .update({
        verified: true,
      })
      .eq("id", id)
      .select();
    if (data) {
      void fetchRequests();
      setAffReload(true);
    }
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase.from("affiliations").delete().eq("id", id);
    if (!error) {
      void fetchRequests();
      setAffReload(true);
    }
  };

  useEffect(() => {
    void fetchRequests();
  }, []);

  return isOpen ? (
    <div className="flex flex-col gap-2 text-center">
      <PageTitle title="Join Requests" size="small" />
      {!requests && <EmptyMessage message="requests" />}
      {requests?.map((req) => (
        <div
          key={req.affiliation.id}
          style={backgroundStyle}
          className="flex items-center justify-center gap-2 rounded-lg px-4 py-1"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <div className="text-lg font-bold tracking-tight">
                {req.profile.name}
              </div>
              <div className="text-xs tracking-tight">{req.profile.email}</div>
            </div>
            <div className="text-sm font-light">({req.affiliation.role})</div>
          </div>
          <Button
            type="button"
            color="success"
            onClick={() => handleAccept(req.affiliation.id)}
          >
            Accept
          </Button>
          <Button
            type="button"
            color="error"
            onClick={() => handleReject(req.affiliation.id)}
          >
            Reject
          </Button>
        </div>
      ))}
    </div>
  ) : null;
};

export default Requests;
