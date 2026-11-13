import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Terminal, 
  BarChart3, 
  Code2, 
  Menu, 
  X, 
  BookOpen, 
  GitFork, 
  CheckSquare, 
  History, 
  Bug, 
  Clock, 
  RotateCcw, 
  FolderGit2, 
  Award, 
  GraduationCap, 
  ShieldCheck, 
  Settings as SettingsIcon,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ isOpen, onClose }) => {
  const { role, user, logout } = useAuth();

  const primaryTabs = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/code-lab', label: 'Code Lab', icon: Terminal },
    { to: '/observatory', label: 'Observatory', icon: BarChart3 },
    { to: '/problems', label: 'Problems', icon: Code2 },
  ];

  const fullNav = [
    {
      group: 'Core Learning',
      items: [
        { to: '/dashboard', label: 'Engineering Overview', icon: LayoutDashboard },
        { to: '/learning-paths', label: 'Learning Paths & Modules', icon: BookOpen },
        { to: '/concept-graph', label: 'Concept Explorer Graph', icon: GitFork },
      ]
    },
    {
      group: 'Practice & Lab',
      items: [
        { to: '/problems', label: 'Problem Catalogue', icon: Code2 },
        { to: '/code-lab', label: 'Monaco Code Lab', icon: Terminal },
        { to: '/assessments', label: 'Assessment Center', icon: CheckSquare },
        { to: '/submissions', label: 'Submission History', icon: History },
      ]
    },
    {
      group: 'Skill Intelligence',
      items: [
        { to: '/observatory', label: 'Learning Observatory', icon: BarChart3 },
        { to: '/debugging', label: 'Debugging Intelligence', icon: Bug },
        { to: '/study-patterns', label: 'Study Pattern Analyzer', icon: Clock },
        { to: '/revision', label: 'Revision Planner', icon: RotateCcw },
      ]
    },
    {
      group: 'Engineering Evidence',
      items: [
        { to: '/projects', label: 'Project Studio', icon: FolderGit2 },
        { to: '/skill-passport', label: 'Skill Passport', icon: Award },
      ]
    },
  ];

  if (role === 'instructor' || role === 'admin') {
    fullNav.push({
      group: 'Instructor',
      items: [
        { to: '/instructor', label: 'Instructor Workspace', icon: GraduationCap },
      ]
    });
  }

  if (role === 'admin') {
    fullNav.push({
      group: 'Administration',
      items: [
        { to: '/admin', label: 'Platform Console', icon: ShieldCheck },
      ]
    });
  }

  return (
    <>
      {/* Fixed Bottom Bar on Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-graphite-900 border-t border-graphite-600 flex items-center justify-around px-2 pb-safe">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-14 h-full text-[10px] font-mono transition-colors ${
                  isActive ? 'text-lime-accent' : 'text-graphite-400 hover:text-graphite-200'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
        <button
          onClick={onClose}
          className="flex flex-col items-center justify-center w-14 h-full text-[10px] font-mono text-graphite-400 hover:text-graphite-200"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span>Menu</span>
        </button>
      </nav>

      {/* Full-Screen Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
            onClick={onClose} 
          />

          {/* Drawer content */}
          <div className="relative w-4/5 max-w-xs h-full bg-graphite-900 border-r border-graphite-600 flex flex-col z-10 shadow-2xl overflow-y-auto">
            {/* Header */}
            <div className="p-4 border-b border-graphite-600 flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-sm text-graphite-100">CodeIntellect</span>
                <div className="text-[11px] font-mono text-graphite-400">Mobile Navigation</div>
              </div>
              <button 
                onClick={onClose}
                className="p-1 rounded text-graphite-400 hover:text-graphite-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Groups */}
            <div className="flex-1 p-3 space-y-4">
              {fullNav.map((section, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="px-2 text-[10px] font-mono font-bold tracking-wider text-graphite-400 uppercase">
                    {section.group}
                  </div>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-colors ${
                            isActive
                              ? 'bg-graphite-800 text-lime-accent border-l-2 border-lime-accent'
                              : 'text-graphite-300 hover:bg-graphite-800/60'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* User details & logout */}
            <div className="p-3 border-t border-graphite-600 space-y-2">
              <NavLink
                to="/settings"
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-2 text-xs font-mono text-graphite-300 hover:bg-graphite-800 rounded"
              >
                <SettingsIcon className="w-4 h-4" />
                <span>Profile & Settings</span>
              </NavLink>
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono text-status-error hover:bg-graphite-800 rounded"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
