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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      fraud_alerts: {
        Row: {
          alert_type: string
          created_at: string
          description: string
          detected_at: string
          id: string
          is_resolved: boolean | null
          post_id: string
          resolved_at: string | null
          severity: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string
          description: string
          detected_at?: string
          id?: string
          is_resolved?: boolean | null
          post_id: string
          resolved_at?: string | null
          severity?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string
          description?: string
          detected_at?: string
          id?: string
          is_resolved?: boolean | null
          post_id?: string
          resolved_at?: string | null
          severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fraud_alerts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          base_pay: number | null
          bonus_multiplier: number | null
          comments_count: number | null
          created_at: string
          description: string | null
          duration: number | null
          freeze_reason: string | null
          id: string
          is_frozen: boolean | null
          likes_count: number | null
          posted_at: string
          saves_count: number | null
          shares_count: number | null
          thumbnail_url: string | null
          title: string
          total_earnings: number | null
          updated_at: string
          user_id: string
          video_url: string
          views_count: number | null
        }
        Insert: {
          base_pay?: number | null
          bonus_multiplier?: number | null
          comments_count?: number | null
          created_at?: string
          description?: string | null
          duration?: number | null
          freeze_reason?: string | null
          id?: string
          is_frozen?: boolean | null
          likes_count?: number | null
          posted_at?: string
          saves_count?: number | null
          shares_count?: number | null
          thumbnail_url?: string | null
          title: string
          total_earnings?: number | null
          updated_at?: string
          user_id: string
          video_url: string
          views_count?: number | null
        }
        Update: {
          base_pay?: number | null
          bonus_multiplier?: number | null
          comments_count?: number | null
          created_at?: string
          description?: string | null
          duration?: number | null
          freeze_reason?: string | null
          id?: string
          is_frozen?: boolean | null
          likes_count?: number | null
          posted_at?: string
          saves_count?: number | null
          shares_count?: number | null
          thumbnail_url?: string | null
          title?: string
          total_earnings?: number | null
          updated_at?: string
          user_id?: string
          video_url?: string
          views_count?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          followers_count: number | null
          following_count: number | null
          id: string
          total_earnings: number | null
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name: string
          followers_count?: number | null
          following_count?: number | null
          id?: string
          total_earnings?: number | null
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          followers_count?: number | null
          following_count?: number | null
          id?: string
          total_earnings?: number | null
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      quality_assessments: {
        Row: {
          assessed_at: string
          created_at: string
          engagement_score: number | null
          id: string
          is_final: boolean | null
          originality_score: boolean | null
          overall_grade: string | null
          post_id: string
          video_quality_score: string | null
        }
        Insert: {
          assessed_at?: string
          created_at?: string
          engagement_score?: number | null
          id?: string
          is_final?: boolean | null
          originality_score?: boolean | null
          overall_grade?: string | null
          post_id: string
          video_quality_score?: string | null
        }
        Update: {
          assessed_at?: string
          created_at?: string
          engagement_score?: number | null
          id?: string
          is_final?: boolean | null
          originality_score?: boolean | null
          overall_grade?: string | null
          post_id?: string
          video_quality_score?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quality_assessments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weekly_earnings: {
        Row: {
          base_earnings: number | null
          bonus_earnings: number | null
          created_at: string
          id: string
          post_id: string
          total_earnings: number | null
          week_end: string
          week_start: string
        }
        Insert: {
          base_earnings?: number | null
          bonus_earnings?: number | null
          created_at?: string
          id?: string
          post_id: string
          total_earnings?: number | null
          week_end: string
          week_start: string
        }
        Update: {
          base_earnings?: number | null
          bonus_earnings?: number | null
          created_at?: string
          id?: string
          post_id?: string
          total_earnings?: number | null
          week_end?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_earnings_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "user"
        | "fraud_detector"
        | "moderator"
        | "originality_detector"
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
      app_role: [
        "admin",
        "user",
        "fraud_detector",
        "moderator",
        "originality_detector",
      ],
    },
  },
} as const
