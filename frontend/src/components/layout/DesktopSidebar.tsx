import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  GitFork, 
  Code2, 
  Terminal, 
  CheckSquare, 
  History, 
  BarChart3, 
  Bug, 
  Clock, 
  RotateCcw, 
  FolderGit2, 
  Award, 
  GraduationCap, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const DesktopSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { role } = useAuth();

  const navGroups = [
    {
      title: 'LEARNING',
      items: [
        { to: '/dashboard', label: 'Engineering Overview', icon: LayoutDashboard },
        { to: '/learning-paths', label: 'Learning Paths', icon: BookOpen },
        { to: '/concept-graph', label: 'Concept Explorer', icon: GitFork },
      ]
    },
    {
      title: 'PRACTICE & LAB',
      items: [
        { to: '/problems', label: 'Problem Bank', icon: Code2 },
        { to: '/code-lab', label: 'Code Lab (Monaco)', icon: Terminal, badge: 'Live' },
        { to: '/assessments', label: 'Assessment Center', icon: CheckSquare },
        { to: '/submissions', label: 'Submission History', icon: History },
      ]
    },
    {
      title: 'SKILL INTELLIGENCE',
      items: [
        { to: '/observatory', label: 'Learning Observatory', icon: BarChart3, badge: 'Core' },
        { to: '/debugging', label: 'Debugging Intelligence', icon: Bug },
        { to: '/study-patterns', label: 'Study Pattern Analyzer', icon: Clock },
        { to: '/revision', label: 'Revision Planner', icon: RotateCcw },
      ]
    },
    {
      title: 'EVIDENCE',
      items: [
        { to: '/projects', label: 'Project Studio', icon: FolderGit2 },
        { to: '/skill-passport', label: 'Skill Passport', icon: Award },
      ]
    },
  ];

  if (role === 'instructor' || role === 'admin') {
    navGroups.push({
      title: 'INSTRUCTOR',
      items: [
        { to: '/instructor', label: 'Instructor Workspace', icon: GraduationCap },
      ]
    });
  }

  if (role === 'admin') {
    navGroups.push({
      title: 'ADMINISTRATION',
      items: [
        { to: '/admin', label: 'Platform Console', icon: ShieldCheck },
      ]
    });
  }

  return (
    <aside 
      className={`hidden md:flex flex-col bg-graphite-900 border-r border-graphite-600 transition-all duration-200 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-6">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <div className="px-2.5 mb-1.5 text-[10px] font-mono font-bold tracking-wider text-graphite-400">
                {group.title}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-2.5 py-2 rounded text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-graphite-800 text-lime-accent border-l-2 border-lime-accent'
                        : 'text-graphite-300 hover:text-graphite-100 hover:bg-graphite-800/60'
                    } ${collapsed ? 'justify-center px-0' : ''}`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && (
                    <span className="truncate flex-1 font-sans">{item.label}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-lime-muted text-lime-accent border border-lime-dim/40">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-2 border-t border-graphite-600/60 flex items-center justify-between">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-1.5 rounded text-graphite-400 hover:text-graphite-200 hover:bg-graphite-800 text-xs font-mono transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : (
            <div className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
