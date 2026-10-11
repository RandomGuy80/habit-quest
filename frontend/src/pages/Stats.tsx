import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Droplets, Target, Trophy, TrendingUp } from 'lucide-react';
import api from '../api/client';

interface HeatmapEntry { completed_date: string; count: number }
interface WeekEntry { completed_date: string; count: number }
interface Stats {
  totalHabits: number; totalCompletions: number;
  bestStreak: number; currentStreak: number;
  weeklyData: WeekEntry[]; xp: number; level: number;
}

function getHeatmapColor(count: number) {
  if (count === 0) return 'rgba(255,255,255,0.03)';
  if (count === 1) return 'rgba(124,58,237,0.35)';
  if (count === 2) return 'rgba(124,58,237,0.6)';
  if (count === 3) return 'rgba(0,245,255,0.5)';
  return '#00F5FF';
}

export default function Stats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/habits/stats/summary'), api.get('/habits/stats/heatmap')]).then(([s, h]) => {
      setStats(s.data); setHeatmap(h.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="display text-4xl neon-text-purple animate-pulse">LOADING...</div>
    </div>
  );
  if (!stats) return null;

  const heatmapMap = new Map(heatmap.map((e) => [e.completed_date.split('T')[0], Number(e.count)]));
  const today = new Date();
  const cells: { date: string; count: number }[] = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    cells.push({ date: key, count: heatmapMap.get(key) || 0 });
  }

  const chartData = stats.weeklyData.map((d) => ({
    day: new Date(d.completed_date).toLocaleDateString('en-US', { weekday: 'short' }),
    completions: Number(d.count),
  }));

  const statCards = [
    { label: 'TOTAL HABITS', value: stats.totalHabits, icon: Target, neon: 'neon-card', textColor: '#A78BFA' },
    { label: 'COMPLETIONS', value: stats.totalCompletions, icon: Trophy, neon: 'neon-card-cyan', textColor: '#00F5FF' },
    { label: 'BEST STREAK', value: `${stats.bestStreak}`, suffix: 'd', icon: Droplets, neon: 'neon-card-cyan', textColor: '#00F5FF' },
    { label: 'CURRENT STREAK', value: `${stats.currentStreak}`, suffix: 'd', icon: TrendingUp, neon: 'neon-card-success', textColor: '#00FF88' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="display text-3xl neon-text-purple mb-6">YOUR STATS</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {statCards.map(({ label, value, suffix, icon: Icon, neon, textColor }) => (
          <div key={label} className={`${neon} p-4 text-center`}>
            <Icon size={22} className="mx-auto mb-2" style={{ color: textColor }} />
            <p className="display text-3xl leading-none" style={{ color: textColor, textShadow: `0 0 15px ${textColor}80` }}>
              {value}{suffix && <span className="text-xl">{suffix}</span>}
            </p>
            <p className="text-xs font-body mt-1.5 tracking-wider" style={{ color: '#64748B' }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="neon-card p-5 mb-6">
        <h3 className="display text-xl neon-text-purple mb-5">LAST 7 DAYS</h3>
        {chartData.length === 0 ? (
          <p className="font-body text-center py-8" style={{ color: '#64748B' }}>No data yet — start completing habits!</p>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 12, fontFamily: 'Chakra Petch' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 12, fontFamily: 'Chakra Petch' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0F0F1A', border: '1px solid rgba(124,58,237,0.5)', borderRadius: 8, fontFamily: 'Chakra Petch', fontSize: 12 }}
                labelStyle={{ color: '#E2E8F0' }}
                itemStyle={{ color: '#A78BFA' }}
                cursor={{ fill: 'rgba(124,58,237,0.08)' }}
              />
              <Bar dataKey="completions" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => (
                  <rect key={i} fill="url(#barGrad)" />
                ))}
              </Bar>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#B026FF" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="neon-card p-5">
        <h3 className="display text-xl neon-text-purple mb-5">ACTIVITY — PAST YEAR</h3>
        <div className="overflow-x-auto">
          <div className="flex gap-1" style={{ minWidth: 700 }}>
            {Array.from({ length: 53 }).map((_, week) => (
              <div key={week} className="flex flex-col gap-1">
                {Array.from({ length: 7 }).map((_, day) => {
                  const idx = week * 7 + day;
                  if (idx >= cells.length) return <div key={day} className="w-3 h-3" />;
                  const cell = cells[idx];
                  return (
                    <div key={day} title={`${cell.date}: ${cell.count} completions`}
                      className="w-3 h-3 rounded-sm"
                      style={{
                        background: getHeatmapColor(cell.count),
                        boxShadow: cell.count >= 3 ? '0 0 4px rgba(0,245,255,0.6)' : cell.count >= 1 ? '0 0 3px rgba(124,58,237,0.4)' : 'none',
                        border: '1px solid rgba(255,255,255,0.04)',
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-4 justify-end">
            <span className="text-xs font-body" style={{ color: '#64748B' }}>Less</span>
            {[0, 1, 2, 3, 4].map((n) => (
              <div key={n} className="w-3 h-3 rounded-sm" style={{ background: getHeatmapColor(n), border: '1px solid rgba(255,255,255,0.04)' }} />
            ))}
            <span className="text-xs font-body" style={{ color: '#64748B' }}>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
