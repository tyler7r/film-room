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
            affiliation: AffiliationType;
            profile: UserType;
            team: TeamType;
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
          };
        };
        last_watched_view: {
          Row: {
            profile: UserType;
            video: VideoType;
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
        team_video_view: {
          Row: {
            video: VideoType;
            team: TeamType;
          };
        };
        user_teams: {
          Row: {
            affiliations: AffiliationType;
            team: TeamType;
          };
        };
        collection_plays_view: {
          collection: CollectionType;
          play: PlayType;
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
  affId: string;
  role: string;
  number?: number | null;
};

export type UserSession = {
  isLoggedIn: boolean;
  userId: string | undefined;
  email: string | undefined;
  name: string | undefined;
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
  author_id: string | null;
  duplicate_check: string;
  keywords: string;
};

export type PlayType = {
  id: string;
  note: string | null;
  author_id: string;
  highlight: boolean;
  exclusive_to: string | null;
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
  team: TeamType;
  profile: UserType;
  affiliation: AffiliationType;
};

export type VideoUploadType = {
  link: string;
  title: string;
  private: boolean;
  exclusive_to: string;
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
  play_id: string;
  viewed: boolean;
};

export type TeamActionBarType = {
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
  email: string | null | undefined;
  id: string;
  last_watched: string | null;
  last_watched_time: number | null;
  name: string;
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

export type CollectionType = {
  author_id: string;
  created_at: string;
  private: boolean;
  exclusive_to: string | null;
  title: string;
  id: string;
};

export type CollectionPlaysType = {
  collection: CollectionType;
  play: PlayType;
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
  team: TeamType | undefined;
  mention: MentionType;
};

export type CommentNotificationType = {
  play: PlayType;
  video: VideoType;
  comment: CommentType;
};

export type NotificationType = {
  play: PlayType;
  video: VideoType;
  comment?: CommentType;
  mention?: MentionType;
  team?: TeamType;
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
  profile: UserType;
  video: VideoType;
};

export type StatsType = {
  mentionCount: number;
  playCount: number;
  highlightCount: number;
};

export type TeamVideoType = {
  team: TeamType;
  video: VideoType;
};

export type NewPlayType = {
  start: number | null | undefined;
  end: number | null | undefined;
  title: string;
  note: string;
  highlight: boolean;
  private: boolean;
  exclusive_to: string;
};

export type NewTagType = {
  title: string;
  exclusive_to: string;
  private: boolean;
  inputValue?: string;
};

export type NewCollectionType = {
  title: string;
  exclusive_to: string;
  private: boolean;
  inputValue?: string;
};
