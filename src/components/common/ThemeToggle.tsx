import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  id?: string;
  variant?: 'button' | 'pill' | 'sidebar';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  id = 'theme-toggle-btn',
  variant = 'button',
  className = ''
}) => {
  const { isDark, toggleTheme } = useTheme();

  if (variant === 'sidebar') {
    return (
      <button
        id={id}
        type="button"
        onClick={toggleTheme}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
          isDark
            ? 'bg-slate-800/80 text-amber-300 hover:bg-slate-800 border border-slate-700/60'
            : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700/40'
        } ${className}`}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        <div className="flex items-center gap-2.5">
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-300" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-300 animate-in zoom-in-75 duration-300" />
          )}
          <span className="font-medium text-slate-200">
            {isDark ? 'Light Background' : 'Dark Background'}
          </span>
        </div>
        <span
          className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
            isDark ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-700 text-slate-300'
          }`}
        >
          {isDark ? 'Dark' : 'Light'}
        </span>
      </button>
    );
  }

  if (variant === 'pill') {
    return (
      <button
        id={id}
        type="button"
        onClick={toggleTheme}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
          isDark
            ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700 shadow-xs'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 shadow-xs'
        } ${className}`}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDark ? (
          <Sun className="w-3.5 h-3.5 text-amber-400" />
        ) : (
          <Moon className="w-3.5 h-3.5 text-slate-600" />
        )}
        <span className="text-[11px] font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
      </button>
    );
  }

  return (
    <button
      id={id}
      type="button"
      onClick={toggleTheme}
      className={`relative p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
        isDark
          ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700 hover:border-slate-600 shadow-xs'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-200/80 shadow-xs'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-300" />
      ) : (
        <Moon className="w-4 h-4 text-slate-600 animate-in zoom-in-75 duration-300" />
      )}
    </button>
  );
};
