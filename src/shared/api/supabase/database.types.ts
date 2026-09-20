export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      characters: {
        Row: {
          id: string;
          profile_id: string;
          name: string;
          class: string;
          level: number;
          total_xp: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          name: string;
          class: string;
          level?: number;
          total_xp?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          name?: string;
          class?: string;
          level?: number;
          total_xp?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "characters_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      attribute_definitions: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      character_attributes: {
        Row: {
          id: string;
          character_id: string;
          attribute_id: string;
          value: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          character_id: string;
          attribute_id: string;
          value?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          character_id?: string;
          attribute_id?: string;
          value?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "character_attributes_character_id_fkey";
            columns: ["character_id"];
            isOneToOne: false;
            referencedRelation: "characters";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "character_attributes_attribute_id_fkey";
            columns: ["attribute_id"];
            isOneToOne: false;
            referencedRelation: "attribute_definitions";
            referencedColumns: ["id"];
          },
        ];
      };
      character_skills: {
        Row: {
          id: string;
          character_id: string;
          name: string;
          total_hours: number;
          total_xp: number;
          last_practiced_at: string | null;
          primary_attribute_id: string | null;
          secondary_attribute_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          character_id: string;
          name: string;
          total_hours?: number;
          total_xp?: number;
          last_practiced_at?: string | null;
          primary_attribute_id?: string | null;
          secondary_attribute_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          character_id?: string;
          name?: string;
          total_hours?: number;
          total_xp?: number;
          last_practiced_at?: string | null;
          primary_attribute_id?: string | null;
          secondary_attribute_id?: string | null;
          created_at?: string;
          updated_at?: string;
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
      daily_plans: {
        Row: {
          id: string;
          character_id: string;
          date: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          character_id: string;
          date: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          character_id?: string;
          date?: string;
          status?: string;
          created_at?: string;
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
      quests: {
        Row: {
          id: string;
          daily_plan_id: string;
          title: string;
          description: string | null;
          status: string;
          position: number;
          xp_reward: number;
          attribute_id: string | null;
          skill_name: string | null;
          hours: number | null;
          skill_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          daily_plan_id: string;
          title: string;
          description?: string | null;
          status?: string;
          position?: number;
          xp_reward?: number;
          attribute_id?: string | null;
          skill_name?: string | null;
          hours?: number | null;
          skill_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          daily_plan_id?: string;
          title?: string;
          description?: string | null;
          status?: string;
          position?: number;
          xp_reward?: number;
          attribute_id?: string | null;
          skill_name?: string | null;
          hours?: number | null;
          skill_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
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
      daily_reports: {
        Row: {
          id: string;
          character_id: string;
          date: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          character_id: string;
          date: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          character_id?: string;
          date?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      report_events: {
        Row: {
          id: string;
          daily_report_id: string;
          type: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          daily_report_id: string;
          type: string;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          daily_report_id?: string;
          type?: string;
          description?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      event_impacts: {
        Row: {
          id: string;
          report_event_id: string;
          attribute_id: string | null;
          skill_id: string | null;
          value: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          report_event_id: string;
          attribute_id?: string | null;
          skill_id?: string | null;
          value: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          report_event_id?: string;
          attribute_id?: string | null;
          skill_id?: string | null;
          value?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      xp_transactions: {
        Row: {
          id: string;
          character_id: string;
          amount: number;
          reason: string;
          created_at: string;
          report_event_id: string | null;
        };
        Insert: {
          id?: string;
          character_id: string;
          amount: number;
          reason: string;
          created_at?: string;
          report_event_id?: string | null;
        };
        Update: {
          id?: string;
          character_id?: string;
          amount?: number;
          reason?: string;
          created_at?: string;
          report_event_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "xp_transactions_report_event_id_fkey";
            columns: ["report_event_id"];
            isOneToOne: false;
            referencedRelation: "report_events";
            referencedColumns: ["id"];
          },
        ];
      };
      daily_states: {
        Row: {
          id: string;
          character_id: string;
          date: string;
          energy: number;
          fatigue: number;
          focus: number;
          mood: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          character_id: string;
          date: string;
          energy: number;
          fatigue: number;
          focus: number;
          mood: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          character_id?: string;
          date?: string;
          energy?: number;
          fatigue?: number;
          focus?: number;
          mood?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      calculate_quest_effects: {
        Args: {
          p_skill_id: string | null;
          p_hours: number | null;
        };
        Returns: Json;
      };
      complete_onboarding: {
        Args: {
          p_username: string;
          p_character_name: string;
          p_class_id: string;
          p_starting_directions: string[];
        };
        Returns: Json;
      };
      complete_quest: {
        Args: {
          p_quest_id: string;
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
