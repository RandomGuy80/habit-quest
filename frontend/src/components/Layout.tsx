import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ListChecks, BarChart2, Trophy, Settings, LogOut, Zap } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/habits', icon: ListChecks, label: 'Habits' },
  { to: '/stats', icon: BarChart2, label: 'Stats' },
  { to: '/achievements', icon: Trophy, label: 'Badges' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  const xpToNext = user ? user.level * 100 : 100;
  const xpPct = user ? Math.min((user.xp / xpToNext) * 100, 100) : 0;

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <aside className="hidden md:flex w-64 flex-col flex-shrink-0" style={{
        background: 'rgba(10,10,15,0.95)',
        borderRight: '1px solid rgba(124,58,237,0.3)',
        boxShadow: '4px 0 30px rgba(124,58,237,0.08)',
      }}>
        {/* Logo */}
        <div className="p-6" style={{ borderBottom: '1px solid rgba(124,58,237,0.2)' }}>
          <div className="display text-3xl leading-tight" style={{
            background: 'linear-gradient(135deg, #A78BFA, #00F5FF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>HABIT<br/>QUEST</div>
          <p className="text-xs mt-2 font-body" style={{ color: '#64748B' }}>Level up your life</p>
        </div>

        {/* XP bar */}
        {user && (
          <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-body" style={{ color: '#A78BFA' }}>LVL {user.level}</span>
              <span className="text-xs font-body" style={{ color: '#00F5FF' }}>{user.xp} / {xpToNext} XP</span>
            </div>
            <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-700" style={{
                width: `${xpPct}%`,
                background: 'linear-gradient(90deg, #7C3AED, #00F5FF)',
                boxShadow: '0 0 8px rgba(0,245,255,0.6)',
              }} />
            </div>
            <p className="text-sm font-semibold mt-1.5 font-body text-white">{user.username}</p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-3 flex flex-col gap-1 mt-1">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg font-body font-medium transition-all text-sm cursor-pointer ${
                  isActive ? 'text-white' : 'text-muted hover:text-white'
                }`
              }
              style={({ isActive }) => isActive ? {
                background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(176,38,255,0.15))',
                border: '1px solid rgba(124,58,237,0.4)',
                boxShadow: '0 0 15px rgba(124,58,237,0.15)',
              } : { border: '1px solid transparent' }}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="mx-3 mb-4 flex items-center gap-2 px-3 py-2 text-sm font-body rounded-lg transition-colors cursor-pointer"
          style={{ color: '#64748B', border: '1px solid transparent' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#FF3366'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,51,102,0.08)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#64748B'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <LogOut size={15} /> Logout
        </button>
      </aside>

      {/* ── Mobile top header ────────────────────────────────── */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 flex-shrink-0" style={{
        background: 'rgba(10,10,15,0.97)',
        borderBottom: '1px solid rgba(124,58,237,0.3)',
        boxShadow: '0 4px 20px rgba(124,58,237,0.1)',
      }}>
        <div className="display text-xl leading-none" style={{
          background: 'linear-gradient(135deg, #A78BFA, #00F5FF)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>HABITQUEST</div>

        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <span className="text-xs font-body" style={{ color: '#A78BFA' }}>LVL {user.level}</span>
                <Zap size={10} style={{ color: '#A78BFA' }} />
                <span className="text-xs font-body" style={{ color: '#64748B' }}>{user.xp}xp</span>
              </div>
              <div className="w-24 rounded-full h-1 overflow-hidden mt-0.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full" style={{
                  width: `${xpPct}%`,
                  background: 'linear-gradient(90deg, #7C3AED, #00F5FF)',
                  boxShadow: '0 0 6px rgba(0,245,255,0.5)',
                }} />
              </div>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-body font-bold"
              style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.5)', color: '#A78BFA' }}>
              {user.username.slice(0, 1).toUpperCase()}
            </div>
          </div>
        )}
      </header>

      {/* ── Main content ─────────────────────────────────────── */}
      <main className="flex-1 overflow-auto p-4 md:p-6 bg-bg pb-24 md:pb-6">
        <Outlet />
      </main>

      {/* ── Mobile bottom navigation ─────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center" style={{
        background: 'rgba(10,10,15,0.97)',
        borderTop: '1px solid rgba(124,58,237,0.3)',
        boxShadow: '0 -4px 30px rgba(124,58,237,0.12)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to} end={to === '/'}
            className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-all"
            style={({ isActive }) => isActive ? {
              color: '#A78BFA',
            } : { color: '#334155' }}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon size={20} />
                  {isActive && (
                    <div className="absolute inset-0 blur-md opacity-70" style={{ background: '#A78BFA' }} />
                  )}
                </div>
                <span className="text-[10px] font-body font-medium leading-none">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
