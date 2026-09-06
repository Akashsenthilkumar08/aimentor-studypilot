import React, { useState } from 'react';
import {
  Compass,
  Flame,
  Zap,
  BookOpen,
  CheckCircle2,
  Mic,
  AlertTriangle,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  PlusCircle,
  BrainCircuit,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLearningData } from '../../context/LearningDataContext';
import { ThemeToggle } from '../common/ThemeToggle';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenNewPlan: () => void;
  onOpenTeachBack: () => void;
  onOpenQuiz: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenNewPlan,
  onOpenTeachBack,
  onOpenQuiz,
  activeView,
  setActiveView
}) => {
  const { userProfile, logOut, signInDemoGuest } = useAuth();
  const { weakTopics } = useLearningData();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeWeakCount = weakTopics.filter(w => w.status === 'active').length;

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: Compass },
    { id: 'study_plans', label: 'Study Plans', icon: BookOpen },
    { id: 'practice', label: 'Practice & Quizzes', icon: CheckCircle2 },
    { id: 'teach_back', label: 'Teach Back', icon: Mic, badge: 'AI Feynman' },
    {
      id: 'weaknesses',
      label: 'Weakness Radar',
      icon: AlertTriangle,
      countBadge: activeWeakCount > 0 ? activeWeakCount : undefined
    }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-6 xl:gap-8">
          <button
            id="brand-logo-btn"
            onClick={() => setActiveView('dashboard')}
            className="flex items-center gap-3 text-left transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/25 dark:shadow-indigo-900/40">
              <BrainCircuit className="h-5.5 w-5.5 transition-transform group-hover:rotate-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                  StudyPilot
                </span>
                <span className="rounded-md bg-indigo-100 dark:bg-indigo-950/80 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-indigo-700 dark:text-indigo-300 ring-1 ring-inset ring-indigo-500/30">
                  AI
                </span>
              </div>
              <span className="hidden sm:block text-[10px] font-medium text-slate-500 dark:text-slate-400 -mt-0.5">
                Adaptive Student Engine
              </span>
            </div>
          </button>

          {/* Desktop Nav Links (Only when in-app workspace) */}
          {activeView !== 'landing' && (
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => {
                const Icon = link.icon;
                const isActive = activeView === link.id;
                return (
                  <button
                    key={link.id}
                    id={`nav-link-${link.id}`}
                    onClick={() => setActiveView(link.id)}
                    className={`relative flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-xs ring-1 ring-indigo-500/20'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="rounded-full bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 text-[9px] font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {link.badge}
                      </span>
                    )}
                    {link.countBadge && (
                      <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white shadow-xs">
                        {link.countBadge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right Actions & Profile */}
        <div className="flex items-center gap-2.5">
          {/* Light / Dark Mode Toggle */}
          <ThemeToggle id="landing-navbar-theme-toggle" />

          {/* Quick Streaks & XP for signed-in / demo users */}
          {userProfile && (
            <div className="hidden xl:flex items-center gap-2 border-r border-slate-200 dark:border-slate-800 pr-3 mr-1">
              <div
                title="Daily Study Streak"
                className="flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 text-xs font-bold text-amber-800 dark:text-amber-300 ring-1 ring-amber-500/20"
              >
                <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                <span>{userProfile.streakDays || 1}d</span>
              </div>
              <div
                title="Learning XP Points"
                className="flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 text-xs font-bold text-indigo-800 dark:text-indigo-300 ring-1 ring-indigo-500/20"
              >
                <Zap className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 fill-indigo-600 dark:fill-indigo-400" />
                <span>{userProfile.xpPoints || 100} XP</span>
              </div>
            </div>
          )}

          {/* Quick Action Button (Only in app) */}
          {activeView !== 'landing' && (
            <button
              id="quick-new-plan-btn"
              onClick={onOpenNewPlan}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:from-indigo-500 hover:to-indigo-600 transition-all hover:shadow-indigo-500/20 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="h-4 w-4" />
              <span>New Plan</span>
            </button>
          )}

          {/* User Profile or Sign In */}
          {userProfile ? (
            <div className="relative">
              <button
                id="user-profile-menu-toggle"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 p-1.5 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-xs font-bold text-white shadow-xs">
                  {userProfile.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'S'}
                </div>
                <div className="hidden text-left md:block pr-1">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1 max-w-[100px]">
                    {userProfile.displayName}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[100px]">
                    {userProfile.gradeLevel || 'Student'}
                  </div>
                </div>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div
                  id="profile-dropdown"
                  className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="border-b border-slate-100 dark:border-slate-800 px-3 py-2.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{userProfile.displayName}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{userProfile.email}</p>
                    <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-200/60 dark:border-indigo-800/60">
                      <span>Target: {userProfile.targetExam || 'General Prep'}</span>
                    </div>
                  </div>
                  <div className="py-1">
                    <button
                      id="dropdown-dashboard-btn"
                      onClick={() => {
                        setActiveView('dashboard');
                        setShowProfileMenu(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <Compass className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Student Dashboard</span>
                    </button>
                    <button
                      id="dropdown-new-plan-btn"
                      onClick={() => {
                        onOpenNewPlan();
                        setShowProfileMenu(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <PlusCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Create Study Plan</span>
                    </button>
                    <button
                      id="dropdown-teach-back-btn"
                      onClick={() => {
                        onOpenTeachBack();
                        setShowProfileMenu(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <Mic className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span>Feynman Teach-Back</span>
                    </button>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                    <button
                      id="dropdown-logout-btn"
                      onClick={() => {
                        logOut();
                        setShowProfileMenu(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer font-bold"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="guest-demo-btn"
                onClick={signInDemoGuest}
                className="hidden sm:inline-flex rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/50 px-3.5 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-all cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1 text-indigo-600 dark:text-indigo-400" />
                Instant Demo
              </button>
              <button
                id="sign-in-nav-btn"
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:from-indigo-500 hover:to-indigo-600 transition-all cursor-pointer whitespace-nowrap"
              >
                <UserIcon className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-nav-drawer" className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 lg:hidden space-y-2">
          {activeView !== 'landing' && navLinks.map(link => {
            const Icon = link.icon;
            const isActive = activeView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  setActiveView(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="rounded-full bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                    {link.badge}
                  </span>
                )}
                {link.countBadge && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                    {link.countBadge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            {activeView !== 'landing' && (
              <button
                onClick={() => {
                  onOpenNewPlan();
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Create New Study Plan</span>
              </button>
            )}
            {!userProfile && (
              <button
                onClick={() => {
                  signInDemoGuest();
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 px-4 py-2.5 text-xs font-bold text-indigo-700 dark:text-indigo-300"
              >
                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>Launch Instant Demo</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
