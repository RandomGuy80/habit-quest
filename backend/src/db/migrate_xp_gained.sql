-- Migration: add xp_gained column to habit_completions
-- Run once on the server: psql -U postgres -d habitquest -f migrate_xp_gained.sql
ALTER TABLE habit_completions ADD COLUMN IF NOT EXISTS xp_gained INTEGER DEFAULT 0;
