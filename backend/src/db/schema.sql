CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_freeze_count INTEGER DEFAULT 0,
  day_reset_hour INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) DEFAULT 'General',
  difficulty VARCHAR(10) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  frequency JSONB DEFAULT '["mon","tue","wed","thu","fri","sat","sun"]',
  color VARCHAR(7) DEFAULT '#6366F1',
  icon VARCHAR(50) DEFAULT 'star',
  notes TEXT,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  archived BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS habit_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, completed_date)
);

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(50) NOT NULL,
  tier VARCHAR(10) DEFAULT 'common' CHECK (tier IN ('common', 'rare', 'epic', 'legendary')),
  xp_reward INTEGER DEFAULT 50
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

INSERT INTO achievements (code, name, description, icon, tier, xp_reward) VALUES
  ('first_habit', 'First Steps', 'Create your first habit', 'footprints', 'common', 25),
  ('first_complete', 'Initiated!', 'Complete a habit for the first time', 'check-circle', 'common', 25),
  ('streak_3', 'On a Roll', '3-day streak on any habit', 'flame', 'common', 50),
  ('streak_7', '7-Day Warrior', '7-day streak on any habit', 'swords', 'rare', 100),
  ('streak_30', 'Unstoppable', '30-day streak on any habit', 'zap', 'epic', 300),
  ('streak_100', 'Legend', '100-day streak on any habit', 'crown', 'legendary', 1000),
  ('perfect_day', 'Perfect Day', 'Complete all habits in one day', 'sparkles', 'rare', 150),
  ('perfect_week', 'Perfect Week', 'Perfect day 7 days in a row', 'trophy', 'epic', 500),
  ('level_5', 'Rising Star', 'Reach level 5', 'star', 'common', 100),
  ('level_10', 'Veteran', 'Reach level 10', 'medal', 'rare', 200),
  ('level_25', 'Elite', 'Reach level 25', 'gem', 'epic', 500),
  ('habits_5', 'Collector', 'Create 5 habits', 'layers', 'common', 50),
  ('total_100', 'Century Club', '100 total habit completions', 'target', 'rare', 200)
ON CONFLICT (code) DO NOTHING;
