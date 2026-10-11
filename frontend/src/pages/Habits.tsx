import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Droplets, X } from 'lucide-react';
import api from '../api/client';

interface Habit {
  id: string; name: string; category: string; difficulty: string;
  color: string; icon: string; notes: string; current_streak: number;
  best_streak: number; total_completions: number; frequency: string[];
}

const CATEGORIES = ['General', 'Health', 'Mind', 'Work', 'Sport', 'Learning', 'Social'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const COLORS = ['#818CF8', '#22D3EE', '#10B981', '#EF4444', '#EC4899', '#A78BFA', '#F97316', '#06B6D4'];
const DAYS = ['mon','tue','wed','thu','fri','sat','sun'];

const empty = {
  name: '', category: 'General', difficulty: 'medium',
  color: '#818CF8', icon: 'star', notes: '',
  frequency: ['mon','tue','wed','thu','fri','sat','sun'],
};

export default function Habits() {
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

  const toggleDay = (day: string) => {
    setForm((f) => ({
      ...f,
      frequency: f.frequency.includes(day) ? f.frequency.filter((d) => d !== day) : [...f.frequency, day],
    }));
  };

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editing) { await api.put(`/habits/${editing.id}`, form); }
      else { await api.post('/habits', form); }
      setShowModal(false);
      await load();
    } finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this habit?')) return;
    await api.delete(`/habits/${id}`);
    await load();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="display-text text-3xl text-white">MY HABITS</h2>
        <button onClick={openNew} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Habit
        </button>
      </div>

      {habits.length === 0 ? (
        <div className="comic-card p-10 text-center">
          <p className="display-text text-3xl text-muted mb-2">NO HABITS YET!</p>
          <button onClick={openNew} className="btn-primary mt-4">CREATE YOUR FIRST →</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map((h) => (
            <div key={h.id} className="bg-card rounded-xl border-2 p-4 transition-all"
              style={{ borderColor: h.color, boxShadow: `4px 4px 0px ${h.color}40` }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white font-body truncate">{h.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted font-body">{h.category}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-body capitalize ${
                      h.difficulty === 'hard' ? 'bg-danger/20 text-danger' :
                      h.difficulty === 'easy' ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'
                    }`}>{h.difficulty}</span>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(h)} className="p-1.5 text-muted hover:text-primary transition-colors cursor-pointer">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => remove(h.id)} className="p-1.5 text-muted hover:text-danger transition-colors cursor-pointer">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                <div className="flex items-center gap-1">
                  <Droplets size={14} className="text-accent" />
                  <span className="display-text text-accent text-sm">{h.current_streak} streak</span>
                </div>
                <span className="text-xs text-muted font-body">{h.total_completions} total</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="comic-card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="display-text text-2xl text-white">{editing ? 'EDIT HABIT' : 'NEW HABIT'}</h3>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-white cursor-pointer"><X size={20} /></button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-muted font-body block mb-1">HABIT NAME *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-bg border-2 border-white/10 rounded-lg px-3 py-2 text-white font-body focus:outline-none focus:border-primary"
                  placeholder="e.g. Morning workout"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted font-body block mb-1">CATEGORY</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full bg-bg border-2 border-white/10 rounded-lg px-3 py-2 text-white font-body focus:outline-none focus:border-primary cursor-pointer"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted font-body block mb-1">DIFFICULTY</label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}
                    className="w-full bg-bg border-2 border-white/10 rounded-lg px-3 py-2 text-white font-body focus:outline-none focus:border-primary cursor-pointer"
                  >
                    {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted font-body block mb-2">COLOR</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button key={c} onClick={() => setForm((f) => ({ ...f, color: c }))}
                      className="w-7 h-7 rounded-full border-2 cursor-pointer transition-transform hover:scale-110"
                      style={{ background: c, borderColor: form.color === c ? 'white' : 'transparent' }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted font-body block mb-2">DAYS</label>
                <div className="flex gap-2">
                  {DAYS.map((d) => (
                    <button key={d} onClick={() => toggleDay(d)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-body font-semibold border-2 cursor-pointer transition-all uppercase ${
                        form.frequency.includes(d)
                          ? 'bg-primary border-primary-dark text-white'
                          : 'bg-bg border-white/10 text-muted'
                      }`}
                    >{d.slice(0, 1)}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted font-body block mb-1">NOTES (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="w-full bg-bg border-2 border-white/10 rounded-lg px-3 py-2 text-white font-body focus:outline-none focus:border-primary resize-none"
                  rows={2} placeholder="Any notes..."
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg border-2 border-white/10 text-muted font-body hover:text-white transition-colors cursor-pointer">
                  Cancel
                </button>
                <button onClick={save} disabled={saving || !form.name.trim()} className="flex-1 btn-primary disabled:opacity-50">
                  {saving ? 'Saving...' : editing ? 'UPDATE' : 'CREATE'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
