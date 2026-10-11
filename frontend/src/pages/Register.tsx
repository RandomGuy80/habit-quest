import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try { await register(username, email, password); navigate('/'); }
    catch (err: any) { setError(err.response?.data?.error || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,245,255,0.08) 0%, #0A0A0F 60%)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="display text-7xl leading-none" style={{
            background: 'linear-gradient(135deg, #A78BFA 0%, #00F5FF 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>HABIT<br/>QUEST</h1>
          <p className="font-body mt-3" style={{ color: '#64748B' }}>Your journey begins now!</p>
        </div>

        <div className="neon-card p-7">
          <h2 className="display text-2xl text-white mb-6 tracking-widest">CREATE ACCOUNT</h2>

          {error && (
            <div className="neon-card-pink p-3 mb-4 text-sm font-body" style={{ color: '#F43F5E' }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block mb-1.5 text-xs font-body tracking-widest" style={{ color: '#64748B' }}>USERNAME</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                className="neon-input" placeholder="HeroPlayer99" required />
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-body tracking-widest" style={{ color: '#64748B' }}>EMAIL</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="neon-input" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-body tracking-widest" style={{ color: '#64748B' }}>PASSWORD</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="neon-input" placeholder="••••••••" minLength={6} required />
            </div>
            <button type="submit" disabled={loading} className="btn-neon w-full mt-2 tracking-widest disabled:opacity-50">
              {loading ? 'LOADING...' : 'START QUEST →'}
            </button>
          </form>
          <p className="text-center text-sm font-body mt-5" style={{ color: '#64748B' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#A78BFA' }} className="font-semibold">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
