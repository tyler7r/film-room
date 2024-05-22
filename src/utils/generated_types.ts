export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      affiliations: {
        Row: {
          id: string
          number: number | null
          role: string
          team_id: string
          user_id: string
          verified: boolean
        }
        Insert: {
          id?: string
          number?: number | null
          role?: string
          team_id: string
          user_id: string
          verified?: boolean
        }
        Update: {
          id?: string
          number?: number | null
          role?: string
          team_id?: string
          user_id?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "affiliations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "inbox_mentions"
            referencedColumns: ["receiver_id"]
          },
          {
            foreignKeyName: "affiliations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "p_likes"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "affiliations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "player_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "affiliations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_likes: {
        Row: {
          announcement_id: string
          created_at: string
          user_id: string
          user_name: string
        }
        Insert: {
          announcement_id: string
          created_at?: string
          user_id: string
          user_name: string
        }
        Update: {
          announcement_id?: string
          created_at?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_announcement_likes_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_announcement_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "inbox_mentions"
            referencedColumns: ["receiver_id"]
          },
          {
            foreignKeyName: "public_announcement_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "p_likes"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "public_announcement_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "player_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "public_announcement_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          author_id: string
          author_name: string
          created_at: string
          id: string
          team_id: string
          text: string
        }
        Insert: {
          author_id?: string
          author_name: string
          created_at?: string
          id?: string
          team_id: string
          text: string
        }
        Update: {
          author_id?: string
          author_name?: string
          created_at?: string
          id?: string
          team_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_announcements_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "affiliations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_announcements_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "player_view"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          user_id: string
          user_name: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          user_id: string
          user_name: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comment_notifications"
            referencedColumns: ["comment_id"]
          },
          {
            foreignKeyName: "public_comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comment_transition_view"
            referencedColumns: ["comment_id"]
          },
          {
            foreignKeyName: "public_comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "inbox_mentions"
            referencedColumns: ["receiver_id"]
          },
          {
            foreignKeyName: "public_comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "p_likes"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "public_comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "player_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "public_comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_name: string
          comment: string
          comment_author: string
          created_at: string
          id: string
          play_id: string
          team_id: string | null
          viewed_by_author: boolean
        }
        Insert: {
          author_name: string
          comment: string
          comment_author?: string
          created_at?: string
          id?: string
          play_id?: string
          team_id?: string | null
          viewed_by_author?: boolean
        }
        Update: {
          author_name?: string
          comment?: string
          comment_author?: string
          created_at?: string
          id?: string
          play_id?: string
          team_id?: string | null
          viewed_by_author?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "public_comments_comment_author_fkey"
            columns: ["comment_author"]
            isOneToOne: false
            referencedRelation: "affiliations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_comments_comment_author_fkey"
            columns: ["comment_author"]
            isOneToOne: false
            referencedRelation: "player_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_comments_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "inbox_mentions"
            referencedColumns: ["play_id"]
          },
          {
            foreignKeyName: "public_comments_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "p_likes"
            referencedColumns: ["play_id"]
          },
          {
            foreignKeyName: "public_comments_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "plays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_comments_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "transition_mention_view"
            referencedColumns: ["play_id"]
          },
          {
            foreignKeyName: "public_comments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      play_comments: {
        Row: {
          comment_id: string
          id: string
          play_id: string
          viewed_by_author: boolean
        }
        Insert: {
          comment_id?: string
          id?: string
          play_id?: string
          viewed_by_author?: boolean
        }
        Update: {
          comment_id?: string
          id?: string
          play_id?: string
          viewed_by_author?: boolean
        }
        Relationships: []
      }
      play_likes: {
        Row: {
          created_at: string
          play_id: string
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string
          play_id?: string
          user_id?: string
          user_name: string
        }
        Update: {
          created_at?: string
          play_id?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_play_likes_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "inbox_mentions"
            referencedColumns: ["play_id"]
          },
          {
            foreignKeyName: "public_play_likes_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "p_likes"
            referencedColumns: ["play_id"]
          },
          {
            foreignKeyName: "public_play_likes_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "plays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_play_likes_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "transition_mention_view"
            referencedColumns: ["play_id"]
          },
          {
            foreignKeyName: "public_play_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "inbox_mentions"
            referencedColumns: ["receiver_id"]
          },
          {
            foreignKeyName: "public_play_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "p_likes"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "public_play_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "player_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "public_play_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      play_mentions: {
        Row: {
          created_at: string
          id: string
          play_id: string
          receiver_id: string
          receiver_name: string
          sender_id: string
          sender_name: string
          viewed: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          play_id?: string
          receiver_id?: string
          receiver_name: string
          sender_id?: string
          sender_name: string
          viewed?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          play_id?: string
          receiver_id?: string
          receiver_name?: string
          sender_id?: string
          sender_name?: string
          viewed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "public_play_mentions2_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "inbox_mentions"
            referencedColumns: ["play_id"]
          },
          {
            foreignKeyName: "public_play_mentions2_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "p_likes"
            referencedColumns: ["play_id"]
          },
          {
            foreignKeyName: "public_play_mentions2_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "plays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_play_mentions2_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "transition_mention_view"
            referencedColumns: ["play_id"]
          },
          {
            foreignKeyName: "public_play_mentions2_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "affiliations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_play_mentions2_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "player_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_play_mentions2_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "affiliations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_play_mentions2_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "player_view"
            referencedColumns: ["id"]
          },
        ]
      }
      play_tags: {
        Row: {
          play_id: string
          tag_id: string
        }
        Insert: {
          play_id?: string
          tag_id?: string
        }
        Update: {
          play_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_play_tags_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "inbox_mentions"
            referencedColumns: ["play_id"]
          },
          {
            foreignKeyName: "public_play_tags_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "p_likes"
            referencedColumns: ["play_id"]
          },
          {
            foreignKeyName: "public_play_tags_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "plays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_play_tags_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "transition_mention_view"
            referencedColumns: ["play_id"]
          },
          {
            foreignKeyName: "public_play_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      plays: {
        Row: {
          author_id: string
          author_name: string
          author_role: string
          end_time: number
          exclusive_to: string | null
          highlight: boolean
          id: string
          note: string
          private: boolean
          start_time: number
          title: string
          video_id: string
        }
        Insert: {
          author_id: string
          author_name: string
          author_role: string
          end_time: number
          exclusive_to?: string | null
          highlight?: boolean
          id?: string
          note: string
          private?: boolean
          start_time: number
          title: string
          video_id: string
        }
        Update: {
          author_id?: string
          author_name?: string
          author_role?: string
          end_time?: number
          exclusive_to?: string | null
          highlight?: boolean
          id?: string
          note?: string
          private?: boolean
          start_time?: number
          title?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_plays_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "affiliations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_plays_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "player_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_plays_exclusive_to_fkey"
            columns: ["exclusive_to"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_plays_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "inbox_mentions"
            referencedColumns: ["video_id"]
          },
          {
            foreignKeyName: "public_plays_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "play_preview"
            referencedColumns: ["video_id"]
          },
          {
            foreignKeyName: "public_plays_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          email: string | null
          id: string
          join_date: string
          last_watched: string | null
          last_watched_time: number | null
          name: string | null
        }
        Insert: {
          email?: string | null
          id: string
          join_date?: string
          last_watched?: string | null
          last_watched_time?: number | null
          name?: string | null
        }
        Update: {
          email?: string | null
          id?: string
          join_date?: string
          last_watched?: string | null
          last_watched_time?: number | null
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_profiles_last_watched_fkey"
            columns: ["last_watched"]
            isOneToOne: false
            referencedRelation: "inbox_mentions"
            referencedColumns: ["video_id"]
          },
          {
            foreignKeyName: "public_profiles_last_watched_fkey"
            columns: ["last_watched"]
            isOneToOne: false
            referencedRelation: "play_preview"
            referencedColumns: ["video_id"]
          },
          {
            foreignKeyName: "public_profiles_last_watched_fkey"
            columns: ["last_watched"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          exclusive_to: string | null
          id: string
          private: boolean
          title: string
        }
        Insert: {
          exclusive_to?: string | null
          id?: string
          private?: boolean
          title: string
        }
        Update: {
          exclusive_to?: string | null
          id?: string
          private?: boolean
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_tags_exclusive_to_fkey"
            columns: ["exclusive_to"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_videos: {
        Row: {
          team_id: string
          uploaded_at: string
          video_id: string
        }
        Insert: {
          team_id?: string
          uploaded_at?: string
          video_id?: string
        }
        Update: {
          team_id?: string
          uploaded_at?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_team_videos_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_team_videos_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "inbox_mentions"
            referencedColumns: ["video_id"]
          },
          {
            foreignKeyName: "public_team_videos_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "play_preview"
            referencedColumns: ["video_id"]
          },
          {
            foreignKeyName: "public_team_videos_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          city: string
          division: string
          full_name: string
          id: string
          logo: string | null
          name: string
          owner: string | null
        }
        Insert: {
          city: string
          division: string
          full_name: string
          id?: string
          logo?: string | null
          name: string
          owner?: string | null
        }
        Update: {
          city?: string
          division?: string
          full_name?: string
          id?: string
          logo?: string | null
          name?: string
          owner?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "inbox_mentions"
            referencedColumns: ["receiver_id"]
          },
          {
            foreignKeyName: "teams_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "p_likes"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "teams_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "player_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "teams_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          division: string
          exclusive_to: string | null
          id: string
          link: string
          private: boolean
          season: string
          title: string
          tournament: string | null
          uploaded_at: string
          week: string | null
        }
        Insert: {
          division: string
          exclusive_to?: string | null
          id?: string
          link: string
          private?: boolean
          season: string
          title: string
          tournament?: string | null
          uploaded_at?: string
          week?: string | null
        }
        Update: {
          division?: string
          exclusive_to?: string | null
          id?: string
          link?: string
          private?: boolean
          season?: string
          title?: string
          tournament?: string | null
          uploaded_at?: string
          week?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_videos_exclusive_to_fkey"
            columns: ["exclusive_to"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      comment_notifications: {
        Row: {
          comment: string | null
          comment_author_name: string | null
          comment_id: string | null
          created_at: string | null
          highlight: boolean | null
          note: string | null
          play_author_id: string | null
          play_id: string | null
          play_title: string | null
          private: boolean | null
          start_time: number | null
          team_id: string | null
          video_id: string | null
          video_title: string | null
          viewed_by_author: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliations_user_id_fkey"
            columns: ["play_author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliations_user_id_fkey"
            columns: ["play_author_id"]
            isOneToOne: false
            referencedRelation: "inbox_mentions"
            referencedColumns: ["receiver_id"]
          },
          {
            foreignKeyName: "affiliations_user_id_fkey"
            columns: ["play_author_id"]
            isOneToOne: false
            referencedRelation: "p_likes"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "affiliations_user_id_fkey"
            columns: ["play_author_id"]
            isOneToOne: false
            referencedRelation: "player_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "public_comments_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "plays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_comments_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "inbox_mentions"
            referencedColumns: ["play_id"]
          },
          {
            foreignKeyName: "public_comments_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "p_likes"
            referencedColumns: ["play_id"]
          },
          {
            foreignKeyName: "public_comments_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "transition_mention_view"
            referencedColumns: ["play_id"]
          },
          {
            foreignKeyName: "public_comments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_plays_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_plays_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "inbox_mentions"
            referencedColumns: ["video_id"]
          },
          {
            foreignKeyName: "public_plays_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "play_preview"
            referencedColumns: ["video_id"]
          },
        ]
      }
      comment_transition_view: {
        Row: {
          comment: string | null
          comment_author: string | null
          comment_author_name: string | null
          comment_id: string | null
          created_at: string | null
          highlight: boolean | null
          note: string | null
          play_author: string | null
          play_id: string | null
          start_time: number | null
          team_id: string | null
          title: string | null
          video_id: string | null
          viewed_by_author: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "public_comments_comment_author_fkey"
            columns: ["comment_author"]
            isOneToOne: false
            referencedRelation: "affiliations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_comments_comment_author_fkey"
            columns: ["comment_author"]
            isOneToOne: false
            referencedRelation: "player_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_comments_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "plays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_comments_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "inbox_mentions"
            referencedColumns: ["play_id"]
          },
          {
            foreignKeyName: "public_comments_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "p_likes"
            referencedColumns: ["play_id"]
          },
          {
            foreignKeyName: "public_comments_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "transition_mention_view"
            referencedColumns: ["play_id"]
          },
          {
            foreignKeyName: "public_comments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_plays_author_id_fkey"
            columns: ["play_author"]
            isOneToOne: false
            referencedRelation: "affiliations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_plays_author_id_fkey"
            columns: ["play_author"]
            isOneToOne: false
            referencedRelation: "player_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_plays_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_plays_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "inbox_mentions"
            referencedColumns: ["video_id"]
          },
          {
            foreignKeyName: "public_plays_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "play_preview"
            referencedColumns: ["video_id"]
          },
        ]
      }
      inbox_mentions: {
        Row: {
          author_id: string | null
          author_name: string | null
          created_at: string | null
          highlight: boolean | null
          mention_id: string | null
          play_id: string | null
          play_title: string | null
          private: boolean | null
          receiver_id: string | null
          start_time: number | null
          team_id: string | null
          title: string | null
          video_id: string | null
          viewed: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_plays_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "affiliations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_plays_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "player_view"
            referencedColumns: ["id"]
          },
        ]
      }
      p_likes: {
        Row: {
          play_id: string | null
          profile_id: string | null
          user_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      play_preview: {
        Row: {
          author_id: string | null
          author_name: string | null
          end_time: number | null
          exclusive_to: string | null
          highlight: boolean | null
          link: string | null
          note: string | null
          play_title: string | null
          private: boolean | null
          start_time: number | null
          video_id: string | null
          video_title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliations_user_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliations_user_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "inbox_mentions"
            referencedColumns: ["receiver_id"]
          },
          {
            foreignKeyName: "affiliations_user_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "p_likes"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "affiliations_user_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "player_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "public_plays_exclusive_to_fkey"
            columns: ["exclusive_to"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      player_view: {
        Row: {
          email: string | null
          id: string | null
          join_date: string | null
          name: string | null
          number: number | null
          profile_id: string | null
          role: string | null
          team_id: string | null
          verified: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transition_mention_view: {
        Row: {
          author_id: string | null
          author_name: string | null
          created_at: string | null
          highlight: boolean | null
          mention_id: string | null
          play_id: string | null
          play_title: string | null
          receiver_name: string | null
          start_time: number | null
          team_id: string | null
          user_id: string | null
          video_id: string | null
          viewed: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "inbox_mentions"
            referencedColumns: ["receiver_id"]
          },
          {
            foreignKeyName: "affiliations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "p_likes"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "affiliations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "player_view"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "public_plays_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "affiliations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_plays_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "player_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_plays_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_plays_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "inbox_mentions"
            referencedColumns: ["video_id"]
          },
          {
            foreignKeyName: "public_plays_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "play_preview"
            referencedColumns: ["video_id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
