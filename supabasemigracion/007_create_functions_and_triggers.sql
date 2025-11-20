-- Migration: Create functions and triggers for automated processes
-- Description: Creates database functions and triggers for automated calculations, notifications, and data integrity

-- Function: Update user streaks automatically
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
BEGIN
    -- Update current streak if user studied today
    IF NEW.start_time::date = CURRENT_DATE THEN
        UPDATE public.user_streaks 
        SET 
            current_streak = CASE 
                WHEN last_study_date = CURRENT_DATE - 1 OR last_study_date IS NULL 
                THEN current_streak + 1 
                ELSE 1 
            END,
            longest_streak = CASE 
                WHEN current_streak + 1 > longest_streak 
                THEN current_streak + 1 
                ELSE longest_streak 
            END,
            last_study_date = CURRENT_DATE,
            total_study_days = total_study_days + 1,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
        
        -- If no streak record exists, create one
        IF NOT FOUND THEN
            INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, last_study_date, total_study_days)
            VALUES (NEW.user_id, 1, 1, CURRENT_DATE, 1);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate and update user progress
CREATE OR REPLACE FUNCTION update_user_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Update progress for the studied material
    INSERT INTO public.user_progress (user_id, material_id, progress_type, progress_percentage, mastery_level, last_interaction)
    VALUES (NEW.user_id, NEW.material_id, 'material', 
            CASE WHEN NEW.understanding_rating >= 4 THEN 100.00 ELSE 50.00 END,
            CASE WHEN NEW.understanding_rating >= 4 THEN 3 ELSE 1 END,
            NEW.end_time)
    ON CONFLICT (user_id, progress_type, COALESCE(material_id, '00000000-0000-0000-0000-000000000000'))
    DO UPDATE SET
        progress_percentage = CASE 
            WHEN NEW.understanding_rating >= 4 THEN 100.00 
            ELSE LEAST(user_progress.progress_percentage + 25.00, 100.00) 
        END,
        mastery_level = CASE 
            WHEN NEW.understanding_rating >= 4 THEN 5 
            ELSE LEAST(user_progress.mastery_level + 1, 5) 
        END,
        time_spent_minutes = user_progress.time_spent_minutes + NEW.duration_minutes,
        interactions_count = user_progress.interactions_count + 1,
        is_completed = CASE WHEN NEW.understanding_rating >= 4 THEN true ELSE user_progress.is_completed END,
        last_interaction = NEW.end_time,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Create achievement notification
