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

export type TeamHubType = {
  city: string;
  division: string;
  id: string;
  logo: string | null;
  name: string;
  owner: string | null;
} | null;

export type GameListType = {
  id: string;
  link: string | null;
  season: string | null;
  team1_id: string | null;
  team2_id: string | null;
  tournament: string | null;
  teams: {
    city: string;
    name: string;
  } | null;
};
