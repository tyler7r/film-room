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
          author_id: string
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
            foreignKeyName: "announcements_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_plays: {
        Row: {
          collection_id: string
          play_id: string
        }
        Insert: {
          collection_id?: string
          play_id?: string
        }
        Update: {
          collection_id?: string
          play_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_plays_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_plays_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "plays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_plays_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "transition_mention_view"
            referencedColumns: ["play_id"]
          },
        ]
      }
      collections: {
        Row: {
          author_id: string
          created_at: string
          description: string | null
          exclusive_to: string | null
          id: string
          private: boolean
          title: string
        }
        Insert: {
          author_id: string
          created_at?: string
          description?: string | null
          exclusive_to?: string | null
          id?: string
          private?: boolean
          title: string
        }
        Update: {
          author_id?: string
          created_at?: string
          description?: string | null
          exclusive_to?: string | null
          id?: string
          private?: boolean
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_exclusive_to_fkey"
            columns: ["exclusive_to"]
            isOneToOne: false
            referencedRelation: "teams"
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
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
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
          viewed: boolean
        }
        Insert: {
          author_name: string
          comment: string
          comment_author?: string
          created_at?: string
          id?: string
          play_id?: string
          viewed?: boolean
        }
        Update: {
          author_name?: string
          comment?: string
          comment_author?: string
          created_at?: string
          id?: string
          play_id?: string
          viewed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "comments_comment_author_fkey"
            columns: ["comment_author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "plays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "transition_mention_view"
            referencedColumns: ["play_id"]
          },
        ]
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
          receiver_name: string | null
          sender_id: string
          sender_name: string | null
          viewed: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          play_id?: string
          receiver_id?: string
          receiver_name?: string | null
          sender_id?: string
          sender_name?: string | null
          viewed?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          play_id?: string
          receiver_id?: string
          receiver_name?: string | null
          sender_id?: string
          sender_name?: string | null
          viewed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "play_mentions_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "play_mentions_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
          created_at: string
          end_time: number
          end_time_sort: string
          exclusive_to: string | null
          highlight: boolean
          id: string
          note: string | null
          private: boolean
          start_time: number
          start_time_sort: string
          title: string
          video_id: string
        }
        Insert: {
          author_id: string
          created_at?: string
          end_time: number
          end_time_sort: string
          exclusive_to?: string | null
          highlight?: boolean
          id?: string
          note?: string | null
          private?: boolean
          start_time: number
          start_time_sort: string
          title: string
          video_id: string
        }
        Update: {
          author_id?: string
          created_at?: string
          end_time?: number
          end_time_sort?: string
          exclusive_to?: string | null
          highlight?: boolean
          id?: string
          note?: string | null
          private?: boolean
          start_time?: number
          start_time_sort?: string
          title?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plays_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plays_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
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
      profiles: {
        Row: {
          email: string | null
          id: string
          join_date: string
          last_watched: string | null
          last_watched_time: number | null
          name: string
          send_notifications: boolean
        }
        Insert: {
          email?: string | null
          id: string
          join_date?: string
          last_watched?: string | null
          last_watched_time?: number | null
          name?: string
          send_notifications?: boolean
        }
        Update: {
          email?: string | null
          id?: string
          join_date?: string
          last_watched?: string | null
          last_watched_time?: number | null
          name?: string
          send_notifications?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      replies: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          reply: string
          reply_author: string
          reply_author_name: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          reply: string
          reply_author: string
          reply_author_name: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          reply?: string
          reply_author?: string
          reply_author_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "replies_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replies_reply_author_fkey"
            columns: ["reply_author"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          video_id: string
        }
        Insert: {
          team_id?: string
          video_id?: string
        }
        Update: {
          team_id?: string
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
            foreignKeyName: "team_videos_video_id_fkey"
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
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          author_id: string | null
          division: string
          duplicate_check: string
          exclusive_to: string | null
          id: string
          keywords: string
          link: string
          private: boolean
          season: string | null
          title: string
          tournament: string | null
          uploaded_at: string
          week: string | null
        }
        Insert: {
          author_id?: string | null
          division: string
          duplicate_check?: string
          exclusive_to?: string | null
          id?: string
          keywords: string
          link: string
          private?: boolean
          season?: string | null
          title: string
          tournament?: string | null
          uploaded_at?: string
          week?: string | null
        }
        Update: {
          author_id?: string | null
          division?: string
          duplicate_check?: string
          exclusive_to?: string | null
          id?: string
          keywords?: string
          link?: string
          private?: boolean
          season?: string | null
          title?: string
          tournament?: string | null
          uploaded_at?: string
          week?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "videos_exclusive_to_fkey"
            columns: ["exclusive_to"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      collection_plays_view: {
        Row: {
          author: Json | null
          collection: Json | null
          play: Json | null
          video: Json | null
        }
        Relationships: []
      }
      collection_view: {
        Row: {
          collection: Json | null
          profile: Json | null
          team: Json | null
        }
        Relationships: []
      }
      comment_notification: {
        Row: {
          author: Json | null
          comment: Json | null
          play: Json | null
          video: Json | null
        }
        Relationships: []
      }
      first_transition_reply_notification: {
        Row: {
          comment: Json | null
          comment_author: string | null
          play_id: string | null
          reply: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_comment_author_fkey"
            columns: ["comment_author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "plays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_play_id_fkey"
            columns: ["play_id"]
            isOneToOne: false
            referencedRelation: "transition_mention_view"
            referencedColumns: ["play_id"]
          },
        ]
      }
      last_watched_view: {
        Row: {
          profile: Json | null
          video: Json | null
        }
        Relationships: []
      }
      mention_notification: {
        Row: {
          author: Json | null
          mention: Json | null
          play: Json | null
          team: Json | null
          video: Json | null
        }
        Relationships: []
      }
      play_mention_view: {
        Row: {
          play: Json | null
          receiver: Json | null
          sender: Json | null
        }
        Relationships: []
      }
      play_preview: {
        Row: {
          author: Json | null
          play: Json | null
          team: Json | null
          video: Json | null
        }
        Relationships: []
      }
      plays_via_tag: {
        Row: {
          author: Json | null
          play: Json | null
          tag: Json | null
          team: Json | null
          video: Json | null
        }
        Relationships: []
      }
      plays_via_user_mention: {
        Row: {
          author: Json | null
          mention: Json | null
          play: Json | null
          team: Json | null
          video: Json | null
        }
        Relationships: []
      }
      team_video_view: {
        Row: {
          team: Json | null
          video: Json | null
        }
        Relationships: []
      }
      transition_comment_notification: {
        Row: {
          author: Json | null
          comment: Json | null
          play: Json | null
          video_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plays_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      transition_mention_view: {
        Row: {
          author_id: string | null
          created_at: string | null
          end_time: number | null
          highlight: boolean | null
          mention_id: string | null
          play_id: string | null
          play_title: string | null
          receiver_id: string | null
          receiver_name: string | null
          start_time: number | null
          video_id: string | null
          viewed: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "play_mentions_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plays_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plays_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      transition_plays_via_collection: {
        Row: {
          author: string | null
          collection: Json | null
          play: Json | null
          video_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plays_author_id_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plays_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      transition_plays_via_tag: {
        Row: {
          author: string | null
          play: Json | null
          tag: Json | null
          team_id: string | null
          video_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plays_author_id_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plays_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_plays_exclusive_to_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      transition_plays_via_user_mention: {
        Row: {
          author: Json | null
          mention: Json | null
          play: Json | null
          team_id: string | null
          video_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plays_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_plays_exclusive_to_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      user_teams: {
        Row: {
          affiliations: Json | null
          team: Json | null
        }
        Relationships: []
      }
      user_view: {
        Row: {
          affiliation: Json | null
          profile: Json | null
          team: Json | null
        }
        Relationships: []
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