CREATE OR REPLACE FUNCTION create_achievement_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Create notification for achievement unlock
    INSERT INTO public.notifications (user_id, notification_type, title, message, priority)
    VALUES (
        NEW.user_id, 
        'achievement_unlocked', 
        '¡Nuevo logro desbloqueado!', 
        'Has desbloqueado el logro: ' || NEW.title || '. ¡Felicitaciones!',
        'high'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Create streak milestone notification
CREATE OR REPLACE FUNCTION check_streak_milestone()
RETURNS TRIGGER AS $$
DECLARE
    milestone_achieved BOOLEAN := false;
    milestone_message TEXT := '';
BEGIN
    -- Check for streak milestones
    IF NEW.current_streak IN (7, 14, 30, 60, 100, 365) THEN
        milestone_achieved := true;
        milestone_message := CASE 
            WHEN NEW.current_streak = 7 THEN '¡Increíble! Has mantenido tu racha por 7 días.'
            WHEN NEW.current_streak = 14 THEN '¡Excelente! 14 días de estudio consecutivo.'
            WHEN NEW.current_streak = 30 THEN '¡Increíble! Un mes completo de estudio constante.'
            WHEN NEW.current_streak = 60 THEN '¡Fantástico! Dos meses de dedicación inquebrantable.'
            WHEN NEW.current_streak = 100 THEN '¡Asombroso! 100 días de estudio consecutivo.'
            WHEN NEW.current_streak = 365 THEN '¡Legendario! Un año completo de estudio diario.'
        END;
        
        -- Create milestone notification
        INSERT INTO public.notifications (user_id, notification_type, title, message, priority)
        VALUES (
            NEW.user_id, 
            'streak_milestone', 
            '¡Hito de racha alcanzado!', 
            milestone_message || ' Tu racha actual es de ' || NEW.current_streak || ' días.',
            'high'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Update daily goals progress
CREATE OR REPLACE FUNCTION update_daily_goals_progress()
RETURNS TRIGGER AS $$
DECLARE
    today_goal_id UUID;
    today_study_minutes INTEGER;
    today_flashcards INTEGER;
    today_quizzes INTEGER;
BEGIN
    -- Get or create today's goal
    SELECT id INTO today_goal_id 
    FROM public.daily_goals 
    WHERE user_id = NEW.user_id AND goal_date = CURRENT_DATE;
    
    IF today_goal_id IS NULL THEN
        INSERT INTO public.daily_goals (user_id, goal_date)
        VALUES (NEW.user_id, CURRENT_DATE)
        RETURNING id INTO today_goal_id;
    END IF;
    
    -- Calculate today's progress
    SELECT 
        COALESCE(SUM(duration_minutes), 0),
        COUNT(CASE WHEN session_type = 'flashcard' THEN 1 END),
        COUNT(CASE WHEN session_type = 'quiz' THEN 1 END)
    INTO today_study_minutes, today_flashcards, today_quizzes
    FROM public.study_sessions 
    WHERE user_id = NEW.user_id 
    AND start_time::date = CURRENT_DATE
    AND end_time IS NOT NULL;
    
    -- Update daily goals
    UPDATE public.daily_goals 
    SET 
        study_minutes_completed = today_study_minutes,
        flashcards_completed = today_flashcards,
        quizzes_completed = today_quizzes,
        completion_percentage = CASE 
            WHEN study_minutes_goal > 0 AND flashcards_goal > 0 AND quizzes_goal > 0 
            THEN LEAST(100.00, (
                (today_study_minutes::decimal / study_minutes_goal * 33.33) +
                (today_flashcards::decimal / flashcards_goal * 33.33) +
                (today_quizzes::decimal / quizzes_goal * 33.34)
            ))
            ELSE 0.00
        END,
        is_completed = (
            today_study_minutes >= study_minutes_goal AND
            today_flashcards >= flashcards_goal AND
            today_quizzes >= quizzes_goal
        ),
        updated_at = NOW()
    WHERE id = today_goal_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Clean up expired recommendations
CREATE OR REPLACE FUNCTION cleanup_expired_recommendations()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete expired recommendations
    DELETE FROM public.recommendations 
    WHERE expires_at < NOW() 
    AND (was_clicked = false OR was_clicked IS NULL);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate flashcard mastery using spaced repetition
CREATE OR REPLACE FUNCTION update_flashcard_mastery()
RETURNS TRIGGER AS $$
DECLARE
    mastery_increase INTEGER;
    next_review_interval INTEGER;
BEGIN
    -- Calculate mastery increase based on response quality
    mastery_increase := CASE 
        WHEN NEW.response_quality >= 4 THEN 1
        WHEN NEW.response_quality >= 3 THEN 0
        ELSE -1
    END;
    
    -- Update flashcard mastery
    UPDATE public.flashcards 
    SET 
        mastery_level = GREATEST(0, LEAST(5, mastery_level + mastery_increase)),
        study_count = study_count + 1,
        correct_count = correct_count + CASE WHEN NEW.was_correct THEN 1 ELSE 0 END,
        incorrect_count = incorrect_count + CASE WHEN NOT NEW.was_correct THEN 1 ELSE 0 END,
        last_reviewed = NEW.study_time,
        next_review_date = CURRENT_DATE + INTERVAL '1 day' * CASE 
            WHEN mastery_level + mastery_increase >= 4 THEN 7
            WHEN mastery_level + mastery_increase >= 3 THEN 3
            WHEN mastery_level + mastery_increase >= 2 THEN 1
            ELSE 1
        END,
        updated_at = NOW()
    WHERE id = NEW.card_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_user_streak
    AFTER INSERT ON public.study_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_streak();

CREATE TRIGGER trigger_update_user_progress
    AFTER UPDATE OF end_time ON public.study_sessions
    FOR EACH ROW
    WHEN (NEW.end_time IS NOT NULL)
    EXECUTE FUNCTION update_user_progress();

CREATE TRIGGER trigger_create_achievement_notification
    AFTER INSERT ON public.user_achievements
    FOR EACH ROW
    EXECUTE FUNCTION create_achievement_notification();

CREATE TRIGGER trigger_check_streak_milestone
    AFTER UPDATE OF current_streak ON public.user_streaks
    FOR EACH ROW
    WHEN (NEW.current_streak > OLD.current_streak)
    EXECUTE FUNCTION check_streak_milestone();

CREATE TRIGGER trigger_update_daily_goals_progress
    AFTER UPDATE OF end_time ON public.study_sessions
    FOR EACH ROW
    WHEN (NEW.end_time IS NOT NULL)
    EXECUTE FUNCTION update_daily_goals_progress();

CREATE TRIGGER trigger_cleanup_expired_recommendations
    AFTER INSERT ON public.recommendations
    FOR EACH STATEMENT
    EXECUTE FUNCTION cleanup_expired_recommendations();

CREATE TRIGGER trigger_update_flashcard_mastery
    AFTER INSERT ON public.flashcard_study_history
    FOR EACH ROW
    EXECUTE FUNCTION update_flashcard_mastery();

-- Function: Create study reminder notification
CREATE OR REPLACE FUNCTION create_study_reminder()
RETURNS VOID AS $$
DECLARE
    user_record RECORD;
    reminder_time TIME;
BEGIN
    -- Get users who have study reminders enabled and it's their reminder time
    FOR user_record IN 
        SELECT u.id, u.email, s.daily_study_goal, s.reminder_time, s.timezone
        FROM auth.users u
        JOIN public.user_settings s ON u.id = s.user_id
        WHERE s.study_reminders = true
        AND s.reminder_time = CURRENT_TIME
        AND u.email_confirmed_at IS NOT NULL
    LOOP
        -- Create reminder notification
        INSERT INTO public.notifications (
            user_id, 
            notification_type, 
            title, 
            message, 
            priority,
            scheduled_for
        )
        VALUES (
            user_record.id, 
            'study_reminder', 
            '⏰ Tiempo de estudio', 
            'Es hora de estudiar. Tu meta diaria es de ' || user_record.daily_study_goal || ' minutos. ¡Tú puedes!',
            'medium',
            NOW()
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function: Generate weekly progress report
CREATE OR REPLACE FUNCTION generate_weekly_progress_report()
RETURNS VOID AS $$
DECLARE
    user_record RECORD;
    weekly_stats JSONB;
BEGIN
    -- Process each active user
    FOR user_record IN 
        SELECT DISTINCT user_id 
        FROM public.study_sessions 
        WHERE start_time >= CURRENT_DATE - INTERVAL '7 days'
    LOOP
        -- Calculate weekly statistics
        SELECT jsonb_build_object(
            'total_study_time', COALESCE(SUM(duration_minutes), 0),
            'total_sessions', COUNT(*),
            'average_session_duration', COALESCE(AVG(duration_minutes), 0)::integer,
            'subjects_studied', COUNT(DISTINCT material_id),
            'best_day', MAX(start_time::date),
            'streak_days', MAX(current_streak)
        ) INTO weekly_stats
        FROM public.study_sessions s
        LEFT JOIN public.user_streaks us ON s.user_id = us.user_id
        WHERE s.user_id = user_record.user_id 
        AND s.start_time >= CURRENT_DATE - INTERVAL '7 days';
        
        -- Create progress report notification
        INSERT INTO public.notifications (
            user_id, 
            notification_type, 
            title, 
            message, 
            priority,
            metadata
        )
        VALUES (
            user_record.user_id, 
            'weekly_progress', 
            '📊 Tu progreso de la semana', 
            'Esta semana estudiaste ' || (weekly_stats->>'total_study_time') || ' minutos en ' || (weekly_stats->>'total_sessions') || ' sesiones.',
            'low',
            weekly_stats
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function: Update deck statistics
CREATE OR REPLACE FUNCTION update_deck_statistics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update deck statistics when flashcards are added/modified
    UPDATE public.flashcard_decks 
    SET 
        card_count = (SELECT COUNT(*) FROM public.flashcards WHERE deck_id = NEW.deck_id AND is_active = true),
        mastered_cards = (SELECT COUNT(*) FROM public.flashcards WHERE deck_id = NEW.deck_id AND mastery_level >= 4 AND is_active = true),
        updated_at = NOW()
    WHERE id = NEW.deck_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create additional triggers
CREATE TRIGGER trigger_update_deck_statistics
    AFTER INSERT OR UPDATE OR DELETE ON public.flashcards
    FOR EACH ROW
    EXECUTE FUNCTION update_deck_statistics();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION update_user_streak() TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_progress() TO authenticated;
GRANT EXECUTE ON FUNCTION create_achievement_notification() TO authenticated;
GRANT EXECUTE ON FUNCTION check_streak_milestone() TO authenticated;
GRANT EXECUTE ON FUNCTION update_daily_goals_progress() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_recommendations() TO authenticated;
GRANT EXECUTE ON FUNCTION update_flashcard_mastery() TO authenticated;
GRANT EXECUTE ON FUNCTION create_study_reminder() TO authenticated;
GRANT EXECUTE ON FUNCTION generate_weekly_progress_report() TO authenticated;
GRANT EXECUTE ON FUNCTION update_deck_statistics() TO authenticated;