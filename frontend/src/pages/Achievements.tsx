import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import api from '../api/client';

interface Achievement {
  id: string; code: string; name: string; description: string;
  icon: string; tier: string; xp_reward: number;
  unlocked: boolean; unlocked_at: string | null;
}

const TIER_COLORS: Record<string, string> = {
  common: '#94A3B8',
  rare: '#6366F1',
  epic: '#8B5CF6',
  legendary: '#FBBF24',
};

const TIER_BORDER: Record<string, string> = {
  common: 'border-slate-500',
  rare: 'border-primary',
  epic: 'border-purple-500',
  legendary: 'border-streak',
};

export default function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/achievements').then((r) => setAchievements(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="display-text text-4xl text-primary animate-pulse">LOADING...</div>
    </div>
  );

  const unlocked = achievements.filter((a) => a.unlocked).length;
  const tiers = ['legendary', 'epic', 'rare', 'common'];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="display-text text-3xl text-white">ACHIEVEMENTS</h2>
        <div className="comic-card-streak px-3 py-1.5">
          <span className="display-text text-streak text-lg">{unlocked}/{achievements.length} UNLOCKED</span>
        </div>
      </div>

      {tiers.map((tier) => {
        const group = achievements.filter((a) => a.tier === tier);
        if (group.length === 0) return null;
        return (
          <div key={tier} className="mb-6">
            <h3 className="display-text text-xl mb-3 uppercase" style={{ color: TIER_COLORS[tier] }}>
              ★ {tier}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {group.map((a) => (
                <div
                  key={a.id}
                  className={`comic-card p-4 border-2 transition-all ${TIER_BORDER[a.tier]} ${
                    !a.unlocked ? 'opacity-40 grayscale' : ''
                  }`}
                  style={{ boxShadow: a.unlocked ? `4px 4px 0px ${TIER_COLORS[a.tier]}` : '4px 4px 0px #334155' }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${TIER_BORDER[a.tier]}`}
                      style={{ background: `${TIER_COLORS[a.tier]}20` }}>
                      {a.unlocked
                        ? <span className="text-xl">🏆</span>
                        : <Lock size={16} className="text-muted" />
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white font-body text-sm leading-tight">{a.name}</p>
                      <p className="text-xs text-muted font-body mt-0.5 leading-snug">{a.description}</p>
                      <p className="text-xs mt-1 font-body" style={{ color: TIER_COLORS[a.tier] }}>
                        +{a.xp_reward} XP
                      </p>
                      {a.unlocked_at && (
                        <p className="text-xs text-muted font-body mt-1">
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
