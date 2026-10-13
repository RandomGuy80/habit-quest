import { Response } from 'express';
import { pool } from '../db/pool';
import { AuthRequest } from '../middleware/auth';
import { checkAndGrantAchievements } from './achievementsController';

const XP_MAP = { easy: 10, medium: 20, hard: 35 };
const LEVEL_XP = (level: number) => level * 100;

async function addXP(userId: string, amount: number): Promise<{ xp: number; level: number; leveledUp: boolean }> {
  const res = await pool.query('SELECT xp, level FROM users WHERE id = $1', [userId]);
  let { xp, level } = res.rows[0];
  xp += amount;
  let leveledUp = false;
  while (xp >= LEVEL_XP(level)) {
    xp -= LEVEL_XP(level);
    level++;
    leveledUp = true;
  }
  await pool.query('UPDATE users SET xp = $1, level = $2 WHERE id = $3', [xp, level, userId]);
  return { xp, level, leveledUp };
}

async function subtractXP(userId: string, amount: number): Promise<{ xp: number; level: number }> {
  const res = await pool.query('SELECT xp, level FROM users WHERE id = $1', [userId]);
  let { xp, level } = res.rows[0];
  xp = Math.max(0, xp - amount);
  await pool.query('UPDATE users SET xp = $1, level = $2 WHERE id = $3', [xp, level, userId]);
  return { xp, level };
}

