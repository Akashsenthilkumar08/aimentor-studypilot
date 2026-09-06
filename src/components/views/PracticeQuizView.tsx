import React from 'react';
import { CheckCircle2, Sparkles, AlertTriangle, RotateCcw, ChevronRight, HelpCircle } from 'lucide-react';
import { useLearningData } from '../../context/LearningDataContext';

interface PracticeQuizViewProps {
  onOpenQuiz: (topic?: string) => void;
  onOpenTeachBack: (topic?: string) => void;
}

export const PracticeQuizView: React.FC<PracticeQuizViewProps> = ({ onOpenQuiz, onOpenTeachBack }) => {
  const { recentQuizzes, activeStudyPlan, weakTopics } = useLearningData();

  // Dynamic suggested topics strictly from user's active syllabus or weak topics
  const suggestedTopics = React.useMemo(() => {
    const list: string[] = [];
    weakTopics.filter(w => w.status === 'active').forEach(w => list.push(w.topicName));
    if (activeStudyPlan?.modules) {
      activeStudyPlan.modules.flatMap(m => m.topics).forEach(t => {
        if (!list.includes(t.name) && list.length < 4) {
          list.push(t.name);
        }
      });
    }
    return list;
  }, [activeStudyPlan, weakTopics]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">
              Phase 2: PRACTICE
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500">Active Retrieval Drills</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Diagnostic Quizzes & Practice
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Test retention against edge cases. Missed concepts automatically route to your Weakness Radar.
          </p>
        </div>

        <button
          onClick={() => onOpenQuiz()}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          <Sparkles className="h-4 w-4" />
          <span>Launch New Diagnostic Quiz</span>
        </button>
      </div>

      {/* Quick Launch Carousel (only if user has active topics, otherwise prompt to launch) */}
      {suggestedTopics.length > 0 ? (
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 to-blue-50/50 p-6">
          <h3 className="text-sm font-bold text-indigo-950 mb-1">Targeted Topics from Your Syllabus</h3>
          <p className="text-xs text-indigo-800/80 mb-4">
            Adaptive assessments calibrated to your identified areas and uncompleted modules.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {suggestedTopics.map(t => (
              <button
                key={t}
                onClick={() => onOpenQuiz(t)}
                className="flex flex-col justify-between p-3.5 rounded-xl bg-white border border-indigo-100 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all text-left cursor-pointer group"
              >
                <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {t}
                </span>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                  <span>3 Questions</span>
                  <span className="font-semibold text-indigo-600 flex items-center gap-0.5">
                    <span>Start</span>
                    <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-indigo-950">Practice Any Concept On-Demand</h3>
            <p className="text-xs text-indigo-800/80 mt-1">
              Enter any subject, chapter, or algorithm to have Gemini generate an adaptive multiple-choice diagnostic.
            </p>
          </div>
          <button
            onClick={() => onOpenQuiz()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Custom Quiz</span>
          </button>
        </div>
      )}

      {/* Past Quiz Diagnostic Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Diagnostic History & Retention Trends</h3>
          <span className="text-xs font-semibold text-slate-500">
            Quizzes Completed: {recentQuizzes.length}
          </span>
        </div>

        {recentQuizzes.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 bg-white">
            <HelpCircle className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No quizzes completed yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Take a diagnostic quiz to test your comprehension. Every error will be analyzed to map your cognitive gaps.
            </p>
            <button
              onClick={() => onOpenQuiz()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Take Your First Quiz</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentQuizzes.map(quiz => (
              <div
                key={quiz.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        quiz.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {quiz.passed ? 'Passed' : 'Weakness Flagged'}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{quiz.topic}</h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    {quiz.correctCount} of {quiz.totalQuestions} questions correct • Difficulty: {quiz.difficulty} • Tested{' '}
                    {new Date(quiz.createdAt).toLocaleDateString()}
                  </p>
                  {quiz.identifiedGaps && quiz.identifiedGaps.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-amber-700 mt-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Identified Gaps: {quiz.identifiedGaps.join(', ')}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xl font-black text-slate-900">{quiz.scorePercent}%</div>
                    <div className="text-[11px] text-slate-400">Mastery Score</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenTeachBack(quiz.topic)}
                      className="rounded-lg border border-purple-200 bg-purple-50 text-purple-700 px-3 py-1.5 text-xs font-semibold hover:bg-purple-100 cursor-pointer"
                    >
                      Teach Back
                    </button>
                    <button
                      onClick={() => onOpenQuiz(quiz.topic)}
                      className="rounded-lg bg-indigo-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-indigo-700 cursor-pointer shadow-xs"
                    >
                      Retake
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
