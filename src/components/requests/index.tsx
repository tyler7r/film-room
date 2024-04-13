import { Button, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import { type TeamType } from "~/utils/types";

type RequestsProps = {
  team: TeamType;
};

type RequestType = {
  id: string;
  name: string;
  role: string;
  team_id: string;
  profile_id: string;
  verified: boolean;
}[];

const Requests = ({ team }: RequestsProps) => {
  const { backgroundStyle } = useIsDarkContext();
  const [requests, setRequests] = useState<RequestType | null>(null);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from("player_view")
      .select("*")
      .match({ team_id: team.id, verified: false });
    if (data && data.length > 0) {
      setRequests(data);
    } else setRequests(null);
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
    }
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase.from("affiliations").delete().eq("id", id);
    if (!error) void fetchRequests();
  };

  useEffect(() => {
    void fetchRequests();
  }, []);

  return (
    <div className="m-2 flex flex-col gap-2 text-center">
      {!requests && (
        <Typography variant="button" fontSize={14} style={backgroundStyle}>
          No Join Requests
        </Typography>
      )}
      {requests?.map((req) => (
        <div
          key={req.id}
          style={backgroundStyle}
          className="flex items-center justify-center gap-2 rounded-lg px-4 py-1"
        >
          <div>
            {req.name} ({req.role})
          </div>
          <Button
            type="button"
            color="success"
            onClick={() => handleAccept(req.id)}
          >
            Accept
          </Button>
          <Button
            type="button"
            color="error"
            onClick={() => handleReject(req.id)}
          >
            Reject
          </Button>
        </div>
      ))}
    </div>
  );
};

export default Requests;
