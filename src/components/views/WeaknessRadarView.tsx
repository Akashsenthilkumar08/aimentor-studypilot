import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Mic, ArrowRight, Sparkles, Filter } from 'lucide-react';
import { useLearningData } from '../../context/LearningDataContext';

interface WeaknessRadarViewProps {
  onOpenTeachBack: (topic?: string) => void;
  onOpenQuiz: (topic?: string) => void;
}

export const WeaknessRadarView: React.FC<WeaknessRadarViewProps> = ({
  onOpenTeachBack,
  onOpenQuiz
}) => {
  const { weakTopics, resolveWeakTopic } = useLearningData();
  const [filter, setFilter] = useState<'all' | 'high' | 'resolved'>('all');

  const filtered = weakTopics.filter(w => {
    if (filter === 'high') return w.severity === 'high' && w.status !== 'resolved';
    if (filter === 'resolved') return w.status === 'resolved';
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">
              Phases 4 & 5: DETECT & IMPROVE
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500">Root-Cause Remediation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Weakness Diagnostic Radar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Never lose points to the same misunderstanding twice. Every error is mapped to its root cause for targeted drill remediation.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
          {(['all', 'high', 'resolved'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors cursor-pointer ${
                filter === f
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f === 'high' ? 'High Urgency' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Topics list */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-slate-200 bg-white">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500 mb-3" />
            <h3 className="text-base font-bold text-slate-900">No learning gaps detected yet.</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6 leading-relaxed">
              Every diagnostic quiz question and Feynman Teach-Back session is analyzed for cognitive misconceptions. As friction points are identified, they will be mapped here for targeted remediation.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => onOpenQuiz()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                <span>Take Diagnostic Quiz</span>
              </button>
              <button
                onClick={() => onOpenTeachBack()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-4 py-2.5 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition-colors cursor-pointer"
              >
                <Mic className="h-3.5 w-3.5" />
                <span>Teach Back a Concept</span>
              </button>
            </div>
          </div>
        ) : (
          filtered.map(weak => {
          const isResolved = weak.status === 'resolved';

          return (
            <div
              key={weak.id}
              className={`rounded-2xl border p-6 transition-all ${
                isResolved
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : weak.severity === 'high'
                  ? 'border-amber-300 bg-amber-50/30 shadow-xs'
                  : 'border-slate-200 bg-white shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`rounded-md px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                      isResolved
                        ? 'bg-emerald-100 text-emerald-800'
                        : weak.severity === 'high'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isResolved ? 'Mastered' : `${weak.severity} Priority`}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{weak.topicName}</h3>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <span>Measured Retention:</span>
                  <span
                    className={`text-sm font-black ${
                      isResolved ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {weak.confidenceScore}%
                  </span>
                </div>
              </div>

              {/* Cause and fix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3 text-xs">
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
                  <span className="block font-bold text-slate-700 mb-1">Detected Cognitive Friction:</span>
                  <p className="text-slate-600 leading-relaxed">{weak.lastErrorReason}</p>
                </div>

                <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5">
                  <span className="block font-bold text-indigo-900 mb-1">Targeted Improvement Loop:</span>
                  <p className="text-indigo-900/90 leading-relaxed">{weak.recommendedAction}</p>
                </div>
              </div>

              {/* Remediation actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">
                  Detected: {new Date(weak.detectedAt).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-2">
                  {!isResolved ? (
                    <>
                      <button
                        onClick={() => onOpenTeachBack(weak.topicName)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100 cursor-pointer"
                      >
                        <Mic className="h-3.5 w-3.5" />
                        <span>Teach Back</span>
                      </button>

                      <button
                        onClick={() => onOpenQuiz(weak.topicName)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 cursor-pointer"
                      >
                        <span>Targeted Quiz</span>
                      </button>

                      <button
                        onClick={() => resolveWeakTopic(weak.id)}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs cursor-pointer"
                      >
                        Mark Mastered
                      </button>
                    </>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Topic Resolved (+80 XP)</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
      </div>
    </div>
  );
};
