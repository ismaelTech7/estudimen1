export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          password_hash: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          password_hash: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          password_hash?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      api_keys: {
        Row: {
          id: string;
          user_id: string;
          provider: 'gemini' | 'openai';
          encrypted_key: string;
          key_prefix: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider: 'gemini' | 'openai';
          encrypted_key: string;
          key_prefix: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider?: 'gemini' | 'openai';
          encrypted_key?: string;
          key_prefix?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      study_plans: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          subjects: string[];
          exam_date: string;
          daily_hours: number;
          total_sessions: number;
          completed_sessions: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          subjects: string[];
          exam_date: string;
          daily_hours: number;
          total_sessions?: number;
          completed_sessions?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          subjects?: string[];
          exam_date?: string;
          daily_hours?: number;
          total_sessions?: number;
          completed_sessions?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          study_plan_id: string;
          title: string;
          description: string;
          subject: string;
          duration_minutes: number;
          scheduled_date: string;
          completed_at: string | null;
          score: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          study_plan_id: string;
          title: string;
          description: string;
          subject: string;
          duration_minutes: number;
          scheduled_date: string;
          completed_at?: string | null;
          score?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          study_plan_id?: string;
          title?: string;
          description?: string;
          subject?: string;
          duration_minutes?: number;
          scheduled_date?: string;
          completed_at?: string | null;
          score?: number | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      resources: {
        Row: {
          id: string;
          user_id: string;
          study_plan_id: string;
          type: 'summary' | 'flashcard' | 'quiz';
          title: string;
          content: string;
          metadata: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          study_plan_id: string;
          type: 'summary' | 'flashcard' | 'quiz';
          title: string;
          content: string;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          study_plan_id?: string;
          type?: 'summary' | 'flashcard' | 'quiz';
          title?: string;
          content?: string;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };
      flashcards: {
        Row: {
          id: string;
          user_id: string;
          study_plan_id: string;
          front: string;
          back: string;
          difficulty: 'easy' | 'medium' | 'hard';
          last_reviewed: string | null;
          review_count: number;
          correct_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          study_plan_id: string;
          front: string;
          back: string;
          difficulty: 'easy' | 'medium' | 'hard';
          last_reviewed?: string | null;
          review_count?: number;
          correct_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          study_plan_id?: string;
          front?: string;
          back?: string;
          difficulty?: 'easy' | 'medium' | 'hard';
          last_reviewed?: string | null;
          review_count?: number;
          correct_count?: number;
          created_at?: string;
        };
      };
      quizzes: {
        Row: {
          id: string;
          user_id: string;
          study_plan_id: string;
          title: string;
          questions: Database['public']['CompositeTypes']['quiz_question'][];
          time_limit_minutes: number;
          max_score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          study_plan_id: string;
          title: string;
          questions: Database['public']['CompositeTypes']['quiz_question'][];
          time_limit_minutes: number;
          max_score: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          study_plan_id?: string;
          title?: string;
          questions?: Database['public']['CompositeTypes']['quiz_question'][];
          time_limit_minutes?: number;
          max_score?: number;
          created_at?: string;
        };
      };
      quiz_attempts: {
        Row: {
          id: string;
          user_id: string;
          quiz_id: string;
          answers: number[];
          score: number;
          completed_at: string;
          time_spent_minutes: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          quiz_id: string;
          answers: number[];
          score: number;
          completed_at?: string;
          time_spent_minutes: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          quiz_id?: string;
          answers?: number[];
          score?: number;
          completed_at?: string;
          time_spent_minutes?: number;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'session_reminder' | 'goal_achievement' | 'study_streak';
          title: string;
          message: string;
          is_read: boolean;
          scheduled_for: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'session_reminder' | 'goal_achievement' | 'study_streak';
          title: string;
          message: string;
          is_read?: boolean;
          scheduled_for?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'session_reminder' | 'goal_achievement' | 'study_streak';
          title?: string;
          message?: string;
          is_read?: boolean;
          scheduled_for?: string | null;
          created_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          type: 'daily_study' | 'weekly_sessions' | 'exam_preparation';
          target_value: number;
          current_value: number;
          deadline: string;
          is_achieved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'daily_study' | 'weekly_sessions' | 'exam_preparation';
          target_value: number;
          current_value?: number;
          deadline: string;
          is_achieved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'daily_study' | 'weekly_sessions' | 'exam_preparation';
          target_value?: number;
          current_value?: number;
          deadline?: string;
          is_achieved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      refresh_tokens: {
        Row: {
          id: string;
          user_id: string;
          token: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token: string;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          token?: string;
          expires_at?: string;
          created_at?: string;
        };
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
      quiz_question: {
        id: string;
        question: string;
        options: string[];
        correct_answer: number;
        explanation: string;
      };
    };
  };
}