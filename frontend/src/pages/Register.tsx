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
    try {
      await register(username, email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="display-text text-6xl text-primary">HABIT</h1>
          <h1 className="display-text text-6xl text-streak">QUEST</h1>
          <p className="text-muted font-body mt-2">Your journey begins now!</p>
        </div>

        <div className="comic-card p-6">
          <h2 className="display-text text-2xl text-white mb-6">CREATE ACCOUNT</h2>
          {error && (
            <div className="bg-danger/10 border-2 border-danger rounded-lg p-3 mb-4 text-danger text-sm font-body">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-muted font-body block mb-1">USERNAME</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-bg border-2 border-white/20 rounded-lg px-3 py-2 text-white font-body focus:outline-none focus:border-primary"
                placeholder="HeroPlayer99"
                required
              />
            </div>
            <div>
              <label className="text-xs text-muted font-body block mb-1">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-bg border-2 border-white/20 rounded-lg px-3 py-2 text-white font-body focus:outline-none focus:border-primary"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="text-xs text-muted font-body block mb-1">PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bg border-2 border-white/20 rounded-lg px-3 py-2 text-white font-body focus:outline-none focus:border-primary"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2 disabled:opacity-50">
              {loading ? 'Creating...' : 'START QUEST →'}
            </button>
          </form>
          <p className="text-center text-sm text-muted mt-4 font-body">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
