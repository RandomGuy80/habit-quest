import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import api from '../api/client';

interface Achievement {
  id: string; code: string; name: string; description: string;
  icon: string; tier: string; xp_reward: number;
  unlocked: boolean; unlocked_at: string | null;
}

const TIER_CONFIG: Record<string, { color: string; glow: string; label: string }> = {
  legendary: { color: '#00F5FF', glow: 'rgba(0,245,255,0.3)', label: '★ LEGENDARY' },
  epic:      { color: '#B026FF', glow: 'rgba(176,38,255,0.3)', label: '★ EPIC' },
  rare:      { color: '#A78BFA', glow: 'rgba(167,139,250,0.3)', label: '★ RARE' },
  common:    { color: '#64748B', glow: 'rgba(100,116,139,0.2)', label: '★ COMMON' },
};

export default function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/achievements').then((r) => setAchievements(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="display text-4xl neon-text-purple animate-pulse">LOADING...</div>
    </div>
  );

  const unlocked = achievements.filter((a) => a.unlocked).length;
  const tiers = ['legendary', 'epic', 'rare', 'common'];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="display text-3xl neon-text-purple">ACHIEVEMENTS</h2>
        <div className="neon-card-cyan px-4 py-2">
          <span className="display text-lg neon-text-cyan">{unlocked}<span className="text-sm" style={{ color: '#64748B' }}>/{achievements.length}</span></span>
          <span className="text-xs font-body ml-2" style={{ color: '#64748B' }}>UNLOCKED</span>
        </div>
      </div>

      {tiers.map((tier) => {
        const group = achievements.filter((a) => a.tier === tier);
        if (group.length === 0) return null;
        const cfg = TIER_CONFIG[tier];
        return (
          <div key={tier} className="mb-8">
            <h3 className="display text-lg mb-3 tracking-widest" style={{ color: cfg.color, textShadow: `0 0 10px ${cfg.glow}` }}>
              {cfg.label}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {group.map((a) => (
                <div key={a.id}
                  className="rounded-xl p-4 transition-all"
                  style={{
                    background: 'rgba(15,15,26,0.9)',
                    border: `1px solid ${a.unlocked ? cfg.color + '60' : 'rgba(255,255,255,0.06)'}`,
                    boxShadow: a.unlocked ? `0 0 20px ${cfg.glow}` : 'none',
                    opacity: a.unlocked ? 1 : 0.4,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: a.unlocked ? `${cfg.color}18` : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${a.unlocked ? cfg.color + '50' : 'rgba(255,255,255,0.08)'}`,
                        boxShadow: a.unlocked ? `0 0 10px ${cfg.glow}` : 'none',
                      }}>
                      {a.unlocked
                        ? <span className="text-lg" style={{ filter: `drop-shadow(0 0 4px ${cfg.color})` }}>🏆</span>
                        : <Lock size={15} style={{ color: '#334155' }} />
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white font-body text-sm leading-tight">{a.name}</p>
                      <p className="text-xs font-body mt-0.5 leading-snug" style={{ color: '#64748B' }}>{a.description}</p>
                      <p className="text-xs font-body mt-1.5 font-semibold" style={{ color: cfg.color }}>+{a.xp_reward} XP</p>
                      {a.unlocked_at && (
                        <p className="text-xs font-body mt-0.5" style={{ color: '#475569' }}>
                          {new Date(a.unlocked_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
