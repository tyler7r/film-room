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
            team: TeamType | null;
            author: UserType;
          };
        };
        plays_via_tag: {
          Row: {
            play: PlayType;
            author: UserType;
            tag: TagType;
            video: VideoType;
            team: TeamType | null;
          };
        };
        plays_via_user_mention: {
          Row: {
            play: PlayType;
            mention: MentionType;
            video: VideoType;
            team: TeamType | null;
            author: UserType;
          };
        };
        comment_notification: {
          Row: {
            play: PlayType;
            video: VideoType;
            comment: CommentType;
            author: UserType;
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
            author: UserType;
          };
        };
        reply_notification: {
          Row: {
            play: PlayType;
            video: VideoType;
            reply: ReplyType;
            author: UserType;
            comment_author: UserType;
            comment: CommentType;
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
          Row: {
            collection: CollectionType;
            play: PlayType;
            video: VideoType;
            author: UserType;
          };
        };
        collection_view: {
          Row: {
            collection: CollectionType;
            profile: UserType;
            team: TeamType | null;
          };
        };
        play_mention_view: {
          Row: {
            receiver: UserType;
            play: PlayType;
            sender: UserType;
          };
        };
        announcement_view: {
          Row: {
            announcement: AnnouncementType;
            author: UserType;
          };
        };
        user_notifications_view: {
          Row: {
            notification_id: string;
            notification_type: "comment" | "mention" | "reply";
            source_id: string; // ID of the actual comment/mention/reply
            created_at: string; // ISO string for sorting
            viewed: string;
            related_play_id: string | null;
            related_play_title: string | null;
            actor_id: string; // User who initiated the notification
            actor_name: string;
            receiver_id: string; // User who receives the notification
            content_preview: string | null; // A short text snippet
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
    owner: string;
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
  owner: string;
  full_name: string;
};

export type MessageType = {
  text: string | undefined;
  status: "error" | "success";
};

export type VideoType = {
  exclusive_to: string | null;
  coach_video: boolean;
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
  start_time: number;
  end_time: number;
  title: string;
  video_id: string;
  private: boolean;
  created_at: string;
  end_time_sort: string;
  start_time_sort: string;
  post_to_feed: boolean;
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
  week: string;
  season: string;
  tournament: string | null;
  division: string;
  coach_video: boolean;
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
  send_notifications: boolean;
  last_notified: string;
};

export type AnnouncementType = {
  author_id: string;
  created_at: string;
  id: string;
  team_id: string;
  text: string;
};

export type AnnouncementViewType = {
  announcement: AnnouncementType;
  author: UserType;
};

export type CollectionType = {
  author_id: string;
  created_at: string;
  private: boolean;
  exclusive_to: string | null;
  title: string;
  id: string;
  description: string | null;
};

export type CollectionViewType = {
  collection: CollectionType;
  team: TeamType | null;
  profile: UserType;
};

export type CollectionPlaysType = {
  collection: CollectionType;
  play: PlayType;
};

export type PlayPreviewType = {
  play: PlayType;
  video: VideoType;
  author: UserType;
  mention?: MentionType;
  tag?: TagType;
  collection?: CollectionType;
  team?: TeamType | null;
};

export type MentionNotificationType = {
  play: PlayType;
  video: VideoType;
  team: TeamType | undefined;
  mention: MentionType;
  author: UserType;
};

export type CommentNotificationType = {
  play: PlayType;
  video: VideoType;
  comment: CommentType;
  author: UserType;
};

export type NotificationType = {
  play: PlayType;
  video: VideoType;
  comment?: CommentType;
  mention?: MentionType;
  team?: TeamType;
  reply?: ReplyType;
  comment_author?: UserType;
  author: UserType;
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
  post_to_feed: boolean;
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
  description: string;
};

export type PlayMentionViewType = {
  receiver: UserType;
  play: PlayType;
  sender: UserType;
};

export type EmailNotificationType = {
  video: VideoType;
  recipient: UserType;
  title: string;
  author: EmailAuthorType;
  play?: PlayType;
  comment?: CommentType;
  reply?: ReplyType;
};

export type EmailAuthorType = {
  name: string;
  email: string;
};

export type ReplyType = {
  id: string;
  created_at: string;
  reply: string;
  comment_id: string;
  author_id: string;
  viewed: boolean;
};

export type ReplyNotificationType = {
  play: PlayType;
  comment: CommentType;
  reply: ReplyType;
  comment_author: UserType;
  author: UserType;
  video: VideoType;
};

export type UnifiedNotificationType = {
  notification_id: string;
  notification_type: "comment" | "mention" | "reply";
  source_id: string; // ID of the actual comment/mention/reply
  created_at: string; // ISO string for sorting
  viewed: string;
  related_play_id: string | null;
  related_play_title: string | null;
  related_comment_id: string | null;
  related_comment_title: string | null;
  actor_id: string; // User who initiated the notification
  actor_name: string;
  receiver_id: string; // User who receives the notification
  content_preview: string | null; // A short text snippet
  exclusive_to: string | null;
  // Add other fields relevant to displaying each notification type
};

// --- NEW TEAM EMAIL NOTIFICATION TYPES ---

/**
 * Minimal recipient info required for the SES call.
 */
export type ProfileRecipient = Pick<UserType, "id" | "email">;

/**
 * Minimal player/requester info required for the email content.
 */
export type PlayerInfo = Pick<UserType, "id" | "name">;

// Base structure common to all team notification types
interface NotificationBase {
  title: string;
  team: TeamType;
  recipient: ProfileRecipient;
}

/**
 * 1. Payload structure for notifying the Team Owner about a new request (new_request).
 * Requires batching details (latestRequester and requestCount).
 */
interface NewRequestNotification extends NotificationBase {
  type: "new_request";
  latestRequester: PlayerInfo;
  requestCount: number;
}

/**
 * 2. Payload structure for notifying the Player about a decision (acceptance/rejection).
 * Requires the player's info.
 */
interface DecisionNotification extends NotificationBase {
  type: "acceptance" | "rejection";
  player: PlayerInfo;
}

/**
 * The full discriminated union type for the team email API payload (`/api/team-email`).
 */
export type TeamEmailNotificationType =
  | NewRequestNotification
  | DecisionNotification;
