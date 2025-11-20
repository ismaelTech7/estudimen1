-- Migration: Create users and profiles tables
-- Description: Creates the core user profile and settings tables for Estudimen

-- Create user_profiles table to store additional user information
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    username TEXT UNIQUE,
    bio TEXT,
    avatar_url TEXT,
    date_of_birth DATE,
    educational_level TEXT CHECK (educational_level IN ('high_school', 'college', 'university', 'professional', 'other')),
    country TEXT,
    timezone TEXT DEFAULT 'UTC',
    language TEXT DEFAULT 'es',
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT user_profiles_user_id_unique UNIQUE (user_id)
);

-- Create user_settings table for preferences
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    -- Study preferences
    daily_study_goal INTEGER DEFAULT 30, -- minutes
    weekly_study_goal INTEGER DEFAULT 210, -- minutes
    preferred_study_time TEXT CHECK (preferred_study_time IN ('morning', 'afternoon', 'evening', 'night')),
    study_reminders BOOLEAN DEFAULT true,
    reminder_time TIME DEFAULT '09:00:00',
    -- UI preferences
    theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'auto')),
    font_size TEXT DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
    animations_enabled BOOLEAN DEFAULT true,
    sound_effects BOOLEAN DEFAULT true,
    -- AI preferences
    ai_difficulty_level TEXT DEFAULT 'adaptive' CHECK (ai_difficulty_level IN ('beginner', 'intermediate', 'advanced', 'adaptive')),
    ai_personality TEXT DEFAULT 'friendly' CHECK (ai_personality IN ('friendly', 'professional', 'challenging', 'supportive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT user_settings_user_id_unique UNIQUE (user_id)
);

-- Create user_streaks table for tracking study consistency
CREATE TABLE IF NOT EXISTS public.user_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_study_date DATE,
    total_study_days INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT user_streaks_user_id_unique UNIQUE (user_id)
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    points INTEGER DEFAULT 0,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT user_achievements_user_achievement_unique UNIQUE (user_id, achievement_id)
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at 
    BEFORE UPDATE ON public.user_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_streaks_updated_at 
    BEFORE UPDATE ON public.user_streaks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON public.user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);

-- Grant permissions
GRANT SELECT ON public.user_profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.user_settings TO authenticated;
GRANT SELECT ON public.user_streaks TO anon, authenticated;
GRANT INSERT, UPDATE ON public.user_streaks TO authenticated;
GRANT SELECT ON public.user_achievements TO anon, authenticated;
GRANT INSERT ON public.user_achievements TO authenticated;