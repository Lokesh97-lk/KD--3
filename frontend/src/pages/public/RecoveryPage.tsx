import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export const RecoveryPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
          <h1 className="text-xl font-bold font-sans">Account Recovery</h1>
          <p className="text-xs text-graphite-400 mt-1">Issue a secure cryptographic reset token</p>
        </div>

        <div className="bg-graphite-800 border border-graphite-600 rounded p-6 shadow-panel">
          {submitted ? (
            <div className="text-center py-4 space-y-3">
              <CheckCircle2 className="w-10 h-10 text-lime-accent mx-auto" />
              <h3 className="text-sm font-bold text-graphite-100">Recovery Instructions Dispatched</h3>
              <p className="text-xs text-graphite-300 font-sans leading-relaxed">
                If an account matches <span className="font-mono text-lime-accent">{email}</span>, a secure recovery link with a 15-minute expiration window has been sent.
              </p>
              <div className="pt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-mono text-lime-accent hover:underline"
                >
                  Return to Workstation Login →
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-graphite-300 mb-1">
                  Registered Email
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

              <button
                type="submit"
                className="w-full mt-2 py-2.5 rounded bg-lime-accent text-graphite-950 font-mono text-xs font-bold hover:bg-lime-bright transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                Dispatch Recovery Link
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        <div className="text-center mt-4 text-xs font-mono text-graphite-400">
          Remembered your password?{' '}
          <Link to="/login" className="text-lime-accent hover:underline font-bold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
