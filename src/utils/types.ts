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
  currentAffiliation: string | undefined;
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
  one_id: string;
  season: string | null;
  tournament: string | null;
  two_id: string;
  one: {
    id: string;
    city: string;
    name: string;
  } | null;
  two: {
    id: string;
    city: string;
    name: string;
  } | null;
};
