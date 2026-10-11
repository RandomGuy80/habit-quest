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
      <aside className="w-64 bg-card border-r-2 border-primary flex flex-col" style={{ boxShadow: '4px 0 0 #6366F1' }}>
        {/* Logo */}
        <div className="p-6 border-b-2 border-primary">
          <h1 className="display-text text-4xl text-primary leading-none">HABIT</h1>
          <h1 className="display-text text-4xl text-streak leading-none">QUEST</h1>
          <p className="text-xs text-muted mt-1 font-body">Level up your life</p>
        </div>

        {/* User XP bar */}
        {user && (
          <div className="p-4 border-b-2 border-white/10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted font-body">Level {user.level}</span>
              <span className="text-xs text-streak font-body">{user.xp} / {xpToNext} XP</span>
            </div>
            <div className="w-full bg-bg rounded-full h-2 border border-white/20">
              <div
                className="h-full rounded-full bg-streak transition-all duration-500"
                style={{ width: `${xpPct}%` }}
              />
            </div>
            <p className="text-sm font-semibold mt-1 font-body">{user.username}</p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-4 flex flex-col gap-1">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg font-body font-medium transition-all text-sm cursor-pointer border-2 ${
                  isActive
                    ? 'bg-primary border-primary-dark text-white'
                    : 'border-transparent text-muted hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="m-4 flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-danger transition-colors font-body rounded-lg hover:bg-danger/10 cursor-pointer"
        >
          <LogOut size={16} /> Logout
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
