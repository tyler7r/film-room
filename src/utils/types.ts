export type TeamType = {
  announcements: string[] | null;
  city: string | null;
  division: string | null;
  id: number;
  logo: string | null;
  member_requests: string[] | null;
  name: string | null;
  next_opp: string | null;
  owner: string | null;
};

export type MessageType = {
  text: string | undefined;
  status: "error" | "success";
};
