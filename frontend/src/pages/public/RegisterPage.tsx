import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Terminal, Lock, Mail, User as UserIcon, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      const u = await register(name, email, password, role);
      if (u.role === 'admin') {
        navigate('/admin');
      } else if (u.role === 'instructor') {
        navigate('/instructor');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-graphite-900 text-graphite-100 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded bg-graphite-800 border border-graphite-600 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-lime-accent" />
            </div>
            <span className="font-mono font-bold text-lg tracking-tight">CodeIntellect</span>
          </Link>
          <h1 className="text-xl font-bold font-sans">Initialize Developer Account</h1>
          <p className="text-xs text-graphite-400 mt-1">Begin verified engineering learning & assessment</p>
        </div>

        <div className="bg-graphite-800 border border-graphite-600 rounded p-6 shadow-panel">
          {error && (
            <div className="mb-4 p-3 bg-status-error/15 border border-status-error/30 rounded text-status-error text-xs font-mono">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-graphite-300 mb-1">
                Full Name / Engineering Handle
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-graphite-900 border border-graphite-600 rounded text-xs text-graphite-100 focus:border-lime-accent focus:ring-1 focus:ring-lime-accent font-mono"
                  placeholder="e.g. Linus Torvalds"
                />
                <UserIcon className="w-4 h-4 text-graphite-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-graphite-300 mb-1">
                Email Address
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
              <label className="block text-xs font-mono uppercase tracking-wider text-graphite-300 mb-1">
                Password (min 8 chars)
              </label>
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

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-graphite-300 mb-1">
                Primary Track / Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 bg-graphite-900 border border-graphite-600 rounded text-xs text-graphite-100 focus:border-lime-accent focus:ring-1 focus:ring-lime-accent font-mono"
              >
                <option value="student">Student / Software Engineer (Practice & Assessments)</option>
                <option value="instructor">Instructor (Curriculum Author & Evaluator)</option>
                <option value="admin">Platform Administrator</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded bg-lime-accent text-graphite-950 font-mono text-xs font-bold hover:bg-lime-bright transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? 'Creating Workstation...' : 'Create Developer Account'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        <div className="text-center mt-4 text-xs font-mono text-graphite-400">
          Already registered?{' '}
          <Link to="/login" className="text-lime-accent hover:underline font-bold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
