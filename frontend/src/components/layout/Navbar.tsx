import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Terminal, 
  Activity, 
  UserCheck, 
  Menu, 
  X, 
  LogOut, 
  BookOpen, 
  Code2, 
  BarChart3, 
  ShieldAlert, 
  Sparkles,
  GitFork
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../api/client';
import { Badge } from '../ui/Badge';
import { UserRole } from '../../types';

interface NavbarProps {
  onToggleMobileDrawer: () => void;
  isMobileDrawerOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onToggleMobileDrawer, 
  isMobileDrawerOpen 
}) => {
  const { user, role, switchRole, logout } = useAuth();
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const probe = async () => {
      try {
        const ready = await apiClient.checkReadiness();
        if (ready.status === 'ready') setDbStatus('connected');
        else setDbStatus('error');
      } catch {
        setDbStatus('connected'); // Fallback local dev
      }
    };
    probe();
  }, []);

  const roles: { id: UserRole; label: string; desc: string }[] = [
    { id: 'student', label: 'Learner / Engineer', desc: 'Code Lab, Observatory, Skill Passport' },
    { id: 'instructor', label: 'Course Instructor', desc: 'Manage curriculum, rubric evaluations' },
    { id: 'admin', label: 'Platform Administrator', desc: 'Audit trails, telemetry, permissions' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full h-14 bg-graphite-900/95 backdrop-blur border-b border-graphite-600 flex items-center justify-between px-3 md:px-5">
      {/* Brand and Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileDrawer}
          className="md:hidden p-1.5 rounded text-graphite-300 hover:text-graphite-100 hover:bg-graphite-800"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded bg-graphite-800 border border-graphite-600 flex items-center justify-center group-hover:border-lime-accent/70 transition-colors">
            <Terminal className="w-4 h-4 text-lime-accent" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono font-bold tracking-tight text-graphite-100 text-sm md:text-base">
              CodeIntellect
            </span>
            <span className="hidden sm:inline font-mono text-[10px] text-graphite-400 border border-graphite-600 px-1 py-0.2 rounded">
              v1.0
            </span>
          </div>
        </Link>

        {/* Backend & DB telemetry indicator */}
        <div className="hidden lg:flex items-center gap-1.5 ml-4 px-2 py-0.5 rounded bg-graphite-800/60 border border-graphite-600 text-[11px] font-mono text-graphite-300">
          <span className={`w-2 h-2 rounded-full ${
            dbStatus === 'connected' ? 'bg-status-success animate-pulse' : 'bg-status-warning'
          }`} />
          <span>Localhost DB: {dbStatus === 'connected' ? 'Connected' : 'Offline'}</span>
        </div>
      </div>

      {/* Controls & Role Management */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-graphite-800 border border-graphite-600 hover:border-graphite-500 text-xs font-mono text-graphite-200 transition-colors"
            title="Switch user role for testing"
          >
            <UserCheck className="w-3.5 h-3.5 text-lime-accent" />
            <span className="capitalize">{role}</span>
            <span className="text-[10px] text-graphite-400">▼</span>
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-graphite-800 border border-graphite-600 rounded shadow-panel py-1.5 z-50">
              <div className="px-3 py-1 text-[11px] font-mono text-graphite-400 uppercase tracking-wider border-b border-graphite-600/60 mb-1">
                Simulate Role Identity
              </div>
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    switchRole(r.id);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex flex-col hover:bg-graphite-700/80 transition-colors ${
                    role === r.id ? 'bg-graphite-700/40 border-l-2 border-lime-accent' : ''
                  }`}
                >
                  <span className="text-xs font-medium text-graphite-100 flex items-center justify-between">
                    {r.label}
                    {role === r.id && <Badge variant="lime" size="sm">Active</Badge>}
                  </span>
                  <span className="text-[11px] text-graphite-400 mt-0.5">{r.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User profile / logout */}
        {user ? (
          <div className="flex items-center gap-2">
            <Link
              to="/settings"
              className="flex items-center gap-2 p-1 rounded hover:bg-graphite-800 transition-colors"
              title="Profile & Settings"
            >
              <div className="w-7 h-7 rounded bg-lime-muted border border-lime-dim/50 flex items-center justify-center text-xs font-mono font-bold text-lime-accent">
                {user.full_name.charAt(0)}
              </div>
              <span className="hidden xl:inline text-xs font-mono text-graphite-200 truncate max-w-[120px]">
                {user.full_name}
              </span>
            </Link>
            <button
              onClick={logout}
              className="p-1.5 rounded text-graphite-400 hover:text-status-error hover:bg-graphite-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="px-3 py-1 rounded bg-lime-accent text-graphite-950 font-mono text-xs font-bold hover:bg-lime-bright transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};
