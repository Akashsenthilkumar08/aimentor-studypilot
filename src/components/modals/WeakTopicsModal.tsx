import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  Mic,
  ArrowRight,
  TrendingUp,
  Search,
  Sparkles
} from 'lucide-react';
import { useLearningData } from '../../context/LearningDataContext';

interface WeakTopicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchTeachBackForTopic: (topic: string) => void;
  onLaunchQuizForTopic: (topic: string) => void;
}

export const WeakTopicsModal: React.FC<WeakTopicsModalProps> = ({
  isOpen,
  onClose,
  onLaunchTeachBackForTopic,
  onLaunchQuizForTopic
}) => {
  const { weakTopics, resolveWeakTopic } = useLearningData();
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('active');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredTopics = weakTopics.filter(w => {
    if (filter === 'active' && w.status === 'resolved') return false;
    if (filter === 'resolved' && w.status !== 'resolved') return false;
    if (searchQuery && !w.topicName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="weak-topics-modal-card"
        className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-500/20">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Weakness Diagnostic Radar</h3>
              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                Phase 4 & 5: DETECT & IMPROVE
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Automated root-cause analysis of topics where quiz or teach-back scores slipped
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search gaps..."
              className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-amber-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-1 w-full sm:w-auto">
            {(['active', 'resolved', 'all'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors cursor-pointer ${
                  filter === f
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* List of Weak Topics */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filteredTopics.length === 0 ? (
            <div className="text-center py-10 rounded-xl border border-dashed border-slate-200">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
              <p className="text-xs font-semibold text-slate-800">No matching weaknesses found!</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Take a diagnostic quiz or teach-back session to test comprehension boundaries.
              </p>
            </div>
          ) : (
            filteredTopics.map(item => {
              const isResolved = item.status === 'resolved';

              return (
                <div
                  key={item.id}
                  className={`rounded-xl border p-4 transition-all ${
                    isResolved
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : item.severity === 'high'
                      ? 'border-amber-300 bg-amber-50/40 shadow-xs'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          isResolved
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.severity === 'high'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isResolved ? 'Resolved' : `${item.severity} Priority Gap`}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">{item.topicName}</h4>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                      <span>Retention Score:</span>
                      <strong className={isResolved ? 'text-emerald-700' : 'text-amber-700'}>
                        {item.confidenceScore}%
                      </strong>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 mb-2 bg-white/70 p-2.5 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-800">Root Cause Detected: </span>
                    {item.lastErrorReason}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div className="text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">Recommended Drill: </span>
                      {item.recommendedAction}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!isResolved ? (
                        <>
                          <button
                            onClick={() => {
                              onClose();
                              onLaunchTeachBackForTopic(item.topicName);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-purple-50 text-purple-700 px-2.5 py-1.5 text-[11px] font-semibold hover:bg-purple-100 transition-colors cursor-pointer border border-purple-200"
                          >
                            <Mic className="h-3 w-3" />
                            <span>Teach Back</span>
                          </button>
                          <button
                            onClick={() => {
                              onClose();
                              onLaunchQuizForTopic(item.topicName);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 text-indigo-700 px-2.5 py-1.5 text-[11px] font-semibold hover:bg-indigo-100 transition-colors cursor-pointer border border-indigo-200"
                          >
                            <span>Drill Quiz</span>
                          </button>
                          <button
                            onClick={() => resolveWeakTopic(item.id)}
                            className="rounded-lg bg-emerald-600 text-white px-2.5 py-1.5 text-[11px] font-semibold hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs"
                          >
                            Mark Mastered
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Mastery Confirmed</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end mt-2">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
          >
            Close Radar
          </button>
        </div>
      </div>
    </div>
  );
};
