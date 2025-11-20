-- Migration: Create Row Level Security (RLS) policies
-- Description: Creates security policies for all tables to ensure data isolation and privacy

-- User Profiles RLS Policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own profile
CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own profile
CREATE POLICY "Users can delete own profile" ON public.user_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- User Settings RLS Policies
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings" ON public.user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.user_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- User Streaks RLS Policies
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streaks" ON public.user_streaks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks" ON public.user_streaks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks" ON public.user_streaks
    FOR UPDATE USING (auth.uid() = user_id);

-- User Achievements RLS Policies
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements" ON public.user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON public.user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Study Materials RLS Policies (Public materials can be viewed by all, user materials only by owner)
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public materials" ON public.study_materials
    FOR SELECT USING (is_public = true);

CREATE POLICY "Authenticated users can view all materials" ON public.study_materials
    FOR SELECT USING (auth.role() = 'authenticated');

-- User Study Materials RLS Policies
ALTER TABLE public.user_study_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own materials" ON public.user_study_materials
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own materials" ON public.user_study_materials
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own materials" ON public.user_study_materials
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own materials" ON public.user_study_materials
    FOR DELETE USING (auth.uid() = user_id);

-- Study Sessions RLS Policies
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON public.study_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON public.study_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.study_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Study Notes RLS Policies
ALTER TABLE public.study_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes" ON public.study_notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes" ON public.study_notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON public.study_notes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" ON public.study_notes
    FOR DELETE USING (auth.uid() = user_id);

-- Flashcard Decks RLS Policies
ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public decks" ON public.flashcard_decks
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view own decks" ON public.flashcard_decks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own decks" ON public.flashcard_decks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own decks" ON public.flashcard_decks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own decks" ON public.flashcard_decks
    FOR DELETE USING (auth.uid() = user_id);

