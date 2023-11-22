export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          id: number
          season: string | null
          team1_id: number
          team2_id: number
          tournament: string | null
          url: string | null
        }
        Insert: {
          id?: never
          season?: string | null
          team1_id: number
          team2_id: number
          tournament?: string | null
          url?: string | null
        }
        Update: {
          id?: never
          season?: string | null
          team1_id?: number
          team2_id?: number
          tournament?: string | null
          url?: string | null
        }
        Relationships: []
      }
      plays: {
        Row: {
          author: number
          game: number
          highlight: boolean
          id: number
          keywords: string[] | null
          note: string | null
          timestamp: string
        }
        Insert: {
          author: number
          game: number
          highlight?: boolean
          id?: never
          keywords?: string[] | null
          note?: string | null
          timestamp: string
        }
        Update: {
          author?: number
          game?: number
          highlight?: boolean
          id?: never
          keywords?: string[] | null
          note?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "plays_game_fkey"
            columns: ["game"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          role: string | null
          team_id: number | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          role?: string | null
          team_id?: number | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          role?: string | null
          team_id?: number | null
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
            foreignKeyName: "profiles_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          }
        ]
      }
      teams: {
        Row: {
          announcements: string[] | null
          city: string | null
          division: string | null
          id: number
          logo: string | null
          member_requests: string[] | null
          name: string | null
          next_opp: string | null
          owner: string | null
        }
        Insert: {
          announcements?: string[] | null
          city?: string | null
          division?: string | null
          id?: never
          logo?: string | null
          member_requests?: string[] | null
          name?: string | null
          next_opp?: string | null
          owner?: string | null
        }
        Update: {
          announcements?: string[] | null
          city?: string | null
          division?: string | null
          id?: never
          logo?: string | null
          member_requests?: string[] | null
          name?: string | null
          next_opp?: string | null
          owner?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
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
