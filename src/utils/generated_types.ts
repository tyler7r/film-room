export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      affiliations: {
        Row: {
          number: number | null;
          role: string;
          team_id: string;
          user_id: string;
          verified: boolean;
        };
        Insert: {
          number?: number | null;
          role?: string;
          team_id: string;
          user_id: string;
          verified?: boolean;
        };
        Update: {
          number?: number | null;
          role?: string;
          team_id?: string;
          user_id?: string;
          verified?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "affiliations_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "affiliations_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      announcements: {
        Row: {
          created_at: string;
          id: string;
          team_id: string | null;
          text: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          team_id?: string | null;
          text: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          team_id?: string | null;
          text?: string;
        };
        Relationships: [
          {
            foreignKeyName: "announcements_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      games: {
        Row: {
          id: string;
          link: string | null;
          one_id: string;
          season: string | null;
          tournament: string | null;
          two_id: string;
        };
        Insert: {
          id?: string;
          link?: string | null;
          one_id: string;
          season?: string | null;
          tournament?: string | null;
          two_id: string;
        };
        Update: {
          id?: string;
          link?: string | null;
          one_id?: string;
          season?: string | null;
          tournament?: string | null;
          two_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "games_one_id_fkey";
            columns: ["one_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "games_two_id_fkey";
            columns: ["two_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      play_mentions: {
        Row: {
          created_at: string;
          play_id: string;
          receiver_id: string;
          sender_id: string;
        };
        Insert: {
          created_at?: string;
          play_id: string;
          receiver_id: string;
          sender_id: string;
        };
        Update: {
          created_at?: string;
          play_id?: string;
          receiver_id?: string;
          sender_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "play_mentions_play_id_fkey";
            columns: ["play_id"];
            isOneToOne: false;
            referencedRelation: "plays";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "play_mentions_receiver_id_fkey";
            columns: ["receiver_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "play_mentions_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      plays: {
        Row: {
          author_id: string | null;
          game_id: string | null;
          highlight: boolean;
          id: string;
          note: string | null;
          team_id: string | null;
          timestamp: Json | null;
        };
        Insert: {
          author_id?: string | null;
          game_id?: string | null;
          highlight?: boolean;
          id?: string;
          note?: string | null;
          team_id?: string | null;
          timestamp?: Json | null;
        };
        Update: {
          author_id?: string | null;
          game_id?: string | null;
          highlight?: boolean;
          id?: string;
          note?: string | null;
          team_id?: string | null;
          timestamp?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "plays_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plays_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "games";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plays_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          email: string | null;
          id: string;
          name: string | null;
        };
        Insert: {
          email?: string | null;
          id: string;
          name?: string | null;
        };
        Update: {
          email?: string | null;
          id?: string;
          name?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      teams: {
        Row: {
          city: string;
          division: string;
          id: string;
          logo: string | null;
          name: string;
          owner: string | null;
        };
        Insert: {
          city: string;
          division: string;
          id?: string;
          logo?: string | null;
          name: string;
          owner?: string | null;
        };
        Update: {
          city?: string;
          division?: string;
          id?: string;
          logo?: string | null;
          name?: string;
          owner?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "teams_owner_fkey";
            columns: ["owner"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never;
