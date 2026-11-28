export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      attribute_definitions: {
        Row: {
          code: string;
          created_at: string;
          description: string | null;
          id: string;
          name: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      banned_words: {
        Row: {
          word: string;
        };
        Insert: {
          word: string;
        };
        Update: {
          word?: string;
        };
        Relationships: [];
      };
      character_attributes: {
        Row: {
          attribute_id: string;
          character_id: string;
          created_at: string;
          id: string;
          updated_at: string;
          value: number;
        };
        Insert: {
          attribute_id: string;
          character_id: string;
          created_at?: string;
          id?: string;
          updated_at?: string;
          value?: number;
        };
        Update: {
          attribute_id?: string;
          character_id?: string;
          created_at?: string;
          id?: string;
          updated_at?: string;
          value?: number;
        };
        Relationships: [
          {
            foreignKeyName: "character_attributes_attribute_id_fkey";
            columns: ["attribute_id"];
            isOneToOne: false;
            referencedRelation: "attribute_definitions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "character_attributes_character_id_fkey";
            columns: ["character_id"];
            isOneToOne: false;
            referencedRelation: "characters";
            referencedColumns: ["id"];
          },
        ];
      };
      character_skills: {
        Row: {
          aliases: string[];
          character_id: string;
          created_at: string;
          icon: string | null;
          id: string;
          last_practiced_at: string | null;
          name: string;
          primary_attribute_id: string | null;
          secondary_attribute_id: string | null;
          total_hours: number;
          total_xp: number;
        };
        Insert: {
          aliases?: string[];
          character_id: string;
          created_at?: string;
          icon?: string | null;
          id?: string;
          last_practiced_at?: string | null;
          name: string;
          primary_attribute_id?: string | null;
          secondary_attribute_id?: string | null;
          total_hours?: number;
          total_xp?: number;
        };
        Update: {
          aliases?: string[];
          character_id?: string;
          created_at?: string;
          icon?: string | null;
          id?: string;
          last_practiced_at?: string | null;
          name?: string;
          primary_attribute_id?: string | null;
          secondary_attribute_id?: string | null;
          total_hours?: number;
          total_xp?: number;
        };
        Relationships: [
          {
            foreignKeyName: "character_skills_character_id_fkey";
            columns: ["character_id"];
            isOneToOne: false;
            referencedRelation: "characters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "character_skills_primary_attribute_id_fkey";
            columns: ["primary_attribute_id"];
            isOneToOne: false;
            referencedRelation: "attribute_definitions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "character_skills_secondary_attribute_id_fkey";
            columns: ["secondary_attribute_id"];
            isOneToOne: false;
            referencedRelation: "attribute_definitions";
            referencedColumns: ["id"];
          },
        ];
      };
      character_snapshots: {
        Row: {
          aspect: string | null;
          attributes: Json;
          character_id: string;
          created_at: string;
          id: string;
          level: number;
          relics: Json;
          skills_count: number;
          snapshot_date: string;
          streak: number;
          tier: number;
          top_skills: Json;
          total_xp: number;
          updated_at: string;
        };
        Insert: {
          aspect?: string | null;
          attributes: Json;
          character_id: string;
          created_at?: string;
          id?: string;
          level: number;
          relics?: Json;
          skills_count?: number;
          snapshot_date: string;
          streak?: number;
          tier: number;
          top_skills?: Json;
          total_xp: number;
          updated_at?: string;
        };
        Update: {
          aspect?: string | null;
          attributes?: Json;
          character_id?: string;
          created_at?: string;
          id?: string;
          level?: number;
          relics?: Json;
          skills_count?: number;
          snapshot_date?: string;
          streak?: number;
          tier?: number;
          top_skills?: Json;
          total_xp?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "character_snapshots_character_id_fkey";
            columns: ["character_id"];
            isOneToOne: false;
            referencedRelation: "characters";
            referencedColumns: ["id"];
          },
        ];
      };
      characters: {
        Row: {
          class: string | null;
          created_at: string;
          id: string;
          level: number;
          name: string;
          profile_id: string;
          total_xp: number;
          updated_at: string;
        };
        Insert: {
          class?: string | null;
          created_at?: string;
          id?: string;
          level?: number;
          name: string;
          profile_id: string;
          total_xp?: number;
          updated_at?: string;
        };
        Update: {
          class?: string | null;
          created_at?: string;
          id?: string;
          level?: number;
          name?: string;
          profile_id?: string;
          total_xp?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "characters_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      daily_plans: {
        Row: {
          character_id: string;
          created_at: string;
          date: string;
          id: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          character_id: string;
          created_at?: string;
          date: string;
          id?: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          character_id?: string;
          created_at?: string;
          date?: string;
          id?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "daily_plans_character_id_fkey";
            columns: ["character_id"];
            isOneToOne: false;
            referencedRelation: "characters";
            referencedColumns: ["id"];
          },
        ];
      };
      daily_reports: {
        Row: {
          character_id: string;
          content: string;
          created_at: string;
          date: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          character_id: string;
          content: string;
          created_at?: string;
          date: string;
          id?: string;
          updated_at?: string;
        };
        Update: {
          character_id?: string;
          content?: string;
          created_at?: string;
          date?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "daily_reports_character_id_fkey";
            columns: ["character_id"];
            isOneToOne: false;
            referencedRelation: "characters";
            referencedColumns: ["id"];
          },
        ];
      };
      daily_states: {
        Row: {
          character_id: string;
          created_at: string;
          date: string;
          energy: number;
          fatigue: number;
          focus: number;
          id: string;
          mood: number;
          updated_at: string;
        };
        Insert: {
          character_id: string;
          created_at?: string;
          date: string;
          energy?: number;
          fatigue?: number;
          focus?: number;
          id?: string;
          mood?: number;
          updated_at?: string;
        };
        Update: {
          character_id?: string;
          created_at?: string;
          date?: string;
          energy?: number;
          fatigue?: number;
          focus?: number;
          id?: string;
          mood?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "daily_states_character_id_fkey";
            columns: ["character_id"];
            isOneToOne: false;
            referencedRelation: "characters";
            referencedColumns: ["id"];
          },
        ];
      };
      day_plan_applications: {
        Row: {
          created_at: string;
          parse_id: string;
          plan_date: string;
          result: Json | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          parse_id: string;
          plan_date: string;
          result?: Json | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          parse_id?: string;
          plan_date?: string;
          result?: Json | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "day_plan_applications_parse_id_fkey";
            columns: ["parse_id"];
            isOneToOne: true;
            referencedRelation: "day_plan_parses";
            referencedColumns: ["id"];
          },
        ];
      };
      day_plan_parses: {
        Row: {
          attempt: number;
          created_at: string;
          error_message: string | null;
          id: string;
          input_text: string;
          latency_ms: number | null;
          model: string;
          parsed_items: Json | null;
          plan_date: string;
          raw_output: Json | null;
          status: string;
          usage: Json | null;
          user_id: string;
        };
        Insert: {
          attempt?: number;
          created_at?: string;
          error_message?: string | null;
          id?: string;
          input_text: string;
          latency_ms?: number | null;
          model: string;
          parsed_items?: Json | null;
          plan_date: string;
          raw_output?: Json | null;
          status: string;
          usage?: Json | null;
          user_id: string;
        };
        Update: {
          attempt?: number;
          created_at?: string;
          error_message?: string | null;
          id?: string;
          input_text?: string;
          latency_ms?: number | null;
          model?: string;
          parsed_items?: Json | null;
          plan_date?: string;
          raw_output?: Json | null;
          status?: string;
          usage?: Json | null;
          user_id?: string;
        };
        Relationships: [];
      };
      day_report_applications: {
        Row: {
          created_at: string;
          parse_id: string;
          report_date: string;
          result: Json | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          parse_id: string;
          report_date: string;
          result?: Json | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          parse_id?: string;
          report_date?: string;
          result?: Json | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "day_report_applications_parse_id_fkey";
            columns: ["parse_id"];
            isOneToOne: true;
            referencedRelation: "day_report_parses";
            referencedColumns: ["id"];
          },
        ];
      };
      day_report_parses: {
        Row: {
          attempt: number;
          created_at: string;
          error_message: string | null;
          id: string;
          input_text: string;
          latency_ms: number | null;
          model: string;
          parsed_events: Json | null;
          raw_output: Json | null;
          report_date: string;
          status: string;
          usage: Json | null;
          user_id: string;
        };
        Insert: {
          attempt?: number;
          created_at?: string;
          error_message?: string | null;
          id?: string;
          input_text: string;
          latency_ms?: number | null;
          model: string;
          parsed_events?: Json | null;
          raw_output?: Json | null;
          report_date: string;
          status: string;
          usage?: Json | null;
          user_id: string;
        };
        Update: {
          attempt?: number;
          created_at?: string;
          error_message?: string | null;
          id?: string;
          input_text?: string;
          latency_ms?: number | null;
          model?: string;
          parsed_events?: Json | null;
          raw_output?: Json | null;
          report_date?: string;
          status?: string;
          usage?: Json | null;
          user_id?: string;
        };
        Relationships: [];
      };
      event_impacts: {
        Row: {
          attribute_id: string | null;
          created_at: string;
          id: string;
          report_event_id: string;
          skill_id: string | null;
          value: number;
        };
        Insert: {
          attribute_id?: string | null;
          created_at?: string;
          id?: string;
          report_event_id: string;
          skill_id?: string | null;
          value: number;
        };
        Update: {
          attribute_id?: string | null;
          created_at?: string;
          id?: string;
          report_event_id?: string;
          skill_id?: string | null;
          value?: number;
        };
        Relationships: [
          {
            foreignKeyName: "event_impacts_attribute_id_fkey";
            columns: ["attribute_id"];
            isOneToOne: false;
            referencedRelation: "attribute_definitions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_impacts_report_event_id_fkey";
            columns: ["report_event_id"];
            isOneToOne: false;
            referencedRelation: "report_events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_impacts_skill_id_fkey";
            columns: ["skill_id"];
            isOneToOne: false;
            referencedRelation: "skills";
            referencedColumns: ["id"];
          },
        ];
      };
      friendships: {
        Row: {
          created_at: string;
          created_by: string;
          user_high: string;
          user_low: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          user_high: string;
          user_low: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          user_high?: string;
          user_low?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          day_start_time: string;
          display_name: string | null;
          friend_code: string;
          id: string;
          onboarding_completed: boolean;
          share_daily_summary: boolean;
          timezone: string | null;
          updated_at: string;
          username: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          day_start_time?: string;
          display_name?: string | null;
          friend_code?: string;
          id: string;
          onboarding_completed?: boolean;
          share_daily_summary?: boolean;
          timezone?: string | null;
          updated_at?: string;
          username?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          day_start_time?: string;
          display_name?: string | null;
          friend_code?: string;
          id?: string;
          onboarding_completed?: boolean;
          share_daily_summary?: boolean;
          timezone?: string | null;
          updated_at?: string;
          username?: string | null;
        };
        Relationships: [];
      };
      quests: {
        Row: {
          attribute_id: string | null;
          created_at: string;
          daily_plan_id: string;
          description: string | null;
          duration_minutes: number | null;
          hours: number | null;
          id: string;
          planned_at: string;
          position: number;
          scheduled_at: string;
          skill_id: string | null;
          skill_name: string | null;
          source: string;
          start_time: string | null;
          status: string;
          title: string;
          updated_at: string;
          xp_reward: number;
        };
        Insert: {
          attribute_id?: string | null;
          created_at?: string;
          daily_plan_id: string;
          description?: string | null;
          duration_minutes?: number | null;
          hours?: number | null;
          id?: string;
          planned_at?: string;
          position?: number;
          scheduled_at?: string;
          skill_id?: string | null;
          skill_name?: string | null;
          source?: string;
          start_time?: string | null;
          status?: string;
          title: string;
          updated_at?: string;
          xp_reward?: number;
        };
        Update: {
          attribute_id?: string | null;
          created_at?: string;
          daily_plan_id?: string;
          description?: string | null;
          duration_minutes?: number | null;
          hours?: number | null;
          id?: string;
          planned_at?: string;
          position?: number;
          scheduled_at?: string;
          skill_id?: string | null;
          skill_name?: string | null;
          source?: string;
          start_time?: string | null;
          status?: string;
          title?: string;
          updated_at?: string;
          xp_reward?: number;
        };
        Relationships: [
          {
            foreignKeyName: "quests_attribute_id_fkey";
            columns: ["attribute_id"];
            isOneToOne: false;
            referencedRelation: "attribute_definitions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quests_daily_plan_id_fkey";
            columns: ["daily_plan_id"];
            isOneToOne: false;
            referencedRelation: "daily_plans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quests_skill_id_fkey";
            columns: ["skill_id"];
            isOneToOne: false;
            referencedRelation: "character_skills";
            referencedColumns: ["id"];
          },
        ];
      };
      report_events: {
        Row: {
          created_at: string;
          daily_report_id: string;
          description: string;
          id: string;
          type: string;
        };
        Insert: {
          created_at?: string;
          daily_report_id: string;
          description: string;
          id?: string;
          type: string;
        };
        Update: {
          created_at?: string;
          daily_report_id?: string;
          description?: string;
          id?: string;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "report_events_daily_report_id_fkey";
            columns: ["daily_report_id"];
            isOneToOne: false;
            referencedRelation: "daily_reports";
            referencedColumns: ["id"];
          },
        ];
      };
      skills: {
        Row: {
          code: string;
          created_at: string;
          description: string | null;
          id: string;
          name: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      xp_transactions: {
        Row: {
          amount: number;
          character_id: string;
          created_at: string;
          id: string;
          reason: string | null;
          report_event_id: string | null;
          skill_id: string | null;
        };
        Insert: {
          amount: number;
          character_id: string;
          created_at?: string;
          id?: string;
          reason?: string | null;
          report_event_id?: string | null;
          skill_id?: string | null;
        };
        Update: {
          amount?: number;
          character_id?: string;
          created_at?: string;
          id?: string;
          reason?: string | null;
          report_event_id?: string | null;
          skill_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "xp_transactions_character_id_fkey";
            columns: ["character_id"];
            isOneToOne: false;
            referencedRelation: "characters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "xp_transactions_report_event_id_fkey";
            columns: ["report_event_id"];
            isOneToOne: false;
            referencedRelation: "report_events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "xp_transactions_skill_id_fkey";
            columns: ["skill_id"];
            isOneToOne: false;
            referencedRelation: "skills";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      _are_friends: { Args: { p_a: string; p_b: string }; Returns: boolean };
      _check_character_name: { Args: { p_name: string }; Returns: string };
      _check_quest_fields: {
        Args: { p_duration_minutes: number; p_title: string };
        Returns: string;
      };
      _complete_quest_core: {
        Args: { p_character_id: string; p_quest_id: string; p_skill_id: string };
        Returns: Json;
      };
      _current_character_id: { Args: never; Returns: string };
      _day_summary: {
        Args: { p_character_id: string; p_date: string };
        Returns: Json;
      };
      _ensure_daily_plan: {
        Args: { p_character_id: string; p_date: string };
        Returns: string;
      };
      _find_skill_by_name: {
        Args: { p_character_id: string; p_name: string };
        Returns: {
          skill_id: string;
          skill_name: string;
        }[];
      };
      _friend_card: { Args: { p_user_id: string }; Returns: Json };
      _new_friend_code: { Args: never; Returns: string };
      _normalize_name_for_ban: { Args: { p_text: string }; Returns: string };
      _normalize_skill_name: { Args: { p_name: string }; Returns: string };
      _own_skill_name: {
        Args: { p_character_id: string; p_skill_id: string };
        Returns: string;
      };
      _resolve_event_skill: {
        Args: { p_character_id: string; p_invalid_code: string; p_skill: Json };
        Returns: {
          codes: string[];
          created: boolean;
          icon: string;
          skill_id: string;
          skill_name: string;
        }[];
      };
      _skill_level_for_xp: { Args: { p_xp: number }; Returns: number };
      _snapshot_aspect: { Args: { p_attributes: Json }; Returns: string };
      _snapshot_tier: { Args: { p_level: number }; Returns: number };
      _streak_info: {
        Args: { p_character_id: string; p_now?: string };
        Returns: Json;
      };
      _upsert_character_snapshot: {
        Args: { p_character_id: string; p_date: string };
        Returns: undefined;
      };
      _user_today: {
        Args: { p_now?: string; p_user_id: string };
        Returns: string;
      };
      add_friend_by_code: { Args: { p_code: string }; Returns: Json };
      apply_day_plan: {
        Args: { p_items: Json; p_parse_id: string; p_plan_date: string };
        Returns: Json;
      };
      apply_day_report: {
        Args: { p_events: Json; p_parse_id: string; p_report_date: string };
        Returns: Json;
      };
      calculate_quest_effects: {
        Args: { p_hours: number; p_skill_id: string };
        Returns: Json;
      };
      complete_onboarding: {
        Args: {
          p_character_name: string;
          p_class_id: string;
          p_local_date?: string;
          p_starting_directions: string[];
          p_username: string;
        };
        Returns: Json;
      };
      complete_quest: { Args: { p_quest_id: string }; Returns: Json };
      create_quest: {
        Args: {
          p_date: string;
          p_duration_minutes?: number;
          p_skill_id?: string;
          p_start_time?: string;
          p_title: string;
        };
        Returns: Json;
      };
      create_skill: {
        Args: { p_attributes: string[]; p_icon?: string; p_name: string };
        Returns: Json;
      };
      delete_quest: { Args: { p_quest_id: string }; Returns: Json };
      get_friend_profile: { Args: { p_friend_user_id: string }; Returns: Json };
      get_friends: { Args: never; Returns: Json };
      get_invite_preview: { Args: { p_code: string }; Returns: Json };
      get_my_friend_code: { Args: never; Returns: Json };
      get_my_streak: { Args: never; Returns: Json };
      get_or_create_daily_plan: { Args: { p_date: string }; Returns: Json };
      quest_counts_for_league: {
        Args: { p_quest_id: string };
        Returns: boolean;
      };
      regenerate_friend_code: { Args: never; Returns: Json };
      remove_friend: { Args: { p_friend_user_id: string }; Returns: Json };
      rename_character: { Args: { p_name: string }; Returns: Json };
      save_daily_report: {
        Args: { p_content: string; p_date: string };
        Returns: Json;
      };
      update_quest: {
        Args: {
          p_date: string;
          p_duration_minutes?: number;
          p_quest_id: string;
          p_skill_id?: string;
          p_start_time?: string;
          p_title: string;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
