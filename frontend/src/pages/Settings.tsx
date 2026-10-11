import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Zap, Star, Snowflake, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../hooks/useNotifications';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  const { permission, requestPermission, scheduleReminder, cancelReminder, isScheduled, reminderTime } = useNotifications();
  const [hour, setHour] = useState<number>(reminderTime?.hour ?? 9);
  const [minute, setMinute] = useState<number>(reminderTime?.minute ?? 0);

  const xpToNext = (user?.level ?? 1) * 100;
  const xpPct = Math.min(((user?.xp ?? 0) / xpToNext) * 100, 100);

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="display text-3xl neon-text-purple mb-6">{t('settings.title')}</h2>

      {/* Profile card */}
      <div className="neon-card p-6 mb-4">
        <h3 className="display text-lg neon-text-purple mb-5 tracking-widest">{t('settings.profile')}</h3>
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: 'rgba(124,58,237,0.15)',
              border: '1px solid rgba(124,58,237,0.5)',
              boxShadow: '0 0 20px rgba(124,58,237,0.25)',
            }}>
            <User size={26} style={{ color: '#A78BFA' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white font-body text-lg">{user?.username}</p>
            <p className="text-sm font-body" style={{ color: '#64748B' }}>{user?.email}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Star size={12} style={{ color: '#A78BFA' }} />
              <span className="display text-sm neon-text-purple">{t('common.level')} {user?.level}</span>
            </div>
          </div>
        </div>

        {/* XP progress */}
        <div className="mt-5">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-body tracking-widest" style={{ color: '#64748B' }}>{t('settings.xpProgress')}</span>
            <span className="text-xs font-body" style={{ color: '#A78BFA' }}>{user?.xp} / {xpToNext}</span>
          </div>
          <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div className="h-full rounded-full transition-all duration-700" style={{
              width: `${xpPct}%`,
              background: 'linear-gradient(90deg, #7C3AED, #00F5FF)',
              boxShadow: '0 0 8px rgba(0,245,255,0.5)',
            }} />
          </div>
        </div>
      </div>

      {/* Language */}
      <div className="neon-card p-5 mb-4">
        <h3 className="display text-lg neon-text-purple mb-4 tracking-widest">{t('settings.language')}</h3>
        <div className="flex gap-3">
          {(['en', 'ru'] as const).map(lang => (
            <button key={lang} onClick={() => i18n.changeLanguage(lang)}
              className="px-5 py-2 rounded-lg font-body font-semibold text-sm cursor-pointer transition-all"
              style={i18n.language === lang ? {
                background: 'linear-gradient(135deg, #7C3AED, #B026FF)',
                color: 'white',
                boxShadow: '0 0 15px rgba(176,38,255,0.4)',
                border: 'none',
              } : {
                background: 'rgba(255,255,255,0.03)',
                color: '#64748B',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {lang === 'en' ? '🇬🇧 English' : '🇷🇺 Русский'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="neon-card p-6 mb-4">
        <h3 className="display text-lg neon-text-purple mb-5 tracking-widest">{t('settings.accountInfo')}</h3>
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
          <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.25)' }}>
            <Zap size={18} className="mx-auto mb-2" style={{ color: '#A78BFA' }} />
            <p className="display text-2xl neon-text-purple">{user?.xp}</p>
            <p className="text-xs font-body mt-1" style={{ color: '#64748B' }}>{t('settings.currentXp')}</p>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.2)' }}>
            <Star size={18} className="mx-auto mb-2" style={{ color: '#00F5FF' }} />
            <p className="display text-2xl neon-text-cyan">{user?.level}</p>
            <p className="text-xs font-body mt-1" style={{ color: '#64748B' }}>{t('settings.levelLabel')}</p>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.2)' }}>
            <Snowflake size={18} className="mx-auto mb-2" style={{ color: '#00FF88' }} />
            <p className="display text-2xl neon-text-green">{user?.streak_freeze_count}</p>
            <p className="text-xs font-body mt-1" style={{ color: '#64748B' }}>{t('settings.freezes')}</p>
          </div>
        </div>
      </div>

      {/* Daily Reminders */}
      <div className="neon-card p-6 mb-4">
        <h3 className="display text-lg neon-text-purple mb-5 tracking-widest flex items-center gap-2">
          <Bell size={18} style={{ color: '#A78BFA' }} />
          {t('settings.reminders')}
        </h3>

        {!('Notification' in window) ? (
          <p className="font-body text-sm" style={{ color: '#64748B' }}>
            {t('settings.notSupported')}
          </p>
        ) : permission === 'denied' ? (
          <div className="neon-card-pink p-4 rounded-xl">
            <p className="font-body text-sm" style={{ color: '#FF3366' }}>
              {t('settings.notificationsBlocked')}
            </p>
          </div>
        ) : permission === 'default' ? (
          <div className="flex flex-col gap-3">
            <p className="font-body text-sm" style={{ color: '#64748B' }}>
              {t('settings.enableDesc')}
            </p>
            <button
              className="btn-neon w-fit"
              onClick={requestPermission}
            >
              {t('settings.enableReminders')}
            </button>
          </div>
        ) : (
          /* permission === 'granted' */
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="font-body text-xs tracking-widest" style={{ color: '#64748B' }}>{t('settings.hour')}</label>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={hour}
                  onChange={e => setHour(Math.min(23, Math.max(0, Number(e.target.value))))}
                  className="neon-input w-16 text-center"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="font-body text-xs tracking-widest" style={{ color: '#64748B' }}>{t('settings.min')}</label>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={minute}
                  onChange={e => setMinute(Math.min(59, Math.max(0, Number(e.target.value))))}
                  className="neon-input w-16 text-center"
                />
              </div>
              <button
                className="btn-neon"
                onClick={() => scheduleReminder(hour, minute)}
              >
                {t('settings.setReminder')}
              </button>
              {isScheduled && (
                <button
                  className="font-body text-sm cursor-pointer transition-colors"
                  style={{ color: '#64748B', background: 'none', border: 'none', padding: 0 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#FF3366'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#64748B'; }}
                  onClick={cancelReminder}
                >
                  {t('settings.cancelReminder')}
                </button>
              )}
            </div>
            <p className="font-body text-sm" style={{ color: isScheduled ? '#00FF88' : '#64748B' }}>
              {isScheduled && reminderTime
                ? `${t('settings.reminderSet')} ${String(reminderTime.hour).padStart(2, '0')}:${String(reminderTime.minute).padStart(2, '0')}`
                : t('settings.noReminder')}
            </p>
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div className="neon-card-pink p-5">
        <h3 className="display text-lg neon-text-pink mb-4 tracking-widest">{t('settings.dangerZone')}</h3>
        <button onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-body font-semibold text-sm cursor-pointer transition-all"
          style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.4)', color: '#F43F5E' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.2)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 15px rgba(244,63,94,0.3)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.1)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
          <LogOut size={15} /> {t('settings.logout')}
        </button>
      </div>
    </div>
  );
}
