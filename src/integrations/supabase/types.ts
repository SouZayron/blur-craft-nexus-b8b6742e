export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bingo_admins: {
        Row: {
          created_at: string
          id: string
          password: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          password: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          password?: string
          username?: string
        }
        Relationships: []
      }
      bingo_cards: {
        Row: {
          card_number: number
          created_at: string
          expires_at: string
          id: string
          marked_numbers: number[] | null
          numbers: number[]
          subtitle: string
          theme: string
          title: string
          user_name: string
          user_password: string | null
        }
        Insert: {
          card_number: number
          created_at?: string
          expires_at?: string
          id?: string
          marked_numbers?: number[] | null
          numbers: number[]
          subtitle?: string
          theme?: string
          title?: string
          user_name: string
          user_password?: string | null
        }
        Update: {
          card_number?: number
          created_at?: string
          expires_at?: string
          id?: string
          marked_numbers?: number[] | null
          numbers?: number[]
          subtitle?: string
          theme?: string
          title?: string
          user_name?: string
          user_password?: string | null
        }
        Relationships: []
      }
      bingo_games: {
        Row: {
          created_at: string
          game_type: Database["public"]["Enums"]["bingo_game_type"]
          id: string
          is_open: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          game_type?: Database["public"]["Enums"]["bingo_game_type"]
          id?: string
          is_open?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          game_type?: Database["public"]["Enums"]["bingo_game_type"]
          id?: string
          is_open?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      bingo_players: {
        Row: {
          created_at: string
          id: string
          password: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          password: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          password?: string
          username?: string
        }
        Relationships: []
      }
      bingo_selections: {
        Row: {
          block_index: number
          created_at: string
          game_id: string
          id: string
          player_id: string
        }
        Insert: {
          block_index: number
          created_at?: string
          game_id: string
          id?: string
          player_id: string
        }
        Update: {
          block_index?: number
          created_at?: string
          game_id?: string
          id?: string
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bingo_selections_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "bingo_games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bingo_selections_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "bingo_players"
            referencedColumns: ["id"]
          },
        ]
      }
      game_picks: {
        Row: {
          created_at: string
          id: string
          pick_value: string
          player_id: string
          room_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pick_value: string
          player_id: string
          room_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pick_value?: string
          player_id?: string
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_picks_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "game_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_picks_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "game_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      game_players: {
        Row: {
          created_at: string
          id: string
          is_approved: boolean
          name: string
          xat_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_approved?: boolean
          name: string
          xat_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_approved?: boolean
          name?: string
          xat_id?: string | null
        }
        Relationships: []
      }
      game_rooms: {
        Row: {
          created_at: string
          game_type: Database["public"]["Enums"]["game_room_type"]
          id: string
          is_open: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          game_type: Database["public"]["Enums"]["game_room_type"]
          id?: string
          is_open?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          game_type?: Database["public"]["Enums"]["game_room_type"]
          id?: string
          is_open?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      mixhits_selections: {
        Row: {
          app_name: string
          created_at: string
          id: string
          user_id: string
          user_name: string
        }
        Insert: {
          app_name: string
          created_at?: string
          id?: string
          user_id: string
          user_name: string
        }
        Update: {
          app_name?: string
          created_at?: string
          id?: string
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_bingo_cards: { Args: never; Returns: undefined }
    }
    Enums: {
      bingo_game_type: "pairs" | "sequences"
      game_room_type: "animals" | "invertidos" | "sequences"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      bingo_game_type: ["pairs", "sequences"],
      game_room_type: ["animals", "invertidos", "sequences"],
    },
  },
} as const
