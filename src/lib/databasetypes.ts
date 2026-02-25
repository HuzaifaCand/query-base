export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      answers: {
        Row: {
          author_id: string;
          body_text: string | null;
          created_at: string | null;
          has_vn: boolean | null;
          id: string;
          is_official: boolean | null;
          query_id: string;
          updated_at: string | null;
        };
        Insert: {
          author_id: string;
          body_text?: string | null;
          created_at?: string | null;
          has_vn?: boolean | null;
          id?: string;
          is_official?: boolean | null;
          query_id: string;
          updated_at?: string | null;
        };
        Update: {
          author_id?: string;
          body_text?: string | null;
          created_at?: string | null;
          has_vn?: boolean | null;
          id?: string;
          is_official?: boolean | null;
          query_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "answers_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "student_stats";
            referencedColumns: ["student_id"];
          },
          {
            foreignKeyName: "answers_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "teacher_stats";
            referencedColumns: ["teacher_id"];
          },
          {
            foreignKeyName: "answers_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "answers_query_id_fkey";
            columns: ["query_id"];
            isOneToOne: false;
            referencedRelation: "queries";
            referencedColumns: ["id"];
          },
        ];
      };
      attachments: {
        Row: {
          answer_id: string | null;
          created_at: string | null;
          file_path: string;
          file_type: string;
          id: string;
          query_id: string | null;
        };
        Insert: {
          answer_id?: string | null;
          created_at?: string | null;
          file_path: string;
          file_type: string;
          id?: string;
          query_id?: string | null;
        };
        Update: {
          answer_id?: string | null;
          created_at?: string | null;
          file_path?: string;
          file_type?: string;
          id?: string;
          query_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "attachments_answer_id_fkey";
            columns: ["answer_id"];
            isOneToOne: false;
            referencedRelation: "answers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attachments_query_id_fkey";
            columns: ["query_id"];
            isOneToOne: false;
            referencedRelation: "queries";
            referencedColumns: ["id"];
          },
        ];
      };
      class_students: {
        Row: {
          class_id: string;
          id: string;
          joined_at: string | null;
          student_id: string;
        };
        Insert: {
          class_id: string;
          id?: string;
          joined_at?: string | null;
          student_id: string;
        };
        Update: {
          class_id?: string;
          id?: string;
          joined_at?: string | null;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "class_students_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "class_students_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student_stats";
            referencedColumns: ["student_id"];
          },
          {
            foreignKeyName: "class_students_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "teacher_stats";
            referencedColumns: ["teacher_id"];
          },
          {
            foreignKeyName: "class_students_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      class_teachers: {
        Row: {
          added_at: string | null;
          class_id: string;
          id: string;
          teacher_id: string;
        };
        Insert: {
          added_at?: string | null;
          class_id: string;
          id?: string;
          teacher_id: string;
        };
        Update: {
          added_at?: string | null;
          class_id?: string;
          id?: string;
          teacher_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "class_teachers_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "class_teachers_teacher_id_fkey";
            columns: ["teacher_id"];
            isOneToOne: false;
            referencedRelation: "student_stats";
            referencedColumns: ["student_id"];
          },
          {
            foreignKeyName: "class_teachers_teacher_id_fkey";
            columns: ["teacher_id"];
            isOneToOne: false;
            referencedRelation: "teacher_stats";
            referencedColumns: ["teacher_id"];
          },
          {
            foreignKeyName: "class_teachers_teacher_id_fkey";
            columns: ["teacher_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      classes: {
        Row: {
          class_code: string;
          created_at: string | null;
          created_by: string | null;
          id: string;
          is_active: boolean | null;
          level: string | null;
          name: string;
          subject: string | null;
          updated_at: string | null;
        };
        Insert: {
          class_code: string;
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          is_active?: boolean | null;
          level?: string | null;
          name: string;
          subject?: string | null;
          updated_at?: string | null;
        };
        Update: {
          class_code?: string;
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          is_active?: boolean | null;
          level?: string | null;
          name?: string;
          subject?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "classes_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "student_stats";
            referencedColumns: ["student_id"];
          },
          {
            foreignKeyName: "classes_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "teacher_stats";
            referencedColumns: ["teacher_id"];
          },
          {
            foreignKeyName: "classes_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      feedbacks: {
        Row: {
          author_id: string;
          author_role: string;
          created_at: string | null;
          description: string;
          id: string;
        };
        Insert: {
          author_id: string;
          author_role: string;
          created_at?: string | null;
          description: string;
          id?: string;
        };
        Update: {
          author_id?: string;
          author_role?: string;
          created_at?: string | null;
          description?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "feedbacks_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "student_stats";
            referencedColumns: ["student_id"];
          },
          {
            foreignKeyName: "feedbacks_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "teacher_stats";
            referencedColumns: ["teacher_id"];
          },
          {
            foreignKeyName: "feedbacks_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      queries: {
        Row: {
          answered_at: string | null;
          answered_by: string | null;
          class_id: string;
          created_at: string | null;
          description: string | null;
          featured_at: string | null;
          featured_note: string | null;
          has_vn: boolean | null;
          id: string;
          is_anonymous: boolean;
          is_featured: boolean;
          is_private: boolean | null;
          status: string | null;
          student_id: string;
          title: string | null;
          updated_at: string | null;
          view_count: number | null;
        };
        Insert: {
          answered_at?: string | null;
          answered_by?: string | null;
          class_id: string;
          created_at?: string | null;
          description?: string | null;
          featured_at?: string | null;
          featured_note?: string | null;
          has_vn?: boolean | null;
          id?: string;
          is_anonymous?: boolean;
          is_featured?: boolean;
          is_private?: boolean | null;
          status?: string | null;
          student_id: string;
          title?: string | null;
          updated_at?: string | null;
          view_count?: number | null;
        };
        Update: {
          answered_at?: string | null;
          answered_by?: string | null;
          class_id?: string;
          created_at?: string | null;
          description?: string | null;
          featured_at?: string | null;
          featured_note?: string | null;
          has_vn?: boolean | null;
          id?: string;
          is_anonymous?: boolean;
          is_featured?: boolean;
          is_private?: boolean | null;
          status?: string | null;
          student_id?: string;
          title?: string | null;
          updated_at?: string | null;
          view_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "queries_answered_by_fkey";
            columns: ["answered_by"];
            isOneToOne: false;
            referencedRelation: "student_stats";
            referencedColumns: ["student_id"];
          },
          {
            foreignKeyName: "queries_answered_by_fkey";
            columns: ["answered_by"];
            isOneToOne: false;
            referencedRelation: "teacher_stats";
            referencedColumns: ["teacher_id"];
          },
          {
            foreignKeyName: "queries_answered_by_fkey";
            columns: ["answered_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "queries_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "queries_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student_stats";
            referencedColumns: ["student_id"];
          },
          {
            foreignKeyName: "queries_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "teacher_stats";
            referencedColumns: ["teacher_id"];
          },
          {
            foreignKeyName: "queries_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      query_tags: {
        Row: {
          added_at: string | null;
          query_id: string;
          tag_id: string;
        };
        Insert: {
          added_at?: string | null;
          query_id: string;
          tag_id: string;
        };
        Update: {
          added_at?: string | null;
          query_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "query_tags_query_id_fkey";
            columns: ["query_id"];
            isOneToOne: false;
            referencedRelation: "queries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "query_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
        ];
      };
      resource_folders: {
        Row: {
          class_id: string;
          created_at: string | null;
          id: string;
          name: string;
          parent_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          class_id: string;
          created_at?: string | null;
          id?: string;
          name: string;
          parent_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          class_id?: string;
          created_at?: string | null;
          id?: string;
          name?: string;
          parent_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "resource_folders_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "resource_folders_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "resource_folders";
            referencedColumns: ["id"];
          },
        ];
      };
      resources: {
        Row: {
          class_id: string;
          content_category: string | null;
          created_at: string | null;
          file_format: string;
          file_path: string;
          folder_id: string | null;
          id: string;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          class_id: string;
          content_category?: string | null;
          created_at?: string | null;
          file_format: string;
          file_path: string;
          folder_id?: string | null;
          id?: string;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          class_id?: string;
          content_category?: string | null;
          created_at?: string | null;
          file_format?: string;
          file_path?: string;
          folder_id?: string | null;
          id?: string;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "resources_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "resources_folder_id_fkey";
            columns: ["folder_id"];
            isOneToOne: false;
            referencedRelation: "resource_folders";
            referencedColumns: ["id"];
          },
        ];
      };
      tags: {
        Row: {
          class_id: string;
          created_at: string | null;
          id: string;
          name: string;
        };
        Insert: {
          class_id: string;
          created_at?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          class_id?: string;
          created_at?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tags_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          created_at: string | null;
          email: string;
          full_name: string | null;
          id: string;
          role: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          full_name?: string | null;
          id: string;
          role?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          full_name?: string | null;
          id?: string;
          role?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      student_stats: {
        Row: {
          answers_received: number | null;
          full_name: string | null;
          queries_asked: number | null;
          student_id: string | null;
        };
        Relationships: [];
      };
      teacher_stats: {
        Row: {
          full_name: string | null;
          queries_resolved: number | null;
          teacher_id: string | null;
          total_unique_students: number | null;
        };
        Insert: {
          full_name?: string | null;
          queries_resolved?: never;
          teacher_id?: string | null;
          total_unique_students?: never;
        };
        Update: {
          full_name?: string | null;
          queries_resolved?: never;
          teacher_id?: string | null;
          total_unique_students?: never;
        };
        Relationships: [];
      };
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
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
