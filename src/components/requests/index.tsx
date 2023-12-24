import { Button, Typography, colors } from "@mui/material";
import { useEffect, useState } from "react";
import { useIsDarkContext } from "~/pages/_app";
import { supabase } from "~/utils/supabase";
import { TeamHubType } from "~/utils/types";

type RequestsProps = {
  team: TeamHubType;
  toggleOpen: (modal: string, open: boolean) => void;
};

type RequestType = {
  user_id: string;
  role: string;
  number: number | null;
  profiles: {
    name: string | null;
  } | null;
};

const Requests = ({ team, toggleOpen }: RequestsProps) => {
  const { isDark } = useIsDarkContext();
  const [requests, setRequests] = useState<RequestType[] | undefined>(
    undefined,
  );

  const fetchRequests = async () => {
    const { data } = await supabase
      .from("affiliations")
      .select("role, number, user_id, profiles(name)")
      .match({ team_id: team?.id, verified: false });
    if (data && data.length > 0) {
      setRequests(data);
    } else setRequests(undefined);
  };

  const handleAccept = async (id: string) => {
    const { data } = await supabase
      .from("affiliations")
      .update({
        verified: true,
      })
      .match({ team_id: team?.id, user_id: id })
      .select();
    if (data) {
      void fetchRequests();
    }
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from("affiliations")
      .delete()
      .match({ team_id: team?.id, user_id: id });
    if (!error) void fetchRequests();
  };

  useEffect(() => {
    void fetchRequests();
  }, []);

  return (
    <div className="m-2 flex flex-col gap-2">
      {!requests && (
        <Typography
          variant="button"
          fontSize={14}
          style={{
            backgroundColor: `${isDark ? colors.grey[900] : colors.grey[100]}`,
          }}
          className="flex items-center justify-center gap-2 rounded-lg px-4 py-1"
        >
          No Join Requests
        </Typography>
      )}
      {requests &&
        requests.map((req) => (
          <div
            key={req.user_id}
            style={{
              backgroundColor: `${
                isDark ? colors.grey[900] : colors.grey[100]
              }`,
            }}
            className="flex items-center justify-center gap-2 rounded-lg px-4 py-1"
          >
            <div>
              {req.profiles?.name} ({req.role})
            </div>
            <Button
              type="button"
              color="success"
              onClick={() => handleAccept(req.user_id)}
            >
              Accept
            </Button>
            <Button
              type="button"
              color="error"
              onClick={() => handleReject(req.user_id)}
            >
              Reject
            </Button>
          </div>
        ))}
    </div>
  );
};

export default Requests;
