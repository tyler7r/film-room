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
          last_watched: string | null
          last_watched_time: number | null
          number: number | null
          role: string
          team_id: string
          user_id: string
          verified: boolean
        }
        Insert: {
          id?: string
          last_watched?: string | null
          last_watched_time?: number | null
          number?: number | null
          role?: string
          team_id: string
          user_id: string
          verified?: boolean
        }
        Update: {
          id?: string
          last_watched?: string | null
          last_watched_time?: number | null
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
            referencedRelation: "p_likes"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "affiliations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_affiliations_last_watched_fkey"
            columns: ["last_watched"]
            isOneToOne: false
            referencedRelation: "videos"
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
            referencedRelation: "p_likes"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "public_announcements_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          comment_id?: string
          created_at?: string
          user_id?: string
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
            referencedRelation: "comments"
            referencedColumns: ["id"]
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
        }
        Insert: {
          author_name: string
          comment: string
          comment_author?: string
          created_at?: string
          id?: string
          play_id?: string
          team_id?: string | null
        }
        Update: {
          author_name?: string
          comment?: string
          comment_author?: string
          created_at?: string
          id?: string
          play_id?: string
          team_id?: string | null
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
        }
        Insert: {
          comment_id?: string
          id?: string
          play_id?: string
        }
        Update: {
          comment_id?: string
          id?: string
          play_id?: string
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
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      play_mentions: {
        Row: {
          created_at: string
          play_id: string
          receiver_id: string
          receiver_name: string
          sender_id: string
          sender_name: string
        }
        Insert: {
          created_at?: string
          play_id?: string
          receiver_id?: string
          receiver_name: string
          sender_id?: string
          sender_name: string
        }
        Update: {
          created_at?: string
          play_id?: string
          receiver_id?: string
          receiver_name?: string
          sender_id?: string
          sender_name?: string
        }
        Relationships: [
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
            foreignKeyName: "public_play_mentions2_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "affiliations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_play_mentions2_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "affiliations"
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
          author_name: string
          author_role: string
          end_time: number
          highlight: boolean
          id: string
          note: string
          profile_id: string | null
          start_time: number
          team_id: string
          title: string
          video_id: string
        }
        Insert: {
          author_name: string
          author_role: string
          end_time: number
          highlight?: boolean
          id?: string
          note: string
          profile_id?: string | null
          start_time: number
          team_id: string
          title: string
          video_id: string
        }
        Update: {
          author_name?: string
          author_role?: string
          end_time?: number
          highlight?: boolean
          id?: string
          note?: string
          profile_id?: string | null
          start_time?: number
          team_id?: string
          title?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plays_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "p_likes"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "plays_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_plays_team_id_fkey"
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
        ]
      }
      profiles: {
        Row: {
          email: string | null
          id: string
          name: string | null
        }
        Insert: {
          email?: string | null
          id: string
          name?: string | null
        }
        Update: {
          email?: string | null
          id?: string
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
          exclusive_to: string | null
          team_id: string
          uploaded_at: string
          video_id: string
        }
        Insert: {
          exclusive_to?: string | null
          team_id?: string
          uploaded_at?: string
          video_id?: string
        }
        Update: {
          exclusive_to?: string | null
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
            referencedRelation: "p_likes"
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
