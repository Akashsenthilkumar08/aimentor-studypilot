import React from 'react';
import {
  Compass,
  BookOpen,
  CheckCircle2,
  Mic,
  AlertTriangle,
  LogOut,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLearningData } from '../../context/LearningDataContext';
import { ThemeToggle } from '../common/ThemeToggle';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenNewPlan: () => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  onOpenNewPlan,
  onCloseMobile
}) => {
  const { userProfile, logOut } = useAuth();
  const { weakTopics } = useLearningData();

  const activeWeakCount = weakTopics.filter(w => w.status === 'active').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Compass, emoji: '📊' },
    {
      id: 'assistant',
      label: 'Quill Chatbot',
      icon: Sparkles,
      emoji: '✨',
      badge: 'AI'
    },
    { id: 'study_plans', label: 'Study Plans', icon: BookOpen, emoji: '📖' },
    { id: 'practice', label: 'Practice Quizzes', icon: CheckCircle2, emoji: '📝' },
    { id: 'teach_back', label: 'Teach Back', icon: Mic, emoji: '🗣️' },
    {
      id: 'weaknesses',
      label: 'Weakness Radar',
      icon: AlertTriangle,
      emoji: '📈',
      count: activeWeakCount > 0 ? activeWeakCount : undefined
    }
  ];


  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-full border-r border-slate-800 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <button
          onClick={() => {
            setActiveView('dashboard');
            onCloseMobile?.();
          }}
          className="flex items-center gap-3 text-left group cursor-pointer"
        >
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-xl text-white shadow-xs group-hover:bg-indigo-400 transition-colors">
            S
          </div>
          <div>
            <span className="font-bold tracking-tight text-lg text-white block leading-none">
              StudyPilot AI
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Cognitive Mastery</span>
          </div>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map(item => {
          const isActive = activeView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              onClick={() => {
                setActiveView(item.id);
                onCloseMobile?.();
              }}
              className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white font-medium shadow-xs'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 opacity-80'}`} />
                <span className={isActive ? 'font-medium' : ''}>{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge && !isActive && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {item.badge}
                  </span>
                )}
                {item.count !== undefined && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-amber-500 text-slate-900">
                    {item.count}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        <ThemeToggle variant="sidebar" id="sidebar-theme-toggle" />

        {/* User Mini Bar / Logout */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="truncate max-w-[130px] font-medium text-slate-300">
            {userProfile?.displayName || 'Student'}
          </span>
          <button
            onClick={() => logOut()}
            title="Sign out"
            className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
