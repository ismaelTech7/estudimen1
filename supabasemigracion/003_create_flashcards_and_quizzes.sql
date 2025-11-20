-- Migration: Create flashcards and quiz system
-- Description: Creates tables for flashcards, quizzes, questions, and user progress tracking

-- Create flashcard_decks table
CREATE TABLE IF NOT EXISTS public.flashcard_decks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    is_public BOOLEAN DEFAULT false,
    is_favorite BOOLEAN DEFAULT false,
    card_count INTEGER DEFAULT 0,
    mastered_cards INTEGER DEFAULT 0,
    study_count INTEGER DEFAULT 0,
    last_studied TIMESTAMP WITH TIME ZONE,
    tags TEXT[],
    color TEXT DEFAULT '#6366f1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create flashcards table
CREATE TABLE IF NOT EXISTS public.flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
    front_text TEXT NOT NULL,
    back_text TEXT NOT NULL,
    front_image_url TEXT,
    back_image_url TEXT,
    audio_url TEXT,
    difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    mastery_level INTEGER DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 5),
    study_count INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    incorrect_count INTEGER DEFAULT 0,
    last_reviewed TIMESTAMP WITH TIME ZONE,
    next_review_date DATE,
    tags TEXT[],
    hints TEXT,
    examples TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    quiz_type TEXT CHECK (quiz_type IN ('multiple_choice', 'true_false', 'short_answer', 'mixed')),
    time_limit_minutes INTEGER,
    passing_score DECIMAL(5,2) DEFAULT 70.00,
    is_public BOOLEAN DEFAULT false,
    is_favorite BOOLEAN DEFAULT false,
    question_count INTEGER DEFAULT 0,
    attempt_count INTEGER DEFAULT 0,
    average_score DECIMAL(5,2),
    last_attempted TIMESTAMP WITH TIME ZONE,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz_questions table
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'fill_blank')),
    options JSONB, -- For multiple choice: [{"text": "Option A", "is_correct": true}, ...]
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    hint TEXT,
    image_url TEXT,
    audio_url TEXT,
    difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    points INTEGER DEFAULT 1,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz_attempts table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER DEFAULT 0,
    incorrect_answers INTEGER DEFAULT 0,
    score DECIMAL(5,2),
    percentage DECIMAL(5,2),
    passed BOOLEAN,
    answers JSONB, -- User's answers as JSON
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_progress table for tracking learning progress
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    material_id UUID REFERENCES public.study_materials(id) ON DELETE CASCADE,
    progress_type TEXT CHECK (progress_type IN ('subject', 'topic', 'material', 'flashcard_deck', 'quiz')),
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    mastery_level INTEGER DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 5),
    time_spent_minutes INTEGER DEFAULT 0,
    interactions_count INTEGER DEFAULT 0,
    last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT user_progress_user_content_unique UNIQUE (user_id, progress_type, COALESCE(subject_id, '00000000-0000-0000-0000-000000000000'), COALESCE(topic_id, '00000000-0000-0000-0000-000000000000'), COALESCE(material_id, '00000000-0000-0000-0000-000000000000'))
);

-- Create learning_analytics table for detailed analytics
CREATE TABLE IF NOT EXISTS public.learning_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.study_sessions(id) ON DELETE CASCADE,
    analytics_type TEXT CHECK (analytics_type IN ('study_pattern', 'performance', 'engagement', 'retention', 'difficulty')),
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(10,2) NOT NULL,
    context JSONB, -- Additional context as JSON
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create flashcard_study_history table
CREATE TABLE IF NOT EXISTS public.flashcard_study_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
    deck_id UUID NOT NULL REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
    study_date DATE DEFAULT CURRENT_DATE,
    study_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    response_quality INTEGER CHECK (response_quality >= 1 AND response_quality <= 5),
    time_to_answer_seconds INTEGER,
    was_correct BOOLEAN,
    difficulty_felt TEXT CHECK (difficulty_felt IN ('easy', 'medium', 'hard')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample flashcard decks
INSERT INTO public.flashcard_decks (user_id, title, description, difficulty_level, is_public, color, tags) VALUES
('00000000-0000-0000-0000-000000000000', 'Conceptos Básicos de Matemáticas', 'Tarjetas de repaso para conceptos fundamentales de matemáticas', 'beginner', true, '#3b82f6', ARRAY['matemáticas', 'álgebra', 'básico']),
('00000000-0000-0000-0000-000000000000', 'Fórmulas de Geometría', 'Fórmulas importantes de geometría que debes memorizar', 'intermediate', true, '#10b981', ARRAY['geometría', 'fórmulas', 'intermedio']),
('00000000-0000-0000-0000-000000000000', 'Vocabulario de Ciencias', 'Términos científicos esenciales y sus definiciones', 'beginner', true, '#f59e0b', ARRAY['ciencias', 'vocabulario', 'básico']);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_flashcard_decks_updated_at 
    BEFORE UPDATE ON public.flashcard_decks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flashcards_updated_at 
    BEFORE UPDATE ON public.flashcards 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at 
    BEFORE UPDATE ON public.quizzes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_questions_updated_at 
    BEFORE UPDATE ON public.quiz_questions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at 
    BEFORE UPDATE ON public.user_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_user_id ON public.flashcard_decks(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_subject_id ON public.flashcard_decks(subject_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_topic_id ON public.flashcard_decks(topic_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_deck_id ON public.flashcards(deck_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_mastery_level ON public.flashcards(mastery_level);
CREATE INDEX IF NOT EXISTS idx_flashcards_next_review ON public.flashcards(next_review_date);
CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON public.quizzes(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON public.quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_progress_type ON public.user_progress(progress_type);
CREATE INDEX IF NOT EXISTS idx_learning_analytics_user_id ON public.learning_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_study_history_user_id ON public.flashcard_study_history(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_study_history_card_id ON public.flashcard_study_history(card_id);

-- Grant permissions
GRANT SELECT ON public.flashcard_decks TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.flashcard_decks TO authenticated;
GRANT SELECT ON public.flashcards TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.flashcards TO authenticated;
GRANT SELECT ON public.quizzes TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quizzes TO authenticated;
GRANT SELECT ON public.quiz_questions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_questions TO authenticated;
GRANT SELECT, INSERT ON public.quiz_attempts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_progress TO authenticated;
GRANT SELECT, INSERT ON public.learning_analytics TO authenticated;
GRANT SELECT, INSERT ON public.flashcard_study_history TO authenticated;