-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create study_sessions table
CREATE TABLE study_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quizzes table
CREATE TABLE quizzes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    topic VARCHAR(200) NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    score_percentage INTEGER NOT NULL,
    time_taken_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_progress table
CREATE TABLE user_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    total_study_time_minutes INTEGER DEFAULT 0,
    total_quizzes_taken INTEGER DEFAULT 0,
    average_score INTEGER DEFAULT 0,
    last_studied TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, subject)
);

-- Create ai_recommendations table
CREATE TABLE ai_recommendations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies for study_sessions
CREATE POLICY "Users can view their own study sessions" ON study_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study sessions" ON study_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study sessions" ON study_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study sessions" ON study_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for quizzes
CREATE POLICY "Users can view their own quizzes" ON quizzes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quizzes" ON quizzes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for user_progress
CREATE POLICY "Users can view their own progress" ON user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON user_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for ai_recommendations
CREATE POLICY "Users can view their own recommendations" ON ai_recommendations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own recommendations" ON ai_recommendations
    FOR UPDATE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON study_sessions TO authenticated;
GRANT ALL ON quizzes TO authenticated;
GRANT ALL ON user_progress TO authenticated;
GRANT ALL ON ai_recommendations TO authenticated;

-- Create function to update user_progress automatically
CREATE OR REPLACE FUNCTION update_user_progress()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'study_sessions' THEN
        INSERT INTO user_progress (user_id, subject, total_study_time_minutes, last_studied)
        VALUES (NEW.user_id, NEW.subject, NEW.duration_minutes, NEW.created_at)
        ON CONFLICT (user_id, subject)
        DO UPDATE SET
            total_study_time_minutes = user_progress.total_study_time_minutes + NEW.duration_minutes,
            last_studied = NEW.created_at,
            updated_at = NOW();
    ELSIF TG_TABLE_NAME = 'quizzes' THEN
        INSERT INTO user_progress (user_id, subject, total_quizzes_taken, average_score)
        VALUES (NEW.user_id, NEW.subject, 1, NEW.score_percentage)
        ON CONFLICT (user_id, subject)
        DO UPDATE SET
            total_quizzes_taken = user_progress.total_quizzes_taken + 1,
            average_score = (
                (user_progress.average_score * user_progress.total_quizzes_taken + NEW.score_percentage) 
                / (user_progress.total_quizzes_taken + 1)
            ),
            updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_progress_after_study
    AFTER INSERT ON study_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_progress();

CREATE TRIGGER update_progress_after_quiz
    AFTER INSERT ON quizzes
    FOR EACH ROW
    EXECUTE FUNCTION update_user_progress();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at triggers
CREATE TRIGGER update_study_sessions_updated_at
    BEFORE UPDATE ON study_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
    BEFORE UPDATE ON user_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();