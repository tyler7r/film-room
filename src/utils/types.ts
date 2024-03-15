export type TeamAffiliationType = {
  team: {
    id: string;
    name: string;
    city: string;
    division: string;
    logo: string | null;
  };
  role: string;
};

export type UserSession = {
  isLoggedIn: boolean;
  userId: string | undefined;
  email: string | undefined;
  name: string | undefined;
  currentAffiliation: TeamAffiliationType | undefined;
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

export type VideoType = {
  exclusive_to: string | null;
  id: string;
  link: string | null;
  private: boolean;
  season: string | null;
  title: string;
  tournament: string | null;
  uploaded_at: string;
  week: string | null;
};

export type PlayIndexType = {
  profile_id: string | null;
  video_id: string | null;
  highlight: boolean;
  id: string;
  note: string;
  team_id: string | null;
  author_name: string;
  author_role: string;
  start_time: number;
  end_time: number;
  title: string;
  mentions: {
    receiver_name: string;
  }[];
}[];

export type PlayType = {
  profile_id: string | null;
  video_id: string | null;
  highlight: boolean;
  id: string;
  note: string;
  team_id: string | null;
  author_name: string;
  author_role: string;
  start_time: number;
  end_time: number;
  title: string;
  mentions: {
    receiver_name: string;
  }[];
};

export type PlayerType = {
  user_id: string;
  profiles: {
    name: string | null;
  } | null;
}[];
