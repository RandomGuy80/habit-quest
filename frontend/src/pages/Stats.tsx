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
  if (count === 0) return '#0D1117';
  if (count === 1) return '#0e4155';
  if (count === 2) return '#0a7ea4';
  if (count === 3) return '#22D3EE';
  return '#67e8f9';
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
      <div className="display-text text-4xl text-primary animate-pulse">LOADING...</div>
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
    { label: 'TOTAL HABITS', value: stats.totalHabits, icon: Target, color: '#818CF8' },
    { label: 'TOTAL COMPLETIONS', value: stats.totalCompletions, icon: Trophy, color: '#22D3EE' },
    { label: 'BEST STREAK', value: `${stats.bestStreak}d`, icon: Droplets, color: '#22D3EE' },
    { label: 'CURRENT STREAK', value: `${stats.currentStreak}d`, icon: TrendingUp, color: '#10B981' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="display-text text-3xl text-white mb-6">YOUR STATS</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card rounded-xl border-2 p-4 text-center"
            style={{ borderColor: color, boxShadow: `4px 4px 0px ${color}50` }}>
            <Icon size={24} className="mx-auto mb-2" style={{ color }} />
            <p className="display-text text-3xl" style={{ color }}>{value}</p>
            <p className="text-xs text-muted font-body mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="comic-card p-5 mb-6">
        <h3 className="display-text text-xl text-white mb-4">LAST 7 DAYS</h3>
        {chartData.length === 0 ? (
          <p className="text-muted font-body text-center py-8">No data yet — start completing habits!</p>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#111827" />
              <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 12, fontFamily: 'Poppins' }} />
              <YAxis tick={{ fill: '#64748B', fontSize: 12, fontFamily: 'Poppins' }} />
              <Tooltip
                contentStyle={{ background: '#0D1117', border: '2px solid #818CF8', borderRadius: 8, fontFamily: 'Poppins', fontSize: 12 }}
                labelStyle={{ color: '#F1F5F9' }}
                itemStyle={{ color: '#818CF8' }}
              />
              <Bar dataKey="completions" fill="#818CF8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="comic-card p-5">
        <h3 className="display-text text-xl text-white mb-4">ACTIVITY (PAST YEAR)</h3>
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
                      className="w-3 h-3 rounded-sm border border-white/5"
                      style={{ background: getHeatmapColor(cell.count) }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3 justify-end">
            <span className="text-xs text-muted font-body">Less</span>
            {[0, 1, 2, 3, 4].map((n) => (
              <div key={n} className="w-3 h-3 rounded-sm" style={{ background: getHeatmapColor(n) }} />
            ))}
            <span className="text-xs text-muted font-body">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
