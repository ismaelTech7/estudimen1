-- Migration: Create AI tutor and recommendations system
-- Description: Creates tables for AI tutoring, recommendations, and smart learning features

-- Create ai_conversations table for storing chat history with AI tutor
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    conversation_title TEXT,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    context TEXT, -- Context about what the user is studying
    conversation_type TEXT CHECK (conversation_type IN ('tutoring', 'question', 'explanation', 'practice', 'feedback')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_messages table for individual messages in conversations
CREATE TABLE IF NOT EXISTS public.ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    sender TEXT CHECK (sender IN ('user', 'ai')),
    message_text TEXT NOT NULL,
    message_type TEXT CHECK (message_type IN ('text', 'code', 'equation', 'image', 'suggestion', 'explanation')),
    metadata JSONB, -- Additional metadata like confidence, sources, etc.
    related_material_id UUID REFERENCES public.study_materials(id) ON DELETE SET NULL,
    sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative', 'confused')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recommendations table for personalized content suggestions
CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recommendation_type TEXT CHECK (recommendation_type IN ('material', 'topic', 'quiz', 'flashcard_deck', 'study_method')),
    content_id UUID NOT NULL, -- ID of the recommended content (material, topic, etc.)
    content_type TEXT NOT NULL, -- Type of content: 'study_material', 'topic', 'quiz', 'flashcard_deck'
    recommendation_reason TEXT, -- Why this was recommended
    relevance_score DECIMAL(5,2) DEFAULT 0.00, -- AI calculated relevance (0-100)
    user_feedback TEXT CHECK (user_feedback IN ('liked', 'disliked', 'irrelevant', 'helpful')),
    was_clicked BOOLEAN DEFAULT false,
    clicked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Create learning_paths table for structured learning sequences
CREATE TABLE IF NOT EXISTS public.learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    creator_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    estimated_duration_hours INTEGER DEFAULT 10,
    prerequisites TEXT[], -- List of required knowledge/skills
    learning_objectives TEXT[],
    is_public BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    rating DECIMAL(3,2) DEFAULT 0.00,
    tags TEXT[],
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create learning_path_steps table for individual steps in learning paths
CREATE TABLE IF NOT EXISTS public.learning_path_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
    step_title TEXT NOT NULL,
    step_description TEXT,
    step_order INTEGER NOT NULL,
    step_type TEXT CHECK (step_type IN ('material', 'quiz', 'flashcard', 'assignment', 'video', 'reading')),
    content_id UUID, -- ID of the content (material, quiz, etc.)
    content_type TEXT, -- Type of content
    estimated_duration_minutes INTEGER DEFAULT 30,
    completion_criteria TEXT, -- What constitutes completing this step
    resources JSONB, -- Additional resources as JSON
    is_mandatory BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_learning_paths table for tracking user's progress in learning paths
CREATE TABLE IF NOT EXISTS public.user_learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
    current_step_id UUID REFERENCES public.learning_path_steps(id) ON DELETE SET NULL,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    is_completed BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    time_spent_minutes INTEGER DEFAULT 0,
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT user_learning_paths_user_path_unique UNIQUE (user_id, path_id)
);

-- Create adaptive_learning_data table for AI-driven personalization
CREATE TABLE IF NOT EXISTS public.adaptive_learning_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    data_type TEXT CHECK (data_type IN ('learning_style', 'difficulty_preference', 'pace_preference', 'engagement_pattern', 'retention_rate')),
    data_value JSONB NOT NULL, -- Store complex data as JSON
    confidence_score DECIMAL(5,2) DEFAULT 0.00,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study_groups table for collaborative learning
CREATE TABLE IF NOT EXISTS public.study_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    creator_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    group_type TEXT CHECK (group_type IN ('public', 'private', 'invite_only')),
    max_members INTEGER DEFAULT 20,
    current_members INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    meeting_schedule JSONB, -- Store schedule as JSON
    goals TEXT[],
    rules TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study_group_members table for group membership
CREATE TABLE IF NOT EXISTS public.study_group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    contribution_score INTEGER DEFAULT 0,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT study_group_members_group_user_unique UNIQUE (group_id, user_id)
);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_ai_conversations_updated_at 
    BEFORE UPDATE ON public.ai_conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_paths_updated_at 
    BEFORE UPDATE ON public.learning_paths 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_path_steps_updated_at 
    BEFORE UPDATE ON public.learning_path_steps 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_learning_paths_updated_at 
    BEFORE UPDATE ON public.user_learning_paths 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_adaptive_learning_data_updated_at 
    BEFORE UPDATE ON public.adaptive_learning_data 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_groups_updated_at 
    BEFORE UPDATE ON public.study_groups 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_subject_id ON public.ai_conversations(subject_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON public.ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON public.recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_content_type ON public.recommendations(content_type);
CREATE INDEX IF NOT EXISTS idx_recommendations_expires_at ON public.recommendations(expires_at);
CREATE INDEX IF NOT EXISTS idx_learning_paths_creator_id ON public.learning_paths(creator_user_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_subject_id ON public.learning_paths(subject_id);
CREATE INDEX IF NOT EXISTS idx_learning_path_steps_path_id ON public.learning_path_steps(path_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_paths_user_id ON public.user_learning_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_paths_path_id ON public.user_learning_paths(path_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_learning_data_user_id ON public.adaptive_learning_data(user_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_learning_data_data_type ON public.adaptive_learning_data(data_type);
CREATE INDEX IF NOT EXISTS idx_study_groups_creator_id ON public.study_groups(creator_user_id);
CREATE INDEX IF NOT EXISTS idx_study_group_members_group_id ON public.study_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_study_group_members_user_id ON public.study_group_members(user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.ai_conversations TO authenticated;
GRANT SELECT, INSERT ON public.ai_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.recommendations TO authenticated;
GRANT SELECT ON public.learning_paths TO anon, authenticated;
GRANT SELECT ON public.learning_path_steps TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_learning_paths TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.adaptive_learning_data TO authenticated;
GRANT SELECT ON public.study_groups TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.study_group_members TO authenticated;