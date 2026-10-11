import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ListChecks, BarChart2, Trophy, Settings, LogOut } from 'lucide-react';
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
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col flex-shrink-0" style={{
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
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg font-body font-medium transition-all text-sm cursor-pointer ${
                  isActive ? 'text-white' : 'text-muted hover:text-white'
                }`
              }
              style={({ isActive }) => isActive ? {
                background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(176,38,255,0.15))',
                border: '1px solid rgba(124,58,237,0.4)',
                boxShadow: '0 0 15px rgba(124,58,237,0.15)',
              } : {
                border: '1px solid transparent',
              }}
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
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = '#FF3366';
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,51,102,0.08)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = '#64748B';
            (e.currentTarget as HTMLElement).style.background = 'transparent';
          }}
        >
          <LogOut size={15} /> Logout
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto p-6 bg-bg">
        <Outlet />
      </main>
    </div>
  );
}
