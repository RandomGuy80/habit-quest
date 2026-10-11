import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try { await login(email, password); navigate('/'); }
    catch (err: any) { setError(err.response?.data?.error || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12) 0%, #0A0A0F 60%)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="display text-7xl leading-none" style={{
            background: 'linear-gradient(135deg, #A78BFA 0%, #00F5FF 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>HABIT<br/>QUEST</h1>
          <p className="font-body mt-3" style={{ color: '#64748B' }}>Level up your daily habits</p>
        </div>

        <div className="neon-card p-7">
          <h2 className="display text-2xl text-white mb-6 tracking-widest">LOGIN</h2>

          {error && (
            <div className="neon-card-pink p-3 mb-4 text-sm font-body" style={{ color: '#F43F5E' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block mb-1.5 text-xs font-body tracking-widest" style={{ color: '#64748B' }}>EMAIL</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="neon-input" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-body tracking-widest" style={{ color: '#64748B' }}>PASSWORD</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="neon-input" placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading} className="btn-neon w-full mt-2 tracking-widest disabled:opacity-50">
              {loading ? 'LOADING...' : 'LOGIN →'}
            </button>
          </form>
          <p className="text-center text-sm font-body mt-5" style={{ color: '#64748B' }}>
            No account?{' '}
            <Link to="/register" className="font-semibold transition-colors"
              style={{ color: '#00F5FF' }}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
