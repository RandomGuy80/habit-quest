import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

export default function Settings() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="display-text text-3xl text-white mb-6">SETTINGS</h2>

      {/* Profile card */}
      <div className="comic-card p-6 mb-4">
        <h3 className="display-text text-xl text-white mb-4">PROFILE</h3>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary border-2 border-primary-dark flex items-center justify-center"
            style={{ boxShadow: '3px 3px 0px #4F46E5' }}>
            <User size={28} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-white font-body text-lg">{user?.username}</p>
            <p className="text-muted text-sm font-body">{user?.email}</p>
            <p className="display-text text-streak text-sm mt-1">LEVEL {user?.level}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="comic-card p-6 mb-4">
        <h3 className="display-text text-xl text-white mb-4">ACCOUNT INFO</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-bg rounded-lg p-3 border border-white/10">
            <p className="text-xs text-muted font-body">Current XP</p>
            <p className="display-text text-primary text-2xl">{user?.xp}</p>
          </div>
          <div className="bg-bg rounded-lg p-3 border border-white/10">
            <p className="text-xs text-muted font-body">Level</p>
            <p className="display-text text-streak text-2xl">{user?.level}</p>
          </div>
          <div className="bg-bg rounded-lg p-3 border border-white/10">
            <p className="text-xs text-muted font-body">Streak Freezes</p>
            <p className="display-text text-success text-2xl">{user?.streak_freeze_count}</p>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="comic-card-danger p-4">
        <h3 className="display-text text-xl text-danger mb-3">DANGER ZONE</h3>
        <button onClick={handleLogout} className="flex items-center gap-2 bg-danger/10 border-2 border-danger text-danger px-4 py-2 rounded-lg font-body font-semibold hover:bg-danger hover:text-white transition-all cursor-pointer"
          style={{ boxShadow: '3px 3px 0px #DC2626' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
}
