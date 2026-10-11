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
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
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
          <p className="text-muted font-body mt-2">Level up your daily habits</p>
        </div>

        <div className="comic-card p-6">
          <h2 className="display-text text-2xl text-white mb-6">LOGIN</h2>
          {error && (
            <div className="bg-danger/10 border-2 border-danger rounded-lg p-3 mb-4 text-danger text-sm font-body">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2 disabled:opacity-50">
              {loading ? 'Logging in...' : 'LOGIN →'}
            </button>
          </form>
          <p className="text-center text-sm text-muted mt-4 font-body">
            No account?{' '}
            <Link to="/register" className="text-primary hover:underline">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
