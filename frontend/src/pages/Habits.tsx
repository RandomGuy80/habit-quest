import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Droplets, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../api/client';

interface Habit {
  id: string; name: string; category: string; difficulty: string;
  color: string; icon: string; notes: string; current_streak: number;
  best_streak: number; total_completions: number; frequency: string[];
}

const CATEGORIES = ['General', 'Health', 'Mind', 'Work', 'Sport', 'Learning', 'Social'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const COLORS = ['#A78BFA', '#00F5FF', '#00FF88', '#FF3366', '#F97316', '#7C3AED', '#B026FF', '#00B4D8'];
const DAYS = ['mon','tue','wed','thu','fri','sat','sun'];

const empty = {
  name: '', category: 'General', difficulty: 'medium',
  color: '#A78BFA', icon: 'star', notes: '',
  frequency: ['mon','tue','wed','thu','fri','sat','sun'],
};

const diffStyle = (d: string) => ({
  hard: { background: 'rgba(255,51,102,0.15)', color: '#FF3366' },
  easy: { background: 'rgba(0,255,136,0.12)', color: '#00FF88' },
  medium: { background: 'rgba(124,58,237,0.15)', color: '#A78BFA' },
}[d] ?? {});

export default function Habits() {
  const { t } = useTranslation();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => { const res = await api.get('/habits'); setHabits(res.data); };
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(empty); setEditing(null); setShowModal(true); };
  const openEdit = (h: Habit) => {
    setForm({ name: h.name, category: h.category, difficulty: h.difficulty,
      color: h.color, icon: h.icon, notes: h.notes || '',
      frequency: Array.isArray(h.frequency) ? h.frequency : JSON.parse(h.frequency as any || '[]') });
    setEditing(h); setShowModal(true);
  };

  const toggleDay = (day: string) =>
    setForm((f) => ({
      ...f,
      frequency: f.frequency.includes(day) ? f.frequency.filter((d) => d !== day) : [...f.frequency, day],
    }));

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editing) await api.put(`/habits/${editing.id}`, form);
      else await api.post('/habits', form);
      setShowModal(false);
      await load();
    } finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm(t('habits.deleteConfirm'))) return;
    await api.delete(`/habits/${id}`);
    await load();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="display text-3xl neon-text-purple">{t('habits.title')}</h2>
        <button onClick={openNew} className="btn-neon flex items-center gap-2">
          <Plus size={15} /> {t('habits.addHabit')}
        </button>
      </div>

      {habits.length === 0 ? (
        <div className="neon-card p-12 text-center">
          <p className="display text-3xl neon-text-purple mb-2">{t('habits.noHabits')}</p>
          <p className="text-sm font-body mt-2 mb-6" style={{ color: '#64748B' }}>{t('habits.noHabitsDesc')}</p>
          <button onClick={openNew} className="btn-neon">{t('habits.createFirst')}</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map((h) => (
            <div key={h.id} className="rounded-xl p-4 transition-all"
              style={{
                background: 'rgba(15,15,26,0.9)',
                border: `1px solid ${h.color}60`,
                boxShadow: `0 0 20px ${h.color}15`,
              }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: h.color, boxShadow: `0 0 6px ${h.color}` }} />
                    <h3 className="font-semibold text-white font-body truncate">{h.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-body" style={{ color: '#64748B' }}>{h.category}</span>
                    <span className="neon-badge" style={diffStyle(h.difficulty)}>{h.difficulty}</span>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(h)}
                    className="p-1.5 rounded-lg transition-colors cursor-pointer"
                    style={{ color: '#64748B' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#A78BFA')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}>
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => remove(h.id)}
                    className="p-1.5 rounded-lg transition-colors cursor-pointer"
                    style={{ color: '#64748B' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#FF3366')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-1.5">
                  <Droplets size={13} style={{ color: '#00F5FF' }} />
                  <span className="display text-sm neon-text-cyan">{h.current_streak}</span>
                  <span className="text-xs font-body" style={{ color: '#64748B' }}>{t('common.streak')}</span>
                </div>
                <span className="text-xs font-body" style={{ color: '#64748B' }}>{h.total_completions} {t('common.total')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="neon-card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="display text-2xl neon-text-purple">{editing ? t('habits.editHabit') : t('habits.newHabit')}</h3>
              <button onClick={() => setShowModal(false)}
                className="cursor-pointer transition-colors"
                style={{ color: '#64748B' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#E2E8F0')}
                onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}>
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-body tracking-widest block mb-1.5" style={{ color: '#64748B' }}>{t('habits.name')}</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="neon-input" placeholder={t('habits.namePlaceholder')}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-body tracking-widest block mb-1.5" style={{ color: '#64748B' }}>{t('habits.category')}</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="neon-input cursor-pointer"
                    style={{ appearance: 'none' }}
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c} style={{ background: '#0F0F1A' }}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-body tracking-widest block mb-1.5" style={{ color: '#64748B' }}>{t('habits.difficulty')}</label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}
                    className="neon-input cursor-pointer"
                    style={{ appearance: 'none' }}
                  >
                    {DIFFICULTIES.map((d) => <option key={d} value={d} style={{ background: '#0F0F1A' }}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-body tracking-widest block mb-2" style={{ color: '#64748B' }}>{t('habits.color')}</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button key={c} onClick={() => setForm((f) => ({ ...f, color: c }))}
                      className="w-7 h-7 rounded-full cursor-pointer transition-transform hover:scale-110"
                      style={{
                        background: c,
                        boxShadow: form.color === c ? `0 0 10px ${c}, 0 0 20px ${c}80` : 'none',
                        outline: form.color === c ? `2px solid white` : 'none',
                        outlineOffset: '2px',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-body tracking-widest block mb-2" style={{ color: '#64748B' }}>{t('habits.days')}</label>
                <div className="flex gap-1.5">
                  {DAYS.map((d) => (
                    <button key={d} onClick={() => toggleDay(d)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-body font-semibold cursor-pointer transition-all uppercase"
                      style={form.frequency.includes(d) ? {
                        background: 'linear-gradient(135deg, #7C3AED, #B026FF)',
                        color: 'white',
                        boxShadow: '0 0 10px rgba(176,38,255,0.4)',
                        border: 'none',
                      } : {
                        background: 'rgba(255,255,255,0.03)',
                        color: '#64748B',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >{d.slice(0, 1)}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-body tracking-widest block mb-1.5" style={{ color: '#64748B' }}>{t('habits.notes')}</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="neon-input resize-none"
                  rows={2} placeholder={t('habits.notesPlaceholder')}
                />
              </div>

              <div className="flex gap-3 mt-1">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded-lg font-body text-sm cursor-pointer transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#64748B', background: 'transparent' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#E2E8F0'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.3)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#64748B'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}>
                  {t('common.cancel')}
                </button>
                <button onClick={save} disabled={saving || !form.name.trim()} className="flex-1 btn-neon disabled:opacity-50">
                  {saving ? t('common.saving') : editing ? t('common.update') : t('common.create')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
