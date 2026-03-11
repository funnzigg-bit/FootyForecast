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
      admin_logs: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          details: Json | null
          id: string
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          details?: Json | null
          id?: string
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          details?: Json | null
          id?: string
        }
        Relationships: []
      }
      alert_deliveries: {
        Row: {
          alert_id: string
          channel: Database["public"]["Enums"]["alert_channel"]
          created_at: string
          delivered_at: string | null
          error_message: string | null
          id: string
          status: string | null
        }
        Insert: {
          alert_id: string
          channel: Database["public"]["Enums"]["alert_channel"]
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          status?: string | null
        }
        Update: {
          alert_id?: string
          channel?: Database["public"]["Enums"]["alert_channel"]
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alert_deliveries_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          alert_channel: Database["public"]["Enums"]["alert_channel"]
          confidence: Database["public"]["Enums"]["confidence_level"]
          created_at: string
          id: string
          match_id: string
          prediction_run_id: string | null
          probability_score: number
          reason: string | null
          result: Database["public"]["Enums"]["alert_result"] | null
          strategy_id: string | null
          user_id: string
        }
        Insert: {
          alert_channel: Database["public"]["Enums"]["alert_channel"]
          confidence: Database["public"]["Enums"]["confidence_level"]
          created_at?: string
          id?: string
          match_id: string
          prediction_run_id?: string | null
          probability_score: number
          reason?: string | null
          result?: Database["public"]["Enums"]["alert_result"] | null
          strategy_id?: string | null
          user_id: string
        }
        Update: {
          alert_channel?: Database["public"]["Enums"]["alert_channel"]
          confidence?: Database["public"]["Enums"]["confidence_level"]
          created_at?: string
          id?: string
          match_id?: string
          prediction_run_id?: string | null
          probability_score?: number
          reason?: string | null
          result?: Database["public"]["Enums"]["alert_result"] | null
          strategy_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_prediction_run_id_fkey"
            columns: ["prediction_run_id"]
            isOneToOne: false
            referencedRelation: "prediction_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      cached_predictions: {
        Row: {
          fetched_at: string
          id: string
          predictions_data: Json
        }
        Insert: {
          fetched_at?: string
          id?: string
          predictions_data?: Json
        }
        Update: {
          fetched_at?: string
          id?: string
          predictions_data?: Json
        }
        Relationships: []
      }
      leagues: {
        Row: {
          active: boolean | null
          country: string | null
          created_at: string
          id: string
          logo_url: string | null
          name: string
        }
        Insert: {
          active?: boolean | null
          country?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
        }
        Update: {
          active?: boolean | null
          country?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      live_match_stats: {
        Row: {
          away_corners: number | null
          away_dangerous_attacks: number | null
          away_possession: number | null
          away_red_cards: number | null
          away_shots: number | null
          away_shots_on_target: number | null
          away_xg: number | null
          away_yellow_cards: number | null
          created_at: string
          home_corners: number | null
          home_dangerous_attacks: number | null
          home_possession: number | null
          home_red_cards: number | null
          home_shots: number | null
          home_shots_on_target: number | null
          home_xg: number | null
          home_yellow_cards: number | null
          id: string
          match_id: string
          minute: number
          momentum_away: number | null
          momentum_home: number | null
        }
        Insert: {
          away_corners?: number | null
          away_dangerous_attacks?: number | null
          away_possession?: number | null
          away_red_cards?: number | null
          away_shots?: number | null
          away_shots_on_target?: number | null
          away_xg?: number | null
          away_yellow_cards?: number | null
          created_at?: string
          home_corners?: number | null
          home_dangerous_attacks?: number | null
          home_possession?: number | null
          home_red_cards?: number | null
          home_shots?: number | null
          home_shots_on_target?: number | null
          home_xg?: number | null
          home_yellow_cards?: number | null
          id?: string
          match_id: string
          minute: number
          momentum_away?: number | null
          momentum_home?: number | null
        }
        Update: {
          away_corners?: number | null
          away_dangerous_attacks?: number | null
          away_possession?: number | null
          away_red_cards?: number | null
          away_shots?: number | null
          away_shots_on_target?: number | null
          away_xg?: number | null
          away_yellow_cards?: number | null
          created_at?: string
          home_corners?: number | null
          home_dangerous_attacks?: number | null
          home_possession?: number | null
          home_red_cards?: number | null
          home_shots?: number | null
          home_shots_on_target?: number | null
          home_xg?: number | null
          home_yellow_cards?: number | null
          id?: string
          match_id?: string
          minute?: number
          momentum_away?: number | null
          momentum_home?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "live_match_stats_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          away_score: number | null
          away_team_id: string | null
          created_at: string
          current_minute: number | null
          home_score: number | null
          home_team_id: string | null
          id: string
          is_live: boolean | null
          league_id: string | null
          match_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          away_score?: number | null
          away_team_id?: string | null
          created_at?: string
          current_minute?: number | null
          home_score?: number | null
          home_team_id?: string | null
          id?: string
          is_live?: boolean | null
          league_id?: string | null
          match_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          away_score?: number | null
          away_team_id?: string | null
          created_at?: string
          current_minute?: number | null
          home_score?: number | null
          home_team_id?: string | null
          id?: string
          is_live?: boolean | null
          league_id?: string | null
          match_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      prediction_runs: {
        Row: {
          active_signals: string[] | null
          confidence: Database["public"]["Enums"]["confidence_level"]
          created_at: string
          factor_breakdown: Json | null
          id: string
          match_id: string
          probability_score: number
          raw_score: number
          reason_summary: string | null
          trigger_status: boolean | null
        }
        Insert: {
          active_signals?: string[] | null
          confidence: Database["public"]["Enums"]["confidence_level"]
          created_at?: string
          factor_breakdown?: Json | null
          id?: string
          match_id: string
          probability_score: number
          raw_score: number
          reason_summary?: string | null
          trigger_status?: boolean | null
        }
        Update: {
          active_signals?: string[] | null
          confidence?: Database["public"]["Enums"]["confidence_level"]
          created_at?: string
          factor_breakdown?: Json | null
          id?: string
          match_id?: string
          probability_score?: number
          raw_score?: number
          reason_summary?: string | null
          trigger_status?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "prediction_runs_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      strategies: {
        Row: {
          cooldown_minutes: number | null
          created_at: string
          favorite_trailing_only: boolean | null
          id: string
          is_active: boolean | null
          league_filters: string[] | null
          max_minute: number | null
          min_corners: number | null
          min_dangerous_attacks: number | null
          min_minute: number | null
          min_shots_on_target: number | null
          name: string
          probability_threshold: number | null
          require_red_card: boolean | null
          second_half_only: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cooldown_minutes?: number | null
          created_at?: string
          favorite_trailing_only?: boolean | null
          id?: string
          is_active?: boolean | null
          league_filters?: string[] | null
          max_minute?: number | null
          min_corners?: number | null
          min_dangerous_attacks?: number | null
          min_minute?: number | null
          min_shots_on_target?: number | null
          name: string
          probability_threshold?: number | null
          require_red_card?: boolean | null
          second_half_only?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cooldown_minutes?: number | null
          created_at?: string
          favorite_trailing_only?: boolean | null
          id?: string
          is_active?: boolean | null
          league_filters?: string[] | null
          max_minute?: number | null
          min_corners?: number | null
          min_dangerous_attacks?: number | null
          min_minute?: number | null
          min_shots_on_target?: number | null
          name?: string
          probability_threshold?: number | null
          require_red_card?: boolean | null
          second_half_only?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          plan: string | null
          started_at: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          plan?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          created_at: string
          id: string
          league_id: string | null
          logo_url: string | null
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          league_id?: string | null
          logo_url?: string | null
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          league_id?: string | null
          logo_url?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_connections: {
        Row: {
          chat_id: string | null
          connection_token: string
          created_at: string
          id: string
          is_connected: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          chat_id?: string | null
          connection_token: string
          created_at?: string
          id?: string
          is_connected?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          chat_id?: string | null
          connection_token?: string
          created_at?: string
          id?: string
          is_connected?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          alert_channel: Database["public"]["Enums"]["alert_channel"] | null
          alert_style: Database["public"]["Enums"]["alert_style"] | null
          created_at: string
          id: string
          preferred_leagues: string[] | null
          timezone: string | null
          updated_at: string
          user_id: string
          watchlist_leagues: string[] | null
        }
        Insert: {
          alert_channel?: Database["public"]["Enums"]["alert_channel"] | null
          alert_style?: Database["public"]["Enums"]["alert_style"] | null
          created_at?: string
          id?: string
          preferred_leagues?: string[] | null
          timezone?: string | null
          updated_at?: string
          user_id: string
          watchlist_leagues?: string[] | null
        }
        Update: {
          alert_channel?: Database["public"]["Enums"]["alert_channel"] | null
          alert_style?: Database["public"]["Enums"]["alert_style"] | null
          created_at?: string
          id?: string
          preferred_leagues?: string[] | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
          watchlist_leagues?: string[] | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      watchlists: {
        Row: {
          created_at: string
          id: string
          match_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlists_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      alert_channel: "telegram" | "email" | "both"
      alert_result: "goal_scored" | "no_goal" | "pending"
      alert_style: "conservative" | "balanced" | "aggressive"
      app_role: "admin" | "user"
      confidence_level: "low" | "medium" | "high" | "very_high"
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
      alert_channel: ["telegram", "email", "both"],
      alert_result: ["goal_scored", "no_goal", "pending"],
      alert_style: ["conservative", "balanced", "aggressive"],
      app_role: ["admin", "user"],
      confidence_level: ["low", "medium", "high", "very_high"],
    },
  },
} as const
