import React from 'react';
import { Mic, Sparkles, Award, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useLearningData } from '../../context/LearningDataContext';

interface TeachBackViewProps {
  onOpenTeachBack: (topic?: string) => void;
}

export const TeachBackView: React.FC<TeachBackViewProps> = ({ onOpenTeachBack }) => {
  const { teachBackSessions, weakTopics, activeStudyPlan } = useLearningData();

  // Dynamic suggested topics from active weak areas or current study plan topics
  const suggestedTeachBackTopics = React.useMemo(() => {
    const list: { topic: string; reason: string; tag: string }[] = [];

    // Prioritize actual detected gaps
    weakTopics
      .filter(w => w.status === 'active')
      .slice(0, 3)
      .forEach(w => {
        list.push({
          topic: w.topicName,
          reason: w.recommendedAction || 'Detected cognitive friction in diagnostic quiz',
          tag: 'Urgent Remediation'
        });
      });

    // If more needed, pull from active study plan
    if (list.length < 3 && activeStudyPlan?.modules) {
      activeStudyPlan.modules
        .flatMap(m => m.topics)
        .filter(t => !list.some(item => item.topic === t.name))
        .slice(0, 3 - list.length)
        .forEach(t => {
          list.push({
            topic: t.name,
            reason: `Target syllabus milestone in ${activeStudyPlan.title}`,
            tag: 'Milestone'
          });
        });
    }

    return list;
  }, [weakTopics, activeStudyPlan]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-md bg-purple-50 px-2 py-0.5 text-xs font-bold text-purple-700">
              Phase 3: EVALUATE
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500">The Feynman Technique Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Feynman "Teach Back" Evaluator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Explain difficult topics back to AI in your own words. Gemini grades your explanation on clarity, accuracy, and hidden logical fallacies.
          </p>
        </div>

        <button
          onClick={() => onOpenTeachBack()}
          className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-purple-700 transition-colors cursor-pointer"
        >
          <Mic className="h-4 w-4" />
          <span>Start New Teach Back</span>
        </button>
      </div>

      {/* Suggested Topics to Teach Back (only if real topics exist) */}
      {suggestedTeachBackTopics.length > 0 ? (
        <div className="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50/70 via-indigo-50/40 to-white p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-1">High-Impact Teach Back Topics</h3>
          <p className="text-xs text-slate-600 mb-4">
            Select a concept below to prove you truly understand the first principles without memorized jargon.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {suggestedTeachBackTopics.map(item => (
              <div
                key={item.topic}
                className="rounded-xl border border-purple-100 bg-white p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <span className="inline-block rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800 mb-2">
                    {item.tag}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">{item.topic}</h4>
                  <p className="text-[11px] text-slate-500 mt-1">{item.reason}</p>
                </div>

                <button
                  onClick={() => onOpenTeachBack(item.topic)}
                  className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-purple-700 hover:text-purple-800 cursor-pointer"
                >
                  <span>Explain This Concept</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-purple-950">Explain Any Topic to Gemini</h3>
            <p className="text-xs text-purple-800/80 mt-1">
              Pick any topic you are studying. The Feynman Engine will test your explanation against simplicity, accuracy, and edge cases.
            </p>
          </div>
          <button
            onClick={() => onOpenTeachBack()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 cursor-pointer shrink-0"
          >
            <Mic className="w-4 h-4" />
            <span>Launch Teach Back</span>
          </button>
        </div>
      )}

      {/* Past Sessions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Evaluated Teach Back Sessions</h3>
          <span className="text-xs font-semibold text-slate-500">
            Completed Sessions: {teachBackSessions.length}
          </span>
        </div>

        {teachBackSessions.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-dashed border-slate-200 bg-white">
            <Mic className="mx-auto h-8 w-8 text-purple-400 mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No Teach-Back Sessions Yet</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Click "Start New Teach Back" above to explain your first concept and receive a detailed rubric grade.
            </p>
            <button
              onClick={() => onOpenTeachBack()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Begin First Teach Back</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {teachBackSessions.map(session => (
              <div key={session.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{session.topic}</h4>
                    <span className="text-[11px] text-slate-500">
                      Target: {session.targetConcept || 'Core Intuition'} • Evaluated{' '}
                      {new Date(session.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-purple-900">{session.score}/100</span>
                    <span className="rounded-md bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-800">
                      {session.verdict}
                    </span>
                  </div>
                </div>

                {/* Student explanation snippet */}
                <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700 italic border border-slate-100">
                  "{session.studentExplanation}"
                </div>

                {/* Rubric scores */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="rounded-lg border border-slate-100 bg-white p-2 text-center">
                    <span className="block text-[10px] text-slate-400">Accuracy</span>
                    <span className="text-xs font-bold text-slate-800">{session.rubric.accuracy}%</span>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-white p-2 text-center">
                    <span className="block text-[10px] text-slate-400">Clarity</span>
                    <span className="text-xs font-bold text-slate-800">{session.rubric.clarity}%</span>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-white p-2 text-center">
                    <span className="block text-[10px] text-slate-400">Completeness</span>
                    <span className="text-xs font-bold text-slate-800">{session.rubric.completeness}%</span>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-white p-2 text-center">
                    <span className="block text-[10px] text-slate-400">Simplicity</span>
                    <span className="text-xs font-bold text-slate-800">{session.rubric.simplicity}%</span>
                  </div>
                </div>

                {session.misconceptions && session.misconceptions.length > 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
                    <span className="block text-[11px] font-bold text-amber-900 mb-1">Feedback & Gaps:</span>
                    <ul className="text-xs text-amber-800 list-disc list-inside space-y-0.5">
                      {session.misconceptions.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