export async function getHabits(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await pool.query(
      'SELECT * FROM habits WHERE user_id = $1 AND archived = false ORDER BY created_at ASC',
      [req.userId]
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
}

export async function createHabit(req: AuthRequest, res: Response): Promise<void> {
  const { name, category, difficulty, frequency, color, icon, notes } = req.body;
  if (!name) { res.status(400).json({ error: 'Name required' }); return; }
  try {
    const result = await pool.query(
      `INSERT INTO habits (user_id, name, category, difficulty, frequency, color, icon, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.userId, name, category || 'General', difficulty || 'medium',
       JSON.stringify(frequency || ['mon','tue','wed','thu','fri','sat','sun']),
       color || '#6366F1', icon || 'star', notes || null]
    );
    await checkAndGrantAchievements(req.userId!, 'habit_created');
    res.status(201).json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
}

export async function updateHabit(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { name, category, difficulty, frequency, color, icon, notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE habits SET name=$1, category=$2, difficulty=$3, frequency=$4, color=$5, icon=$6, notes=$7
       WHERE id=$8 AND user_id=$9 RETURNING *`,
      [name, category, difficulty, JSON.stringify(frequency), color, icon, notes, id, req.userId]
    );
    if (!result.rows[0]) { res.status(404).json({ error: 'Habit not found' }); return; }
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
}

export async function deleteHabit(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  try {
    await pool.query('UPDATE habits SET archived = true WHERE id = $1 AND user_id = $2', [id, req.userId]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
}

export async function completeHabit(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const date = req.body.date || new Date().toISOString().split('T')[0];
  try {
    const habitRes = await pool.query('SELECT * FROM habits WHERE id = $1 AND user_id = $2', [id, req.userId]);
    const habit = habitRes.rows[0];
    if (!habit) { res.status(404).json({ error: 'Habit not found' }); return; }

    await pool.query(
      'INSERT INTO habit_completions (habit_id, user_id, completed_date) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [id, req.userId, date]
    );

    // recalculate streak
    const completions = await pool.query(
      'SELECT completed_date FROM habit_completions WHERE habit_id=$1 ORDER BY completed_date DESC',
      [id]
    );
    const dates = completions.rows.map((r: any) => r.completed_date.toISOString().split('T')[0]);
    let streak = 0;
    let cur = new Date(date);
    for (let i = 0; i < dates.length; i++) {
      const expected = cur.toISOString().split('T')[0];
      if (dates[i] === expected) {
        streak++;
        cur.setDate(cur.getDate() - 1);
      } else break;
    }
    const bestStreak = Math.max(habit.best_streak, streak);
    const totalCompletions = habit.total_completions + 1;
    await pool.query(
      'UPDATE habits SET current_streak=$1, best_streak=$2, total_completions=$3 WHERE id=$4',
      [streak, bestStreak, totalCompletions, id]
    );

    // Count completions today (current insert already committed)
    const todayDayName = ['sun','mon','tue','wed','thu','fri','sat'][new Date(date).getDay()];
    const [todayRes, totalHabitsRes] = await Promise.all([
      pool.query(
        'SELECT COUNT(*) as count FROM habit_completions WHERE user_id=$1 AND completed_date=$2',
        [req.userId, date]
      ),
      pool.query(
        `SELECT COUNT(*) as count FROM habits WHERE user_id=$1 AND archived=false AND frequency @> $2::jsonb`,
        [req.userId, JSON.stringify([todayDayName])]
      ),
    ]);
    const completionsToday = Number(todayRes.rows[0].count);
    const totalHabits = Number(totalHabitsRes.rows[0].count);

    // Combo bonus: +5 XP per habit already done today before this one, max +25
    const comboCount = completionsToday - 1;
    const comboBonus = comboCount >= 1 ? Math.min(comboCount * 5, 25) : 0;

    // Perfect day bonus: all today's habits done
    const perfectDay = totalHabits > 0 && completionsToday >= totalHabits;
    const perfectDayBonus = perfectDay ? 50 : 0;

    const xpGain = (XP_MAP[habit.difficulty as keyof typeof XP_MAP] || 20) + comboBonus + perfectDayBonus;
    const xpResult = await addXP(req.userId!, xpGain);

    // Store xp_gained so it can be reversed on uncomplete
    await pool.query(
      'UPDATE habit_completions SET xp_gained = $1 WHERE habit_id=$2 AND user_id=$3 AND completed_date=$4',
      [xpGain, id, req.userId, date]
    );

    await checkAndGrantAchievements(req.userId!, 'habit_completed', { streak, totalCompletions, habitId: id });

    res.json({ streak, bestStreak, totalCompletions, xpGained: xpGain, comboBonus, comboCount, perfectDay, perfectDayBonus, ...xpResult });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function uncompleteHabit(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const date = req.body.date || new Date().toISOString().split('T')[0];
  try {
    // Fetch xp_gained before deleting so we can reverse it
    const compRes = await pool.query(
      'SELECT xp_gained FROM habit_completions WHERE habit_id=$1 AND user_id=$2 AND completed_date=$3',
      [id, req.userId, date]
    );
    const xpToRemove: number = compRes.rows[0]?.xp_gained ?? 0;

    await pool.query(
      'DELETE FROM habit_completions WHERE habit_id=$1 AND user_id=$2 AND completed_date=$3',
      [id, req.userId, date]
    );

    const xpResult = await subtractXP(req.userId!, xpToRemove);

    const completions = await pool.query(
      'SELECT completed_date FROM habit_completions WHERE habit_id=$1 ORDER BY completed_date DESC',
      [id]
    );
    const dates = completions.rows.map((r: any) => r.completed_date.toISOString().split('T')[0]);
    let streak = 0;
    let cur = new Date();
    for (let i = 0; i < dates.length; i++) {
      if (dates[i] === cur.toISOString().split('T')[0]) {
        streak++;
        cur.setDate(cur.getDate() - 1);
      } else break;
    }
    const habitRes = await pool.query('SELECT best_streak, total_completions FROM habits WHERE id=$1', [id]);
    const { best_streak, total_completions } = habitRes.rows[0];
    await pool.query(
      'UPDATE habits SET current_streak=$1, total_completions=$2 WHERE id=$3',
      [streak, Math.max(0, total_completions - 1), id]
    );
    res.json({ streak, bestStreak: best_streak, xpRemoved: xpToRemove, ...xpResult });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
}

export async function getTodayCompletions(req: AuthRequest, res: Response): Promise<void> {
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  try {
    const result = await pool.query(
      'SELECT habit_id FROM habit_completions WHERE user_id=$1 AND completed_date=$2',
      [req.userId, date]
    );
    res.json(result.rows.map((r: any) => r.habit_id));
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
}

export async function getHeatmap(req: AuthRequest, res: Response): Promise<void> {
  try {
    const result = await pool.query(
      `SELECT completed_date, COUNT(*) as count
       FROM habit_completions WHERE user_id=$1
       AND completed_date >= NOW() - INTERVAL '1 year'
       GROUP BY completed_date ORDER BY completed_date`,
      [req.userId]
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
}

export const getWeeklyRecap = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const [completionsRes, habitsRes, topRes] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) as count FROM habit_completions hc
         JOIN habits h ON h.id = hc.habit_id
         WHERE h.user_id = $1 AND hc.completed_date >= NOW() - INTERVAL '7 days'`,
        [userId]
      ),
      pool.query(`SELECT COUNT(*) as count FROM habits WHERE user_id = $1 AND archived = false`, [userId]),
      pool.query(
        `SELECT h.name, COUNT(*) as cnt FROM habit_completions hc
         JOIN habits h ON h.id = hc.habit_id
         WHERE h.user_id = $1 AND hc.completed_date >= NOW() - INTERVAL '7 days'
         GROUP BY h.id, h.name ORDER BY cnt DESC LIMIT 1`,
        [userId]
      ),
    ]);
    const completionsThisWeek = Number(completionsRes.rows[0].count);
    const totalHabits = Number(habitsRes.rows[0].count);
    res.json({
      completionsThisWeek,
      weeklyGoal: totalHabits * 7,
      xpEstimate: completionsThisWeek * 15,
      topHabit: topRes.rows[0]?.name ?? null,
      totalHabits,
    });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export const useStreakFreeze = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { habitId, date } = req.body;
    const userRes = await pool.query('SELECT streak_freeze_count FROM users WHERE id = $1', [userId]);
    if (!userRes.rows[0] || userRes.rows[0].streak_freeze_count <= 0) {
      return res.status(400).json({ error: 'No streak freezes available' });
    }
    const habitRes = await pool.query('SELECT id FROM habits WHERE id = $1 AND user_id = $2', [habitId, userId]);
    if (!habitRes.rows[0]) return res.status(404).json({ error: 'Habit not found' });
    await pool.query(
      'INSERT INTO habit_completions (habit_id, user_id, completed_date) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [habitId, userId, date]
    );
    await pool.query('UPDATE users SET streak_freeze_count = streak_freeze_count - 1 WHERE id = $1', [userId]);
    const updatedUser = await pool.query('SELECT streak_freeze_count FROM users WHERE id = $1', [userId]);
    res.json({ freezesLeft: updatedUser.rows[0].streak_freeze_count, streakSaved: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
};

export async function getStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const [habitsRes, totalRes, weekRes, userRes] = await Promise.all([
      pool.query('SELECT * FROM habits WHERE user_id=$1 AND archived=false', [req.userId]),
      pool.query('SELECT COUNT(*) as total FROM habit_completions WHERE user_id=$1', [req.userId]),
      pool.query(
        `SELECT completed_date, COUNT(*) as count FROM habit_completions
         WHERE user_id=$1 AND completed_date >= NOW() - INTERVAL '7 days'
         GROUP BY completed_date ORDER BY completed_date`,
        [req.userId]
      ),
      pool.query('SELECT xp, level FROM users WHERE id=$1', [req.userId]),
    ]);
    const habits = habitsRes.rows;
    const bestStreak = habits.reduce((m: number, h: any) => Math.max(m, h.best_streak), 0);
    const currentStreak = habits.reduce((m: number, h: any) => Math.max(m, h.current_streak), 0);
    res.json({
      totalHabits: habits.length,
      totalCompletions: parseInt(totalRes.rows[0].total),
      bestStreak,
      currentStreak,
      weeklyData: weekRes.rows,
      xp: userRes.rows[0].xp,
      level: userRes.rows[0].level,
    });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
}
