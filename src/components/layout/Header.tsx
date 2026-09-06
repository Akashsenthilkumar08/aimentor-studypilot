import React, { useState } from 'react';
import { Menu, Plus, Sparkles, LogOut, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../common/ThemeToggle';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  onOpenNewPlan: () => void;
  onOpenQuiz: () => void;
  onViewLanding: () => void;
  onOpenAssistant?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  onOpenNewPlan,
  onOpenQuiz,
  onViewLanding,
  onOpenAssistant
}) => {
  const { userProfile, logOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return 'SP';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between shrink-0 z-20 transition-colors duration-200">
      {/* Left: Mobile menu button & Welcome Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-xl font-semibold text-slate-900 dark:text-white leading-tight">
            Welcome back, {userProfile?.displayName ? userProfile.displayName.split(' ')[0] : 'Student'}
          </h1>
          <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400">
            Target: {userProfile?.targetExam || 'Continuous Mastery'} • {userProfile?.streakDays ? `${userProfile.streakDays}-Day Streak` : 'Active Session'}
          </p>
        </div>
      </div>

      {/* Right: AI Online Badge, Light/Dark Toggle, Action Button, Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Light / Dark Mode Toggle */}
        <ThemeToggle id="header-theme-toggle-btn" />

        {/* Quill Chatbot Action Button */}
        <button
          onClick={onOpenAssistant}
          className="relative px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-50/80 dark:bg-indigo-950/60 hover:bg-indigo-100/90 dark:hover:bg-indigo-900/60 rounded-full text-[11px] sm:text-xs font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-2 border border-indigo-200/80 dark:border-indigo-800/80 shadow-xs transition-all cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700"
          title="Open Quill Chatbot"
        >
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span className="hidden sm:inline">Ask Quill</span>
          <span className="sm:hidden">Quill</span>
        </button>

        {/* Quick New Plan CTA */}
        <button
          onClick={onOpenNewPlan}
          className="hidden md:inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Plan</span>
        </button>

        {/* User Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 border-2 border-white dark:border-slate-800 overflow-hidden shadow-xs cursor-pointer hover:ring-2 hover:ring-indigo-500/20 transition-all flex items-center justify-center"
          >
            <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm">
              {getInitials(userProfile?.displayName)}
            </div>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{userProfile?.displayName || 'Student'}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{userProfile?.email}</p>
              </div>

              <div className="py-1 space-y-0.5">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    onOpenAssistant?.();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg text-left cursor-pointer font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Open Quill Chatbot</span>
                </button>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    onOpenQuiz();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-left cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Start Practice Quiz</span>
                </button>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    onViewLanding();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-left cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>View Public Landing</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    logOut();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg text-left cursor-pointer font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
