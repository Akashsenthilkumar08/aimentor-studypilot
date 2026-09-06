import React, { useState, useMemo } from 'react';
import {
  Flame,
  Trophy,
  Calendar as CalendarIcon,
  Zap,
  CheckCircle2,
  BookOpen,
  Mic,
  Plus,
  X,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { UserActivityLog } from '../../types';
import {
  generateCalendarGrid,
  formatReadableDate,
  CalendarDay,
  toLocalDateStr
} from '../../lib/heatmapUtils';

interface ActivityHeatmapProps {
  activities: UserActivityLog[];
  onOpenNewPlan?: () => void;
  onOpenQuiz?: () => void;
  onOpenTeachBack?: () => void;
  onOpenLearnTopic?: () => void;
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  activities,
  onOpenNewPlan,
  onOpenQuiz,
  onOpenTeachBack,
  onOpenLearnTopic
}) => {
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [hoveredDay, setHoveredDay] = useState<CalendarDay | null>(null);

  // Generate 52-week calendar grid and calculate real-time streak statistics
  const { weeks, monthLabels, stats } = useMemo(() => {
    return generateCalendarGrid(activities);
  }, [activities]);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getTypeIcon = (type: UserActivityLog['type']) => {
    switch (type) {
      case 'quiz':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'teach_back':
        return <Mic className="w-4 h-4 text-purple-400" />;
      case 'session':
        return <BookOpen className="w-4 h-4 text-sky-400" />;
      case 'plan':
        return <Layers className="w-4 h-4 text-indigo-400" />;
      case 'task':
      default:
        return <Zap className="w-4 h-4 text-amber-400" />;
    }
  };

  const getTypeBadge = (type: UserActivityLog['type']) => {
    switch (type) {
      case 'quiz':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
            Quiz
          </span>
        );
      case 'teach_back':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-950/80 text-purple-300 border border-purple-800/60">
            Teach Back
          </span>
        );
      case 'session':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-950/80 text-sky-300 border border-sky-800/60">
            Study Session
          </span>
        );
      case 'plan':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
            Study Plan
          </span>
        );
      case 'task':
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60">
            Completed Task
          </span>
        );
    }
  };

  const formatTimestamp = (tsStr: string) => {
    try {
      const d = new Date(tsStr);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const isBrandNewUser = activities.length === 0;

  return (
    <div className="bg-slate-900/90 text-white p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
      {/* Top Header: Title & Real-Time Sync Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Learning Activity</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
                Last 12 Months
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time GitHub-style activity log derived strictly from your authentic Firestore actions.
          </p>
        </div>

        {/* Live Firestore Sync Status */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-200">Real-Time Firestore Sync</span>
        </div>
      </div>

      {/* 4 Stat Cards Row: Current Streak, Longest Streak, Active Days, Total Activities */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Current Streak */}
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/40 relative overflow-hidden group hover:border-amber-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Current Streak</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Flame className="w-4 h-4 fill-amber-500/20" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-tight">
              {stats.currentStreak}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {stats.currentStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {stats.currentStreak > 0 ? (
              <span className="text-emerald-400 font-medium">🔥 Streak Active Today</span>
            ) : (
              <span>Complete an activity today</span>
            )}
          </div>
        </div>

        {/* Card 2: Longest Streak */}
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/40 relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Longest Streak</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-300 tracking-tight">
              {stats.longestStreak}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              {stats.longestStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">All-time record</div>
        </div>

        {/* Card 3: Active Days */}
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/40 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Days</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CalendarIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight">
              {stats.totalActiveDays}
            </span>
            <span className="text-xs font-semibold text-slate-400">days</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Days with &ge; 1 activity</div>
        </div>

        {/* Card 4: Total Activities */}
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/40 relative overflow-hidden group hover:border-sky-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Activities</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Zap className="w-4 h-4 fill-sky-500/20" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-sky-300 tracking-tight">
              {stats.totalActivities}
            </span>
            <span className="text-xs font-semibold text-slate-400">actions</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Logged in Firestore</div>
        </div>
      </div>

      {/* Main Heatmap Grid Container */}
      <div className="relative">
        {/* Hover / Highlight Info Banner */}
        <div className="flex items-center justify-between mb-3 text-xs text-slate-400 min-h-[24px]">
          <div>
            {hoveredDay ? (
              <span className="text-slate-200 font-medium">
                <strong className="text-emerald-400">{hoveredDay.count}</strong>{' '}
                {hoveredDay.count === 1 ? 'activity' : 'activities'} on{' '}
                <strong className="text-white">{formatReadableDate(hoveredDay.dateStr)}</strong>
                {hoveredDay.isToday && ' (Today)'}
              </span>
            ) : selectedDay ? (
              <span className="text-slate-200 font-medium">
                Showing <strong className="text-emerald-400">{selectedDay.count}</strong>{' '}
                {selectedDay.count === 1 ? 'activity' : 'activities'} for{' '}
                <strong className="text-white">{formatReadableDate(selectedDay.dateStr)}</strong>
              </span>
            ) : (
              <span>Hover or click a day square to view detailed learning logs</span>
            )}
          </div>
          <span className="hidden sm:inline-block text-[11px] text-slate-500">
            52 Weeks Calendar
          </span>
        </div>

        {/* Scrollable Calendar Box */}
        <div className="overflow-x-auto pb-3 custom-scrollbar">
          <div className="min-w-[760px] select-none">
            {/* Month Labels Header */}
            <div className="flex text-[11px] font-semibold text-slate-400 mb-2 pl-9">
              {monthLabels.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    marginLeft: idx === 0 ? `${m.colIndex * 15}px` : `${(m.colIndex - (monthLabels[idx - 1]?.colIndex || 0)) * 15 - 20}px`
                  }}
                  className="shrink-0"
                >
                  {m.name}
                </div>
              ))}
            </div>

            {/* Calendar Grid: Left Day Labels + 52 Column Squares */}
            <div className="flex gap-1.5">
              {/* Day Labels (Mon, Wed, Fri) */}
              <div className="flex flex-col justify-between py-0.5 text-[10px] font-semibold text-slate-500 w-7 shrink-0">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
              </div>

              {/* 52 Week Columns */}
              <div className="flex gap-[3px] flex-1">
                {weeks.map((week, colIdx) => (
                  <div key={colIdx} className="flex flex-col gap-[3px]">
                    {week.map(day => {
                      const isSelected = selectedDay?.dateStr === day.dateStr;

                      // Determine cell intensity styling
                      let cellClass =
                        'bg-slate-800/40 border border-slate-700/30 hover:border-slate-500';
                      if (day.level === 1) {
                        cellClass =
                          'bg-emerald-950/80 border border-emerald-700/60 hover:bg-emerald-900';
                      } else if (day.level === 2) {
                        cellClass =
                          'bg-emerald-700 border border-emerald-500/70 hover:bg-emerald-600';
                      } else if (day.level === 3) {
                        cellClass =
                          'bg-emerald-500 border border-emerald-400 hover:bg-emerald-400';
                      } else if (day.level === 4) {
                        cellClass =
                          'bg-emerald-400 border border-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.7)] hover:bg-emerald-300';
                      }

                      if (day.isToday) {
                        cellClass += ' ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-900';
                      }

                      if (isSelected) {
                        cellClass += ' ring-2 ring-indigo-400 ring-offset-1 ring-offset-slate-900';
                      }

                      return (
                        <button
                          key={day.dateStr}
                          onClick={() => setSelectedDay(day)}
                          onMouseEnter={() => setHoveredDay(day)}
                          onMouseLeave={() => setHoveredDay(null)}
                          disabled={day.isFuture}
                          className={`w-3.5 h-3.5 rounded-[3px] transition-all cursor-pointer ${cellClass} ${
                            day.isFuture ? 'opacity-20 cursor-not-allowed' : ''
                          }`}
                          title={`${day.count} activities on ${formatReadableDate(day.dateStr)}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Heatmap Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            <div className="w-3 h-3 rounded-[3px] bg-slate-800/40 border border-slate-700/30" />
            <div className="w-3 h-3 rounded-[3px] bg-emerald-950/80 border border-emerald-700/60" />
            <div className="w-3 h-3 rounded-[3px] bg-emerald-700 border border-emerald-500/70" />
            <div className="w-3 h-3 rounded-[3px] bg-emerald-500 border border-emerald-400" />
            <div className="w-3 h-3 rounded-[3px] bg-emerald-400 border border-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
            <span>More</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              <span>Today</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              <span>Active Day</span>
            </span>
          </div>
        </div>
      </div>

      {/* Selected Day Activity Details Modal / Card */}
      {selectedDay && (
        <div className="mt-4 p-4 rounded-xl bg-slate-800/80 border border-indigo-900/60 relative animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Activities for {formatReadableDate(selectedDay.dateStr)}</span>
                {selectedDay.isToday && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Today
                  </span>
                )}
              </h4>
              <p className="text-xs text-slate-400">
                {selectedDay.count} {selectedDay.count === 1 ? 'learning action' : 'learning actions'} logged
              </p>
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {selectedDay.activities.length > 0 ? (
            <div className="mt-3 space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {selectedDay.activities.map(act => (
                <div
                  key={act.id}
                  className="p-3 rounded-lg bg-slate-900/80 border border-slate-700/50 flex items-start gap-3"
                >
                  <div className="mt-0.5 shrink-0">{getTypeIcon(act.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-white truncate">{act.title}</p>
                      {getTypeBadge(act.type)}
                    </div>
                    {act.description && (
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                        {act.description}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400 mt-1">
                      Logged at {formatTimestamp(act.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-slate-400">
              <CalendarIcon className="w-6 h-6 mx-auto mb-2 text-slate-500" />
              <p className="text-xs font-medium text-slate-300">No activity recorded on this day.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Streaks require at least one learning activity per day.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Clear Zero State for Brand New Users */}
      {isBrandNewUser && (
        <div className="p-5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-center">
          <Sparkles className="w-8 h-8 mx-auto text-indigo-400 mb-2" />
          <h4 className="text-sm font-bold text-white">Start Your Learning Streak Today</h4>
          <p className="text-xs text-slate-300 max-w-md mx-auto mt-1 mb-4 leading-relaxed">
            No learning activity recorded yet. Complete a study session, diagnostic quiz, topic milestone, or Feynman teach-back session to start your heatmap streak!
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {onOpenNewPlan && (
              <button
                onClick={onOpenNewPlan}
                className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Study Plan</span>
              </button>
            )}
            {onOpenQuiz && (
              <button
                onClick={onOpenQuiz}
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Take Quiz</span>
              </button>
            )}
            {onOpenTeachBack && (
              <button
                onClick={onOpenTeachBack}
                className="px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Teach Back</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
