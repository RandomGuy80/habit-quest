import { Response } from 'express';
import { pool } from '../db/pool';
import { AuthRequest } from '../middleware/auth';

export async function checkAndGrantAchievements(
  userId: string,
  event: string,
  ctx: Record<string, any> = {}
): Promise<string[]> {
  const unlocked: string[] = [];

  const grant = async (code: string) => {
    const ach = await pool.query('SELECT * FROM achievements WHERE code=$1', [code]);
    if (!ach.rows[0]) return;
    const already = await pool.query(
      'SELECT id FROM user_achievements WHERE user_id=$1 AND achievement_id=$2',
      [userId, ach.rows[0].id]
    );
    if (already.rows.length > 0) return;
    await pool.query(
      'INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, $2)',
      [userId, ach.rows[0].id]
    );
    await pool.query('UPDATE users SET xp = xp + $1 WHERE id = $2', [ach.rows[0].xp_reward, userId]);
    unlocked.push(code);
  };

  if (event === 'habit_created') {
    await grant('first_habit');
    const count = await pool.query('SELECT COUNT(*) FROM habits WHERE user_id=$1 AND archived=false', [userId]);
    if (parseInt(count.rows[0].count) >= 5) await grant('habits_5');
  }

  if (event === 'habit_completed') {
    await grant('first_complete');
    const { streak, totalCompletions } = ctx;
    if (streak >= 3) await grant('streak_3');
    if (streak >= 7) await grant('streak_7');
    if (streak >= 30) await grant('streak_30');
    if (streak >= 100) await grant('streak_100');
    if (totalCompletions >= 100) await grant('total_100');

    const userRes = await pool.query('SELECT level FROM users WHERE id=$1', [userId]);
    const level = userRes.rows[0].level;
    if (level >= 5) await grant('level_5');
    if (level >= 10) await grant('level_10');
    if (level >= 25) await grant('level_25');
  }

  if (event === 'perfect_day') {
    await grant('perfect_day');
  }

  return unlocked;
}

export async function getAchievements(req: AuthRequest, res: Response): Promise<void> {
  try {
    const all = await pool.query('SELECT * FROM achievements ORDER BY tier, name');
    const unlocked = await pool.query(
      `SELECT achievement_id, unlocked_at FROM user_achievements WHERE user_id=$1`,
      [req.userId]
    );
    const unlockedMap = new Map(unlocked.rows.map((r: any) => [r.achievement_id, r.unlocked_at]));
    const result = all.rows.map((a: any) => ({
      ...a,
      unlocked: unlockedMap.has(a.id),
      unlocked_at: unlockedMap.get(a.id) || null,
    }));
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
}
