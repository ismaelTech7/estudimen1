-- Migration: Create study materials and content tables
-- Description: Creates tables for study materials, subjects, topics, and content management

-- Create subjects table
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT DEFAULT '#6366f1',
    category TEXT CHECK (category IN ('science', 'mathematics', 'language', 'history', 'geography', 'arts', 'technology', 'other')),
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create topics table (subjects can have multiple topics)
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    order_index INTEGER DEFAULT 0,
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    estimated_study_time INTEGER DEFAULT 30, -- minutes
    prerequisites TEXT[], -- Array of topic IDs
    learning_objectives TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study_materials table
CREATE TABLE IF NOT EXISTS public.study_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_type TEXT CHECK (content_type IN ('text', 'video', 'audio', 'interactive', 'pdf', 'image')),
    content TEXT NOT NULL, -- Main content (text, URL, or JSON for interactive)
    summary TEXT,
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    estimated_reading_time INTEGER DEFAULT 10, -- minutes
    tags TEXT[],
    source_url TEXT,
    author TEXT,
    language TEXT DEFAULT 'es',
    is_public BOOLEAN DEFAULT true,
    metadata JSONB, -- Additional metadata as JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_study_materials table (user's saved/personal materials)
CREATE TABLE IF NOT EXISTS public.user_study_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_type TEXT CHECK (content_type IN ('text', 'video', 'audio', 'interactive', 'pdf', 'image')),
    content TEXT NOT NULL,
    summary TEXT,
    tags TEXT[],
    is_favorite BOOLEAN DEFAULT false,
    study_count INTEGER DEFAULT 0,
    last_studied TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study_sessions table
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    material_id UUID REFERENCES public.study_materials(id) ON DELETE SET NULL,
    user_material_id UUID REFERENCES public.user_study_materials(id) ON DELETE SET NULL,
    session_type TEXT CHECK (session_type IN ('reading', 'flashcard', 'quiz', 'interactive', 'video', 'audio')),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    correct_answers INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    accuracy_percentage DECIMAL(5,2),
    notes TEXT,
    mood_before TEXT CHECK (mood_before IN ('excited', 'focused', 'neutral', 'tired', 'stressed')),
    mood_after TEXT CHECK (mood_after IN ('excited', 'focused', 'neutral', 'tired', 'stressed')),
    difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
    understanding_rating INTEGER CHECK (understanding_rating >= 1 AND understanding_rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study_notes table
CREATE TABLE IF NOT EXISTS public.study_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    material_id UUID REFERENCES public.study_materials(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.study_sessions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    note_type TEXT CHECK (note_type IN ('summary', 'question', 'insight', 'reminder', 'connection')),
    tags TEXT[],
    is_public BOOLEAN DEFAULT false,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample subjects
INSERT INTO public.subjects (name, description, icon, color, category, difficulty_level) VALUES
('Matemáticas', 'Estudia conceptos matemáticos desde aritmética hasta cálculo avanzado', '📊', '#3b82f6', 'mathematics', 'intermediate'),
('Ciencias', 'Explora el mundo natural y sus fenómenos', '🔬', '#10b981', 'science', 'intermediate'),
('Historia', 'Aprende sobre eventos históricos y civilizaciones', '📚', '#f59e0b', 'history', 'beginner'),
('Lenguaje', 'Mejora tus habilidades de lectura y escritura', '📖', '#8b5cf6', 'language', 'beginner'),
('Geografía', 'Descubre el mundo y sus características', '🌍', '#06b6d4', 'geography', 'beginner'),
('Tecnología', 'Mantente actualizado con la tecnología moderna', '💻', '#6366f1', 'technology', 'intermediate'),
('Arte', 'Explora la creatividad y expresión artística', '🎨', '#ec4899', 'arts', 'beginner'),
('Programación', 'Aprende a codificar y desarrollar software', '👨‍💻', '#f97316', 'technology', 'advanced');

-- Insert sample topics for Mathematics
INSERT INTO public.topics (subject_id, name, description, icon, order_index, difficulty_level, estimated_study_time, learning_objectives) VALUES
((SELECT id FROM public.subjects WHERE name = 'Matemáticas'), 'Álgebra Básica', 'Conceptos fundamentales del álgebra', '📐', 1, 'beginner', 45, ARRAY['Resolver ecuaciones lineales', 'Entender variables y constantes', 'Aplicar propiedades algebraicas']),
((SELECT id FROM public.subjects WHERE name = 'Matemáticas'), 'Geometría', 'Formas, ángulos y propiedades espaciales', '📐', 2, 'intermediate', 60, ARRAY['Calcular áreas y volúmenes', 'Entender propiedades de triángulos', 'Aplicar teoremas geométricos']),
((SELECT id FROM public.subjects WHERE name = 'Matemáticas'), 'Cálculo', 'Límites, derivadas e integrales', '📈', 3, 'advanced', 90, ARRAY['Entender concepto de límite', 'Calcular derivadas', 'Resolver integrales básicas']);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_subjects_updated_at 
    BEFORE UPDATE ON public.subjects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topics_updated_at 
    BEFORE UPDATE ON public.topics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_materials_updated_at 
    BEFORE UPDATE ON public.study_materials 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_study_materials_updated_at 
    BEFORE UPDATE ON public.user_study_materials 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_notes_updated_at 
    BEFORE UPDATE ON public.study_notes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_topics_subject_id ON public.topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_topics_difficulty ON public.topics(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_study_materials_topic_id ON public.study_materials(topic_id);
CREATE INDEX IF NOT EXISTS idx_study_materials_content_type ON public.study_materials(content_type);
CREATE INDEX IF NOT EXISTS idx_study_materials_difficulty ON public.study_materials(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_user_study_materials_user_id ON public.user_study_materials(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_start_time ON public.study_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_study_notes_user_id ON public.study_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_study_notes_material_id ON public.study_notes(material_id);

-- Grant permissions
GRANT SELECT ON public.subjects TO anon, authenticated;
GRANT SELECT ON public.topics TO anon, authenticated;
GRANT SELECT ON public.study_materials TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_study_materials TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.study_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_notes TO authenticated;