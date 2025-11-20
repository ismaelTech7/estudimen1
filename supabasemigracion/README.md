# Estudimen Database Migration Guide

This directory contains the complete database schema for Estudimen, an AI-powered study assistant application built with Supabase.

## 📁 Migration Files

### 001_create_users_and_profiles.sql
**Purpose**: Core user management and profile system
**Tables Created**:
- `user_profiles` - Extended user information (name, bio, educational level, etc.)
- `user_settings` - User preferences (study goals, UI preferences, AI settings)
- `user_streaks` - Study streak tracking
- `user_achievements` - User achievements and badges

### 002_create_study_materials.sql
**Purpose**: Study content management system
**Tables Created**:
- `subjects` - Academic subjects (Math, Science, History, etc.)
- `topics` - Sub-topics within subjects
- `study_materials` - Educational content (text, video, interactive)
- `user_study_materials` - User-created/saved materials
- `study_sessions` - Study session tracking
- `study_notes` - User notes and annotations

### 003_create_flashcards_and_quizzes.sql
**Purpose**: Interactive learning tools
**Tables Created**:
- `flashcard_decks` - Flashcard collections
- `flashcards` - Individual flashcards with spaced repetition
- `quizzes` - Quiz configurations
- `quiz_questions` - Individual quiz questions
- `quiz_attempts` - User quiz attempts and scores
- `user_progress` - Learning progress tracking
- `learning_analytics` - Detailed learning analytics

### 004_create_ai_and_recommendations.sql
**Purpose**: AI tutoring and personalized recommendations
**Tables Created**:
- `ai_conversations` - AI chat history
- `ai_messages` - Individual messages in AI conversations
- `recommendations` - Personalized content suggestions
- `learning_paths` - Structured learning sequences
- `learning_path_steps` - Individual steps in learning paths
- `user_learning_paths` - User progress in learning paths
- `adaptive_learning_data` - AI-driven personalization data
- `study_groups` - Collaborative study groups
- `study_group_members` - Group membership management

### 005_create_notifications_and_goals.sql
**Purpose**: User engagement and gamification
**Tables Created**:
- `notifications` - User notifications and alerts
- `user_activity_log` - Comprehensive activity tracking
- `daily_goals` - Daily study objectives
- `weekly_goals` - Weekly study objectives
- `monthly_challenges` - Gamification challenges
- `user_challenge_participation` - Challenge progress tracking
- `user_favorites` - Bookmarked content
- `user_sharing` - Content sharing between users
- `system_config` - Platform-wide configuration

### 006_create_rls_policies.sql
**Purpose**: Row Level Security policies for data protection
**Policies Created**: Comprehensive RLS policies for all tables ensuring:
- Users can only access their own data
- Public content is accessible to all authenticated users
- Proper permission levels for different user roles
- Data isolation and privacy protection

### 007_create_functions_and_triggers.sql
**Purpose**: Automated database processes
**Functions Created**:
- `update_user_streak()` - Automatically update study streaks
- `update_user_progress()` - Calculate and update learning progress
- `create_achievement_notification()` - Generate achievement notifications
- `check_streak_milestone()` - Check and celebrate streak milestones
- `update_daily_goals_progress()` - Update daily goal progress
- `update_flashcard_mastery()` - Apply spaced repetition algorithm
- `create_study_reminder()` - Generate study reminder notifications
- `generate_weekly_progress_report()` - Create weekly progress summaries

**Triggers Created**: Automated triggers for maintaining data consistency and generating notifications

## 🚀 How to Apply Migrations

### Method 1: Using Supabase CLI (Recommended)
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Initialize Supabase project (if not already done)
supabase init

