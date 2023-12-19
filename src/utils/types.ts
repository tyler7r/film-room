export type TeamAffiliationType = {
  id: string;
  name: string;
  city: string;
  logo: string | null;
};

export type UserSession = {
  isLoggedIn: boolean;
  userId: string | undefined;
  email: string | undefined;
  currentAffiliation?: string | undefined;
  affiliations?: string[] | undefined;
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
