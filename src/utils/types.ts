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
            mention_id: string;
            play_id: string;
            play_title: string;
            receiver_name: string;
            start_time: number;
            team_id: string;
            user_id: string;
            video_id: string;
            viewed: boolean;
          };
        };
        user_view: {
          Row: {
            email: string;
            id: string;
            join_date: string;
            name: string;
            number: number | null;
            profile_id: string;
            role: string;
            team_id: string;
            verified: boolean;
          };
        };
        play_preview: {
          Row: {
            play: PlayType;
            video: VideoType;
          };
        };
        plays_via_tag: {
          Row: {
            play: PlayType;
            tag: TagType;
            video: VideoType;
          };
        };
        plays_via_user_mention: {
          Row: {
            play: PlayType;
            mention: MentionType;
            video: VideoType;
          };
        };
        comment_notification: {
          Row: {
            play: PlayType;
            video: VideoType;
            comment: CommentType;
            team: TeamType;
          };
        };
        mention_notification: {
          Row: {
            play: PlayType;
            video: VideoType;
            mention: MentionType;
            team: TeamType;
          };
        };
        user_teams: {
          Row: {
            affiliations: AffiliationType;
            team: TeamType;
          };
        };
      };
    };
  }
>;

export type AffiliationType = {
  team_id: string;
  user_id: string;
  id: string;
  verified: boolean;
  role: string;
  number: number | null;
};

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
  number?: number | null;
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
  link: string;
  private: boolean;
  season: string | null;
  title: string;
  tournament: string | null;
  uploaded_at: string;
  week: string | null;
  division: string;
  author_id: string;
};

export type PlayType = {
  id: string;
  note: string | null;
  author_id: string;
  highlight: boolean;
  exclusive_to: string | null;
  author_role: string;
  author_name: string;
  start_time: number;
  end_time: number;
  title: string;
  video_id: string;
  private: boolean;
  created_at: string;
};

export type IndexPlayType = {
  author_id: string | null;
  video_id: string | null;
  highlight: boolean;
  id: string;
  note: string | null;
  exclusive_to: string | null;
  private: boolean;
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
  join_date: string;
  profile_id: string;
  role: string;
  team_id: string;
  verified: boolean;
  number: number | null;
  email?: string;
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

export type CommentType = {
  id: string;
  created_at: string;
  comment: string;
  comment_author: string;
  author_name: string;
  team_id: string | null;
  play_id: string;
  viewed: boolean;
};

export type RealCommentType = {
  comment: string;
  comment_author_name: string;
  comment_id: string;
  created_at: string;
  highlight: boolean;
  note: string;
  play_id: string;
  play_title: string;
  private: boolean;
  start_time: number;
  team_id: string;
  play_author_id: string;
  video_id: string;
  video_title: string;
  viewed: boolean;
  team: TeamType | null;
}[];

export type TeamActionBarType = {
  settings: boolean;
  announcement: boolean;
  requests: boolean;
  transferOwner: boolean;
};

export type ProfileActionBarType = {
  createdPlays: boolean;
  mentions: boolean;
  highlights: boolean;
};

export type RequestType = {
  email: string;
  id: string;
  name: string;
  role: string;
  team_id: string;
  profile_id: string;
  verified: boolean;
}[];

export type UserType = {
  email: string | null;
  id: string;
  last_watched: string | null;
  last_watched_time: number | null;
  name: string | null;
  join_date: string;
};

export type AnnouncementType = {
  author_id: string;
  author_name: string;
  created_at: string;
  id: string;
  team_id: string;
  text: string;
};

export type PlayPreviewType = {
  play: PlayType;
  video: VideoType;
  mention?: MentionType;
  tag?: TagType;
};

export type MentionNotificationType = {
  play: PlayType;
  video: VideoType;
  team: TeamType;
  mention: MentionType;
};

export type CommentNotificationType = {
  play: PlayType;
  video: VideoType;
  team: TeamType;
  comment: CommentType;
};

export type UserTeamType = {
  affiliations: AffiliationType;
  team: TeamType;
};

export type TagType = {
  id: string;
  title: string;
  private: boolean;
  exclusive_to: string | null;
};

export type MentionType = {
  sender_id: string;
  receiver_id: string;
  play_id: string;
  created_at: string;
  receiver_name: string;
  sender_name: string;
  viewed: boolean;
  id: string;
};

export type LastWatchedType = {
  last_watched: string | null;
  last_watched_time: number | null;
  videos: {
    division: string;
    exclusive_to: string | null;
    id: string;
    link: string;
    private: boolean;
    season: string;
    title: string;
    tournament: string | null;
    uploaded_at: string;
    week: string | null;
    author_id: string;
  } | null;
};

export type StatsType = {
  mentionCount: number;
  playCount: number;
  highlightCount: number;
};