# Apply migrations in order
supabase db push 001_create_users_and_profiles.sql
supabase db push 002_create_study_materials.sql
supabase db push 003_create_flashcards_and_quizzes.sql
supabase db push 004_create_ai_and_recommendations.sql
supabase db push 005_create_notifications_and_goals.sql
supabase db push 006_create_rls_policies.sql
supabase db push 007_create_functions_and_triggers.sql
```

### Method 2: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste each migration file content
4. Run them in order (001 through 007)

### Method 3: Using Supabase Apply Migration Tool
```bash
# Use the supabase_apply_migration tool if available
supabase_apply_migration --url YOUR_SUPABASE_URL --key YOUR_SERVICE_ROLE_KEY --file 001_create_users_and_profiles.sql
```

## 🔧 Configuration

### Environment Variables
Make sure your application has these environment variables configured:
```env
SUPABASE_URL=https://pyruouuawlrquytdykij.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5cnVvdXVhd2xycXV5dGR5a2lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MzYzODEsImV4cCI6MjA3OTIxMjM4MX0.XS_tXLI_Jzr9fKwsxuXtDu_n9OJMfI2N7cbU20RtKCI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5cnVvdXVhd2xycXV5dGR5a2lqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzYzNjM4MSwiZXhwIjoyMDc5MjEyMzgxfQ.eUbxT_2RshCn16FR7LxddixdtwapNbqZzWsSwHB2qNo
```

### Database Permissions
The migrations include proper permissions for:
- **Anonymous users**: Limited read access to public content
- **Authenticated users**: Full access to their own data, read access to public content
- **Service role**: Full administrative access

## 📊 Database Schema Overview

### Core Entities
- **Users**: Authentication and profile management
- **Content**: Study materials, subjects, topics
- **Learning Tools**: Flashcards, quizzes, learning paths
- **Progress Tracking**: Sessions, progress, analytics
- **AI Features**: Conversations, recommendations, adaptive learning
- **Social Features**: Study groups, sharing, challenges
- **Gamification**: Achievements, streaks, goals, notifications

### Key Relationships
- Users → Profiles, Settings, Progress (1:1)
- Users → Study Sessions, Notes, Achievements (1:N)
- Subjects → Topics → Study Materials (1:N)
- Users → Flashcard Decks, Quizzes (1:N)
- Users → AI Conversations, Recommendations (1:N)
- Study Groups → Members (N:M)

## 🛡️ Security Features

### Row Level Security (RLS)
- All user-specific data is protected with RLS policies
- Users can only access their own private data
- Public content is accessible to all authenticated users
- Proper permission checks for all operations

### Data Validation
- Check constraints for enum values
- Foreign key constraints for referential integrity
- Proper data types and length limits
- JSON validation for metadata fields

### Privacy Protection
- Personal data is isolated per user
- Sharing features require explicit user consent
- Activity logs respect user privacy settings
- GDPR-compliant data handling

## 🔄 Automated Processes

### Triggers and Functions
The database includes automated processes for:
- **Streak tracking**: Automatic streak updates and milestone notifications
- **Progress calculation**: Real-time learning progress updates
- **Spaced repetition**: Intelligent flashcard review scheduling
- **Goal tracking**: Daily/weekly goal progress updates
- **Notifications**: Automated achievement and reminder notifications
- **Analytics**: Learning pattern analysis and insights

### Scheduled Jobs (Cron)
Consider setting up these scheduled jobs:
```sql
-- Daily study reminder (runs at user preference time)
-- Weekly progress report generation
-- Cleanup expired recommendations
-- Archive old activity logs
-- Update learning analytics
```

## 📈 Performance Optimization

### Indexes
- Primary keys on all tables
- Foreign key indexes for join operations
- Composite indexes for common query patterns
- Full-text search indexes for content search

### Query Optimization
- Materialized views for complex analytics
- Proper query planning with EXPLAIN ANALYZE
- Connection pooling configuration
- Read replicas for scaling (if needed)

## 🔍 Monitoring and Maintenance

### Health Checks
- Database connection monitoring
- Query performance monitoring
- Storage usage tracking
- Error log monitoring

### Regular Maintenance
- Vacuum and analyze operations
- Index maintenance and rebuilding
- Backup verification
- Security audit logs

## 🆘 Troubleshooting

### Common Issues
1. **Permission Denied**: Check RLS policies and user roles
2. **Foreign Key Violations**: Ensure proper data insertion order
3. **Trigger Failures**: Check function permissions and logic
4. **Performance Issues**: Review indexes and query plans

### Debug Queries
```sql
-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check active connections
SELECT count(*), state 
FROM pg_stat_activity 
GROUP BY state;

-- Check RLS policies
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public';
```

## 📚 Next Steps

After applying these migrations:
1. **Test the authentication flow** with your existing login/register pages
2. **Update your frontend** to use the new database schema
3. **Configure scheduled jobs** for automated processes
4. **Set up monitoring** for database health and performance
5. **Implement backup strategies** for data protection

For support or questions, refer to the Supabase documentation or community forums.