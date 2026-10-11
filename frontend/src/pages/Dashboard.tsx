import { useEffect, useState, useCallback } from 'react';
import { Flame, Zap, CheckCircle2, Circle, Star, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';

interface Habit {
  id: string; name: string; category: string; difficulty: string;
  color: string; current_streak: number; best_streak: number;
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
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const today = new Date().toISOString().split('T')[0];
  const quote = quotes[new Date().getDay() % quotes.length];

  const load = useCallback(async () => {
    try {
      const [habitsRes, completionsRes] = await Promise.all([
        api.get('/habits'),
        api.get(`/habits/completions/today?date=${today}`),
      ]);
      setHabits(habitsRes.data);
      setCompleted(new Set(completionsRes.data));
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => { load(); }, [load]);

  const toggleHabit = async (habit: Habit) => {
    const isDone = completed.has(habit.id);
    try {
      if (!isDone) {
        const res = await api.post(`/habits/${habit.id}/complete`, { date: today });
        const { xpGained, xp, level, leveledUp } = res.data;
        updateXP(xp, level);
        const popupId = Date.now();
        setXpPopups((prev) => [...prev, { id: popupId, text: `+${xpGained} XP${leveledUp ? ' 🎉 LEVEL UP!' : ''}` }]);
        setTimeout(() => setXpPopups((prev) => prev.filter((p) => p.id !== popupId)), 2500);
        setCompleted((prev) => new Set([...prev, habit.id]));
        await load();
        await refreshUser();
      } else {
        await api.post(`/habits/${habit.id}/uncomplete`, { date: today });
        setCompleted((prev) => { const s = new Set(prev); s.delete(habit.id); return s; });
        await load();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const completedCount = habits.filter((h) => completed.has(h.id)).length;
  const pct = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;
  const maxStreak = habits.reduce((m, h) => Math.max(m, h.current_streak), 0);

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="display-text text-4xl text-primary animate-pulse">LOADING...</div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* XP popups */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {xpPopups.map((p) => (
          <div key={p.id} className="comic-card-streak px-4 py-2 display-text text-streak text-xl animate-bounce">
            {p.text}
          </div>
        ))}
      </div>

      {/* Badge unlocked notifications */}
      {newBadges.map((b, i) => (
        <div key={i} className="fixed bottom-4 right-4 z-50 comic-card-streak px-4 py-3">
          <p className="display-text text-streak text-lg">BADGE UNLOCKED!</p>
          <p className="text-sm text-white font-body">{b}</p>
        </div>
      ))}

      {/* Header */}
      <div className="mb-6">
        <h2 className="display-text text-3xl text-white">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h2>
        <p className="text-muted font-body text-sm italic mt-1">"{quote}"</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Progress ring */}
        <div className="comic-card p-5 flex items-center gap-4">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#1E293B" strokeWidth="8"/>
            <circle
              cx="50" cy="50" r="45" fill="none"
              stroke={pct === 100 ? '#22C55E' : '#6366F1'} strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transformOrigin: '50% 50%', transform: 'rotate(-90deg)', transition: 'stroke-dashoffset 0.5s ease' }}
            />
            <text x="50" y="50" textAnchor="middle" dominantBaseline="central"
              fill="white" fontSize="20" fontFamily="Bangers">{pct}%</text>
          </svg>
          <div>
            <p className="display-text text-2xl text-white">{completedCount}/{habits.length}</p>
            <p className="text-muted text-sm font-body">Today's tasks</p>
            {pct === 100 && habits.length > 0 && (
              <p className="display-text text-success text-sm mt-1">PERFECT DAY!</p>
            )}
          </div>
        </div>

        {/* Streak */}
        <div className="comic-card-streak p-5 flex items-center gap-4">
          <Flame size={48} className="text-streak flex-shrink-0" />
          <div>
            <p className="display-text text-5xl text-streak leading-none">{maxStreak}</p>
            <p className="text-muted text-sm font-body">Best streak (days)</p>
          </div>
        </div>

        {/* Level */}
        <div className="comic-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Star size={20} className="text-streak" />
            <span className="display-text text-streak text-xl">LEVEL {user?.level}</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} className="text-primary" />
            <span className="text-sm text-muted font-body">{user?.xp} / {(user?.level ?? 1) * 100} XP</span>
          </div>
          <div className="w-full bg-bg rounded-full h-2 border border-white/20">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min(((user?.xp ?? 0) / ((user?.level ?? 1) * 100)) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Habit list */}
      <div className="comic-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="display-text text-2xl text-white">TODAY'S QUESTS</h3>
          <button onClick={() => navigate('/habits')} className="btn-primary flex items-center gap-1 text-sm px-3 py-1.5">
            <Plus size={14} /> Add Habit
          </button>
        </div>

        {habits.length === 0 ? (
          <div className="text-center py-10">
            <p className="display-text text-2xl text-muted">NO HABITS YET!</p>
            <p className="text-muted font-body text-sm mt-2">Add your first quest to begin your journey</p>
            <button onClick={() => navigate('/habits')} className="btn-primary mt-4">
              CREATE FIRST HABIT →
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {habits.map((habit) => {
              const done = completed.has(habit.id);
              return (
                <div
                  key={habit.id}
                  onClick={() => toggleHabit(habit)}
                  className={`flex items-center gap-4 p-3 rounded-xl border-2 cursor-pointer transition-all select-none ${
                    done
                      ? 'border-success bg-success/10'
                      : 'border-white/10 bg-bg hover:border-primary hover:bg-primary/5'
                  }`}
                  style={{ boxShadow: done ? '3px 3px 0px #22C55E' : '3px 3px 0px rgba(255,255,255,0.05)' }}
                >
                  {done
                    ? <CheckCircle2 size={24} className="text-success flex-shrink-0" />
                    : <Circle size={24} className="text-muted flex-shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold font-body truncate ${done ? 'line-through text-muted' : 'text-white'}`}>
                      {habit.name}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-muted font-body capitalize">{habit.category}</span>
                      <span className={`text-xs font-body px-1.5 py-0.5 rounded capitalize ${
                        habit.difficulty === 'hard' ? 'bg-danger/20 text-danger' :
                        habit.difficulty === 'easy' ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'
                      }`}>{habit.difficulty}</span>
                    </div>
                  </div>
                  {habit.current_streak > 0 && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Flame size={14} className="text-streak" />
                      <span className="display-text text-streak text-sm">{habit.current_streak}</span>
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
