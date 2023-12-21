export type TeamAffiliationType = {
  id: string;
  name: string;
  city: string;
  division: string;
  logo: string | null;
};

export type UserSession = {
  isLoggedIn: boolean;
  userId: string | undefined;
  email: string | undefined;
  name: string | undefined;
};

export type TeamType = {
  announcements: string[] | null;
  city: string | null;
  division: string | null;
  id: string;
  logo: string | null;
  name: string | null;
  owner: string | null;
};

export type MessageType = {
  text: string | undefined;
  status: "error" | "success";
};