-- Flashcards RLS Policies
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view flashcards from public decks" ON public.flashcards
    FOR SELECT USING (
        deck_id IN (
            SELECT id FROM public.flashcard_decks WHERE is_public = true
        ) OR 
        deck_id IN (
            SELECT id FROM public.flashcard_decks WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert flashcards in own decks" ON public.flashcards
    FOR INSERT WITH CHECK (
        deck_id IN (
            SELECT id FROM public.flashcard_decks WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update flashcards in own decks" ON public.flashcards
    FOR UPDATE USING (
        deck_id IN (
            SELECT id FROM public.flashcard_decks WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete flashcards in own decks" ON public.flashcards
    FOR DELETE USING (
        deck_id IN (
            SELECT id FROM public.flashcard_decks WHERE user_id = auth.uid()
        )
    );

-- Quizzes RLS Policies
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public quizzes" ON public.quizzes
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view own quizzes" ON public.quizzes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quizzes" ON public.quizzes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quizzes" ON public.quizzes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quizzes" ON public.quizzes
    FOR DELETE USING (auth.uid() = user_id);

-- Quiz Questions RLS Policies
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view questions from public quizzes" ON public.quiz_questions
    FOR SELECT USING (
        quiz_id IN (
            SELECT id FROM public.quizzes WHERE is_public = true
        ) OR 
        quiz_id IN (
            SELECT id FROM public.quizzes WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert questions in own quizzes" ON public.quiz_questions
    FOR INSERT WITH CHECK (
        quiz_id IN (
            SELECT id FROM public.quizzes WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update questions in own quizzes" ON public.quiz_questions
    FOR UPDATE USING (
        quiz_id IN (
            SELECT id FROM public.quizzes WHERE user_id = auth.uid()
        )
    );

-- Quiz Attempts RLS Policies
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz attempts" ON public.quiz_attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz attempts" ON public.quiz_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Progress RLS Policies
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress" ON public.user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.user_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- AI Conversations RLS Policies
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI conversations" ON public.ai_conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI conversations" ON public.ai_conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI conversations" ON public.ai_conversations
    FOR UPDATE USING (auth.uid() = user_id);

-- AI Messages RLS Policies
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages from own conversations" ON public.ai_messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM public.ai_conversations WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages in own conversations" ON public.ai_messages
    FOR INSERT WITH CHECK (
        conversation_id IN (
            SELECT id FROM public.ai_conversations WHERE user_id = auth.uid()
        )
    );

-- Recommendations RLS Policies
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendations" ON public.recommendations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations" ON public.recommendations
    FOR UPDATE USING (auth.uid() = user_id);

-- Notifications RLS Policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- User Activity Log RLS Policies
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity log" ON public.user_activity_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity log" ON public.user_activity_log
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Daily Goals RLS Policies
ALTER TABLE public.daily_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily goals" ON public.daily_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily goals" ON public.daily_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily goals" ON public.daily_goals
    FOR UPDATE USING (auth.uid() = user_id);

-- Weekly Goals RLS Policies
ALTER TABLE public.weekly_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weekly goals" ON public.weekly_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly goals" ON public.weekly_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly goals" ON public.weekly_goals
    FOR UPDATE USING (auth.uid() = user_id);

-- User Challenge Participation RLS Policies
ALTER TABLE public.user_challenge_participation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenge participation" ON public.user_challenge_participation
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenge participation" ON public.user_challenge_participation
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenge participation" ON public.user_challenge_participation
    FOR UPDATE USING (auth.uid() = user_id);

-- User Favorites RLS Policies
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites" ON public.user_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON public.user_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON public.user_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- User Sharing RLS Policies
ALTER TABLE public.user_sharing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view content shared with them" ON public.user_sharing
    FOR SELECT USING (
        shared_with_user_id = auth.uid() OR shared_by_user_id = auth.uid()
    );

CREATE POLICY "Users can share content" ON public.user_sharing
    FOR INSERT WITH CHECK (shared_by_user_id = auth.uid());

CREATE POLICY "Users can update shares they created" ON public.user_sharing
    FOR UPDATE USING (shared_by_user_id = auth.uid());

-- System Config RLS Policies (Read-only for all users)
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view system config" ON public.system_config
    FOR SELECT USING (is_active = true);

-- Subjects RLS Policies (Read-only for all users)
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view subjects" ON public.subjects
    FOR SELECT USING (is_active = true);

-- Topics RLS Policies (Read-only for all users)
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view topics" ON public.topics
    FOR SELECT USING (is_active = true);

-- Learning Paths RLS Policies
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public learning paths" ON public.learning_paths
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view own learning paths" ON public.learning_paths
    FOR SELECT USING (creator_user_id = auth.uid());

CREATE POLICY "Users can create learning paths" ON public.learning_paths
    FOR INSERT WITH CHECK (creator_user_id = auth.uid());

CREATE POLICY "Users can update own learning paths" ON public.learning_paths
    FOR UPDATE USING (creator_user_id = auth.uid());

-- User Learning Paths RLS Policies
ALTER TABLE public.user_learning_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own learning path progress" ON public.user_learning_paths
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning path progress" ON public.user_learning_paths
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learning path progress" ON public.user_learning_paths
    FOR UPDATE USING (auth.uid() = user_id);

-- Study Groups RLS Policies
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public study groups" ON public.study_groups
    FOR SELECT USING (group_type = 'public' AND is_active = true);

CREATE POLICY "Users can view study groups they are members of" ON public.study_groups
    FOR SELECT USING (
        id IN (
            SELECT group_id FROM public.study_group_members WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can create study groups" ON public.study_groups
    FOR INSERT WITH CHECK (creator_user_id = auth.uid());

CREATE POLICY "Users can update study groups they created" ON public.study_groups
    FOR UPDATE USING (creator_user_id = auth.uid());

-- Study Group Members RLS Policies
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view members of groups they belong to" ON public.study_group_members
    FOR SELECT USING (
        group_id IN (
            SELECT group_id FROM public.study_group_members WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can join public study groups" ON public.study_group_members
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND 
        group_id IN (
            SELECT id FROM public.study_groups WHERE group_type = 'public' AND is_active = true
        )
    );

CREATE POLICY "Users can update own membership" ON public.study_group_members
    FOR UPDATE USING (user_id = auth.uid());