import { MergeDeep } from "type-fest";
import { Database as GeneratedDatabase } from "./generated_types";

export type Database = MergeDeep<
  GeneratedDatabase,
  {
    public: {
      Views: {
        mention_filter: {
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
        real_mentions: {
          Row: {
            author_name: string;
            created_at: string;
            highlight: boolean;
            play_id: string;
            play_title: string;
            private: boolean;
            receiver_id: string;
            team_id: string;
            title: string;
            video_id: string;
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

export type TeamHubType = {
  city: string;
  division: string;
  id: string;
  logo: string | null;
  name: string;
  owner: string | null;
  full_name: string;
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

export type MentionType = {
  created_at: string;
  play_id: string;
  receiver_id: string;
  receiver_name: string;
  sender_id: string;
  sender_name: string;
  plays: {
    start_time: number;
    video_id: string;
    title: string;
    videos: {
      tournament: string | null;
      season: string | null;
      title: string;
    } | null;
  } | null;
}[];

export type PlayerType = {
  id: string;
  profiles: {
    name: string | null;
  } | null;
}[];

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
