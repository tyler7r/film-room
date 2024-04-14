import type { MergeDeep } from "type-fest";
import type { Database as GeneratedDatabase } from "./generated_types";

export type Database = MergeDeep<
  GeneratedDatabase,
  {
    public: {
      Views: {
        transition_mention_view: {
          Row: {
            author_name: string;
            created_at: string;
            highlight: boolean;
            play_id: string;
            play_title: string;
            receiver_name: string;
            start_time: number;
            team_id: string;
            user_id: string;
            video_id: string;
          };
        };
        inbox_mentions: {
          Row: {
            author_name: string;
            created_at: string;
            highlight: boolean;
            play_id: string;
            play_title: string;
            private: boolean;
            start_time: number;
            receiver_id: string;
            team_id: string;
            title: string;
            video_id: string;
          };
        };
        player_view: {
          Row: {
            id: string;
            name: string;
            number: number | null;
            profile_id: string;
            role: string;
            team_id: string;
            verified: boolean;
          };
        };
      };
    };
  }
>;

export type TeamAffiliationType = {
  team: {
    id: string;
    name: string;
    city: string;
    division: string;
    logo: string | null;
    full_name: string;
    owner: string | null;
  };
  role: string;
  affId: string;
};

export type UserSession = {
  isLoggedIn: boolean;
  userId: string | undefined;
  email: string | undefined;
  name: string | undefined;
  currentAffiliation: TeamAffiliationType | undefined;
};

export type TeamType = {
  city: string;
  division: string;
  id: string;
  logo: string | null;
  name: string;
  owner: string | null;
  full_name: string;
};

export type MessageType = {
  text: string | undefined;
  status: "error" | "success";
};

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
  division: string;
};

export type PlayIndexType = {
  author_id: string | null;
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
  tags: {
    title: string;
  }[];
}[];

export type PlayType = {
  author_id: string | null;
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
  tags: {
    title: string;
  }[];
};

export type PlayerType = {
  id: string;
  name: string;
  profile_id: string;
  role: string;
  team_id: string;
  verified: boolean;
  number: number | null;
};

export type VideoUploadType = {
  link: string;
  title: string;
  private: boolean;
  exclusive_to: string | null;
  week: string | null;
  season: string;
  tournament: string | null;
  division: string;
};

export type LikeListType = {
  user_name: string;
}[];

export type TeamMentionType = {
  full_name: string;
  id: string;
}[];

export type RealMentionType = {
  author_name: string;
  created_at: string;
  highlight: boolean;
  play_id: string;
  play_title: string;
  private: boolean;
  receiver_id: string;
  start_time: number;
  team_id: string;
  title: string;
  video_id: string;
  team: TeamType | null;
}[];

export type TeamActionBarType = {
  settings: boolean;
  announcement: boolean;
  requests: boolean;
};
