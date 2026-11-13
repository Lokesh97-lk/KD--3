import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Terminal, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '../../components/ui/Badge';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('alex.chen@codeintellect.io');
  const [password, setPassword] = useState('Secr3t!P@ssword2026');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const u = await login(email, password);
      if (u.role === 'admin') {
        navigate('/admin');
      } else if (u.role === 'instructor') {
        navigate('/instructor');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('Secr3t!P@ssword2026');
  };

  return (
    <div className="min-h-screen bg-graphite-900 text-graphite-100 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded bg-graphite-800 border border-graphite-600 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-lime-accent" />
            </div>
            <span className="font-mono font-bold text-lg tracking-tight">CodeIntellect</span>
          </Link>
          <h1 className="text-xl font-bold font-sans">Engineering Workstation Login</h1>
          <p className="text-xs text-graphite-400 mt-1">Authenticate with your developer credentials</p>
        </div>

        {/* Card */}
        <div className="bg-graphite-800 border border-graphite-600 rounded p-6 shadow-panel">
          {error && (
            <div className="mb-4 p-3 bg-status-error/15 border border-status-error/30 rounded text-status-error text-xs font-mono">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-graphite-300 mb-1">
                Developer Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-graphite-900 border border-graphite-600 rounded text-xs text-graphite-100 focus:border-lime-accent focus:ring-1 focus:ring-lime-accent font-mono"
                  placeholder="developer@domain.com"
                />
                <Mail className="w-4 h-4 text-graphite-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-mono uppercase tracking-wider text-graphite-300">
                  Password
                </label>
                <Link to="/recovery" className="text-[11px] font-mono text-lime-accent hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-graphite-900 border border-graphite-600 rounded text-xs text-graphite-100 focus:border-lime-accent focus:ring-1 focus:ring-lime-accent font-mono"
                  placeholder="••••••••••••"
                />
                <Lock className="w-4 h-4 text-graphite-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded bg-lime-accent text-graphite-950 font-mono text-xs font-bold hover:bg-lime-bright transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Workstation'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick-fill testing identities */}
          <div className="mt-6 pt-4 border-t border-graphite-700">
            <div className="text-[10px] font-mono uppercase tracking-wider text-graphite-400 mb-2">
              Fast Development Credentials:
            </div>
            <div className="flex flex-col gap-1.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => handleQuickFill('alex.chen@codeintellect.io')}
                className="text-left px-2 py-1.5 rounded bg-graphite-900 border border-graphite-700 hover:border-lime-accent/50 flex justify-between items-center text-graphite-300 hover:text-graphite-100"
              >
                <span>alex.chen@codeintellect.io</span>
                <Badge variant="lime" size="sm">Student</Badge>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('instructor.elena@codeintellect.io')}
                className="text-left px-2 py-1.5 rounded bg-graphite-900 border border-graphite-700 hover:border-lime-accent/50 flex justify-between items-center text-graphite-300 hover:text-graphite-100"
              >
                <span>instructor.elena@codeintellect.io</span>
                <Badge variant="info" size="sm">Instructor</Badge>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin.lead@codeintellect.io')}
                className="text-left px-2 py-1.5 rounded bg-graphite-900 border border-graphite-700 hover:border-lime-accent/50 flex justify-between items-center text-graphite-300 hover:text-graphite-100"
              >
                <span>admin.lead@codeintellect.io</span>
                <Badge variant="warning" size="sm">Admin</Badge>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-4 text-xs font-mono text-graphite-400">
          New engineer?{' '}
          <Link to="/register" className="text-lime-accent hover:underline font-bold">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};
