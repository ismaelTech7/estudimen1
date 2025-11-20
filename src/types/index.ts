// Tipos principales de Estudimen
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ApiKey {
  id: string;
  user_id: string;
  provider: 'gemini' | 'openai';
  encrypted_key: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudyPlan {
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
}

export type StudySessionStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export type ResourceType = 'summary' | 'flashcards' | 'quiz';

export interface StudySession {
  id: string;
  userId: string;
  studyPlanId: string;
  subject: string;
  objective: string;
  duration: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  completedAt: string | null;
  notes: string | null;
  studyPlan: {
    title: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id: string;
  user_id: string;
  study_plan_id: string;
  type: 'summary' | 'flashcard' | 'quiz';
  title: string;
  content: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Flashcard {
  id: string;
  resourceId: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed: string | null;
  reviewCount: number;
  correctCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Quiz {
  id: string;
  user_id: string;
  study_plan_id: string;
  title: string;
  questions: QuizQuestion[];
  time_limit_minutes: number;
  max_score: number;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  answers: number[];
  score: number;
  completed_at: string;
  time_spent_minutes: number;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'session_reminder' | 'goal_achievement' | 'study_streak';
  title: string;
  message: string;
  is_read: boolean;
  scheduled_for: string | null;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  type: 'daily_study' | 'weekly_sessions' | 'exam_preparation';
  target_value: number;
  current_value: number;
  deadline: string;
  is_achieved: boolean;
  created_at: string;
  updated_at: string;
}

// Tipos de autenticación
export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// Tipos de API
export interface CreateStudyPlanRequest {
  title: string;
  description: string;
  subjects: string[];
  exam_date: string;
  daily_hours: number;
}

export interface GenerateResourceRequest {
  study_plan_id: string;
  type: 'summary' | 'flashcard' | 'quiz';
  subject: string;
  content: string;
}

export interface ApiKeyRequest {
  provider: 'gemini' | 'openai';
  api_key: string;
}

// Tipos de respuesta de API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Tipos de plan de estudio con IA
export interface AIStudyPlan {
  sessions: AIStudySession[];
  total_hours: number;
  subjects_distribution: Record<string, number>;
}

export interface AIStudySession {
  title: string;
  description: string;
  subject: string;
  duration_minutes: number;
  scheduled_date: string;
  priority: 'high' | 'medium' | 'low';
}

// Tipos de recursos generados por IA
export interface AISummary {
  title: string;
  content: string;
  key_points: string[];
  estimated_reading_time: number;
}

export interface AIFlashcard {
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface AIQuiz {
  title: string;
  questions: QuizQuestion[];
  time_limit_minutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  max_score?: number;
}

// Tipos de progreso y analytics
export interface StudyProgress {
  total_sessions: number;
  completed_sessions: number;
  total_study_time: number;
  average_score: number;
  subjects_progress: Record<string, SubjectProgress>;
  streak_days: number;
}

export interface SubjectProgress {
  subject: string;
  total_sessions: number;
  completed_sessions: number;
  average_score: number;
  time_spent: number;
}

// Tipos de configuración
export interface AppConfig {
  encryption_key: string;
  jwt_secret: string;
  jwt_expires_in: string;
  refresh_token_expires_in: string;
  max_api_keys_per_user: number;
  max_study_plans_per_user: number;
  ai_rate_limit_per_minute: number;
}

// Tipos de errores
export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INSUFFICIENT_CREDITS = 'INSUFFICIENT_CREDITS',
  INVALID_API_KEY = 'INVALID_API_KEY',
  ENCRYPTION_ERROR = 'ENCRYPTION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR'
}

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: any;
}