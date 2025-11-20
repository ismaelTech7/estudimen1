-- Migration: Create notifications and activity system
-- Description: Creates tables for user notifications, activity tracking, and engagement features

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type TEXT CHECK (notification_type IN ('study_reminder', 'achievement_unlocked', 'streak_milestone', 'social_activity', 'ai_suggestion', 'deadline_approaching', 'study_group_activity', 'recommendation')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    action_text TEXT,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    is_read BOOLEAN DEFAULT false,
    is_actioned BOOLEAN DEFAULT false,
    metadata JSONB, -- Additional data like achievement details, study stats, etc.
    scheduled_for TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    actioned_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_activity_log table for tracking all user activities
CREATE TABLE IF NOT EXISTS public.user_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT CHECK (activity_type IN ('login', 'logout', 'study_session_start', 'study_session_end', 'quiz_start', 'quiz_complete', 'flashcard_review', 'material_read', 'note_created', 'achievement_unlocked', 'streak_broken', 'ai_chat', 'recommendation_clicked', 'social_interaction')),
    activity_description TEXT,
    metadata JSONB, -- Detailed activity data
    session_id UUID, -- Link to study session if applicable
    ip_address INET,
    user_agent TEXT,
    device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_goals table for tracking daily study objectives
CREATE TABLE IF NOT EXISTS public.daily_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_date DATE NOT NULL,
    study_minutes_goal INTEGER DEFAULT 30,
    study_minutes_completed INTEGER DEFAULT 0,
    flashcards_goal INTEGER DEFAULT 10,
    flashcards_completed INTEGER DEFAULT 0,
    quizzes_goal INTEGER DEFAULT 1,
    quizzes_completed INTEGER DEFAULT 0,
    streak_days_goal INTEGER DEFAULT 1,
    streak_days_completed INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT daily_goals_user_date_unique UNIQUE (user_id, goal_date)
);

-- Create weekly_goals table for tracking weekly study objectives
CREATE TABLE IF NOT EXISTS public.weekly_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    study_hours_goal INTEGER DEFAULT 5,
    study_hours_completed DECIMAL(5,2) DEFAULT 0.00,
    materials_goal INTEGER DEFAULT 3,
    materials_completed INTEGER DEFAULT 0,
    topics_goal INTEGER DEFAULT 2,
    topics_completed INTEGER DEFAULT 0,
    new_flashcards_goal INTEGER DEFAULT 20,
    new_flashcards_created INTEGER DEFAULT 0,
    streak_weeks_goal INTEGER DEFAULT 1,
    streak_weeks_completed INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    reflection_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT weekly_goals_user_week_unique UNIQUE (user_id, week_start_date)
);

-- Create monthly_challenges table for gamification
CREATE TABLE IF NOT EXISTS public.monthly_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    challenge_type TEXT CHECK (challenge_type IN ('study_time', 'streak', 'materials', 'quizzes', 'flashcards', 'social', 'consistency')),
    target_value INTEGER NOT NULL,
    target_unit TEXT CHECK (target_unit IN ('minutes', 'hours', 'days', 'sessions', 'cards', 'quizzes', 'materials')),
    reward_points INTEGER DEFAULT 0,
    reward_badge TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard', 'expert')),
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_challenge_participation table
CREATE TABLE IF NOT EXISTS public.user_challenge_participation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES public.monthly_challenges(id) ON DELETE CASCADE,
    current_progress INTEGER DEFAULT 0,
    target_progress INTEGER NOT NULL,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    reward_claimed BOOLEAN DEFAULT false,
    reward_claimed_at TIMESTAMP WITH TIME ZONE,
    personal_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT user_challenge_participation_user_challenge_unique UNIQUE (user_id, challenge_id)
);

-- Create user_favorites table for bookmarking content
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content_type TEXT CHECK (content_type IN ('material', 'quiz', 'flashcard_deck', 'learning_path', 'note', 'study_group')),
    content_id UUID NOT NULL,
    folder_name TEXT DEFAULT 'General',
    notes TEXT,
    tags TEXT[],
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT user_favorites_user_content_unique UNIQUE (user_id, content_type, content_id)
);

-- Create user_sharing table for sharing content with others
CREATE TABLE IF NOT EXISTS public.user_sharing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shared_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content_type TEXT CHECK (content_type IN ('material', 'quiz', 'flashcard_deck', 'note', 'study_group')),
    content_id UUID NOT NULL,
    share_type TEXT CHECK (share_type IN ('view', 'edit', 'collaborate')),
    message TEXT,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    is_accepted BOOLEAN DEFAULT false,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system_config table for platform-wide settings
CREATE TABLE IF NOT EXISTS public.system_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key TEXT NOT NULL UNIQUE,
    config_value JSONB NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default system configurations
INSERT INTO public.system_config (config_key, config_value, description) VALUES
('study_reminder_default_time', '"09:00"', 'Default time for study reminders'),
('daily_study_goal_default', '30', 'Default daily study goal in minutes'),
('weekly_study_goal_default', '210', 'Default weekly study goal in minutes'),
('flashcard_review_interval', '[1, 3, 7, 14, 30]', 'Spaced repetition intervals in days'),
('max_streak_break_days', '1', 'Maximum days allowed to break streak'),
('ai_personality_options', '["friendly", "professional", "challenging", "supportive"]', 'Available AI personality options'),
('theme_options', '["light", "dark", "auto"]', 'Available theme options'),
('supported_languages', '["es", "en", "pt", "fr"]', 'Supported languages for the platform'),
('gamification_enabled', 'true', 'Whether gamification features are enabled'),
('social_features_enabled', 'true', 'Whether social features are enabled');

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_daily_goals_updated_at 
    BEFORE UPDATE ON public.daily_goals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_goals_updated_at 
    BEFORE UPDATE ON public.weekly_goals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_challenges_updated_at 
    BEFORE UPDATE ON public.monthly_challenges 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_challenge_participation_updated_at 
    BEFORE UPDATE ON public.user_challenge_participation 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_favorites_updated_at 
    BEFORE UPDATE ON public.user_favorites 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at 
    BEFORE UPDATE ON public.system_config 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_notification_type ON public.notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON public.user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_activity_type ON public.user_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON public.user_activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_daily_goals_user_id ON public.daily_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_goals_goal_date ON public.daily_goals(goal_date);
CREATE INDEX IF NOT EXISTS idx_weekly_goals_user_id ON public.weekly_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_goals_week_start_date ON public.weekly_goals(week_start_date);
CREATE INDEX IF NOT EXISTS idx_monthly_challenges_start_date ON public.monthly_challenges(start_date);
CREATE INDEX IF NOT EXISTS idx_monthly_challenges_end_date ON public.monthly_challenges(end_date);
CREATE INDEX IF NOT EXISTS idx_monthly_challenges_is_active ON public.monthly_challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_user_challenge_participation_user_id ON public.user_challenge_participation(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenge_participation_challenge_id ON public.user_challenge_participation(challenge_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_content_type ON public.user_favorites(content_type);
CREATE INDEX IF NOT EXISTS idx_user_sharing_shared_by ON public.user_sharing(shared_by_user_id);
CREATE INDEX IF NOT EXISTS idx_user_sharing_shared_with ON public.user_sharing(shared_with_user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.notifications TO authenticated;
GRANT SELECT, INSERT ON public.user_activity_log TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.daily_goals TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.weekly_goals TO authenticated;
GRANT SELECT ON public.monthly_challenges TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_challenge_participation TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_favorites TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_sharing TO authenticated;
GRANT SELECT ON public.system_config TO anon, authenticated;