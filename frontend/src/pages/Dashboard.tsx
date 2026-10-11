import { useEffect, useState, useCallback } from 'react';
import { Zap, CheckCircle2, Circle, Star, Plus, Droplets } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';

interface Habit {
  id: string; name: string; category: string; difficulty: string;
  color: string; current_streak: number;
}
interface XPPopup { id: number; text: string }

const quotes = [
  "Small steps lead to big victories!",
  "Every habit checked is a battle won!",
  "Consistency is your superpower!",
  "Today's effort is tomorrow's result!",
  "Keep the streak alive, hero!",
];

export default function Dashboard() {
  const { user, refreshUser, updateXP } = useAuthStore();
  const navigate = useNavigate();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [xpPopups, setXpPopups] = useState<XPPopup[]>([]);
  const today = new Date().toISOString().split('T')[0];
  const quote = quotes[new Date().getDay() % quotes.length];

  const load = useCallback(async () => {
    try {
      const [hRes, cRes] = await Promise.all([
        api.get('/habits'),
        api.get(`/habits/completions/today?date=${today}`),
      ]);
      setHabits(hRes.data);
      setCompleted(new Set(cRes.data));
    } finally { setLoading(false); }
  }, [today]);

  useEffect(() => { load(); }, [load]);

  const toggleHabit = async (habit: Habit) => {
    const isDone = completed.has(habit.id);
    try {
      if (!isDone) {
        const res = await api.post(`/habits/${habit.id}/complete`, { date: today });
        const { xpGained, xp, level, leveledUp } = res.data;
        updateXP(xp, level);
        const id = Date.now();
        setXpPopups(p => [...p, { id, text: `+${xpGained} XP${leveledUp ? ' ⚡ LEVEL UP!' : ''}` }]);
        setTimeout(() => setXpPopups(p => p.filter(x => x.id !== id)), 2500);
        setCompleted(p => new Set([...p, habit.id]));
        await load(); await refreshUser();
      } else {
        await api.post(`/habits/${habit.id}/uncomplete`, { date: today });
        setCompleted(p => { const s = new Set(p); s.delete(habit.id); return s; });
        await load();
      }
    } catch (err) { console.error(err); }
  };

  const completedCount = habits.filter(h => completed.has(h.id)).length;
  const pct = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;
  const maxStreak = habits.reduce((m, h) => Math.max(m, h.current_streak), 0);
  const circumference = 2 * Math.PI * 44;
  const dashOffset = circumference - (pct / 100) * circumference;

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="display text-4xl neon-text-purple animate-pulse">LOADING...</div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* XP popups */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {xpPopups.map(p => (
          <div key={p.id} className="neon-card-cyan px-4 py-2 display text-sm font-body neon-text-cyan animate-bounce">
            {p.text}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="mb-6">
        <p className="display text-2xl md:text-3xl text-white">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <p className="font-body text-sm italic mt-1" style={{ color: '#64748B' }}>"{quote}"</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

        {/* Progress ring */}
        <div className="neon-card p-5 flex items-center gap-5 sm:col-span-1">
          <svg width="96" height="96" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="44" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6"/>
            <circle cx="48" cy="48" r="44" fill="none"
              stroke={pct === 100 ? '#00FF88' : 'url(#ringGrad)'} strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={dashOffset}
              style={{ transformOrigin: '50% 50%', transform: 'rotate(-90deg)', transition: 'stroke-dashoffset 0.6s ease' }}
            />
            <defs>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7C3AED"/>
                <stop offset="100%" stopColor="#00F5FF"/>
              </linearGradient>
            </defs>
            <text x="48" y="44" textAnchor="middle" fill="white" fontSize="18" fontFamily="Russo One">{pct}%</text>
            <text x="48" y="60" textAnchor="middle" fill="#64748B" fontSize="10" fontFamily="Chakra Petch">today</text>
          </svg>
          <div>
            <p className="display text-3xl text-white">{completedCount}<span className="text-muted text-xl">/{habits.length}</span></p>
            <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>Completed</p>
            {pct === 100 && habits.length > 0 && (
              <p className="display text-sm neon-text-green mt-1">PERFECT DAY!</p>
            )}
          </div>
        </div>

        {/* Streak */}
        <div className="neon-card-cyan p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.3)' }}>
            <Droplets size={22} style={{ color: '#00F5FF' }} />
          </div>
          <div>
            <p className="display text-5xl neon-text-cyan leading-none">{maxStreak}</p>
            <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>Best streak</p>
          </div>
        </div>

        {/* Level */}
        <div className="neon-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Star size={16} style={{ color: '#A78BFA' }} />
            <span className="display text-lg neon-text-purple">LEVEL {user?.level}</span>
          </div>
          <div className="w-full rounded-full h-2 overflow-hidden mb-1" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div className="h-full rounded-full transition-all duration-700" style={{
              width: `${Math.min(((user?.xp ?? 0) / ((user?.level ?? 1) * 100)) * 100, 100)}%`,
              background: 'linear-gradient(90deg, #7C3AED, #00F5FF)',
              boxShadow: '0 0 8px rgba(0,245,255,0.5)',
            }}/>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Zap size={12} style={{ color: '#A78BFA' }} />
            <span className="text-xs font-body" style={{ color: '#64748B' }}>{user?.xp} / {(user?.level ?? 1) * 100} XP</span>
          </div>
        </div>
      </div>

      {/* Habits */}
      <div className="neon-card p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="display text-xl text-white tracking-wider">TODAY'S QUESTS</h3>
          <button onClick={() => navigate('/habits')} className="btn-neon flex items-center gap-1.5 px-3 py-1.5 text-xs">
            <Plus size={13} /> ADD HABIT
          </button>
        </div>

        {habits.length === 0 ? (
          <div className="text-center py-12">
            <p className="display text-2xl neon-text-purple mb-2">NO HABITS YET!</p>
            <p className="text-sm font-body mb-5" style={{ color: '#64748B' }}>Add your first quest to begin</p>
            <button onClick={() => navigate('/habits')} className="btn-neon">CREATE FIRST HABIT →</button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {habits.map(habit => {
              const done = completed.has(habit.id);
              return (
                <div key={habit.id} onClick={() => toggleHabit(habit)}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer select-none transition-all"
                  style={{
                    background: done ? 'rgba(0,255,136,0.05)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${done ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.06)'}`,
                    boxShadow: done ? '0 0 15px rgba(0,255,136,0.08)' : 'none',
                  }}
                >
                  {done
                    ? <CheckCircle2 size={22} style={{ color: '#00FF88', filter: 'drop-shadow(0 0 6px rgba(0,255,136,0.6))' }} />
                    : <Circle size={22} style={{ color: '#334155' }} />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold font-body truncate" style={{ color: done ? '#64748B' : '#E2E8F0', textDecoration: done ? 'line-through' : 'none' }}>
                      {habit.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-body" style={{ color: '#64748B' }}>{habit.category}</span>
                      <span className="neon-badge" style={{
                        background: habit.difficulty === 'hard' ? 'rgba(255,51,102,0.15)' : habit.difficulty === 'easy' ? 'rgba(0,255,136,0.12)' : 'rgba(124,58,237,0.15)',
                        color: habit.difficulty === 'hard' ? '#FF3366' : habit.difficulty === 'easy' ? '#00FF88' : '#A78BFA',
                      }}>{habit.difficulty}</span>
                    </div>
                  </div>
                  {habit.current_streak > 0 && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Droplets size={13} style={{ color: '#00F5FF' }} />
                      <span className="display text-sm neon-text-cyan">{habit.current_streak}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
