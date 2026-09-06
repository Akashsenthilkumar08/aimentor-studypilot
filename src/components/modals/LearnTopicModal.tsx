import React, { useState } from 'react';
import { X, Sparkles, BookOpen, Clock, CheckCircle2, AlertCircle, ArrowRight, Lightbulb, ShieldAlert, Brain } from 'lucide-react';
import { useLearningData } from '../../context/LearningDataContext';

interface LearnTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTopic?: string;
  onLaunchQuizForTopic?: (topic: string) => void;
  onLaunchTeachBackForTopic?: (topic: string) => void;
}

interface TopicLesson {
  topic: string;
  subject: string;
  conceptSummary: string;
  firstPrinciples: string;
  stepByStep: string[];
  concreteExample: string;
  commonTraps: string[];
  memoryHook: string;
}

export const LearnTopicModal: React.FC<LearnTopicModalProps> = ({
  isOpen,
  onClose,
  defaultTopic,
  onLaunchQuizForTopic,
  onLaunchTeachBackForTopic
}) => {
  const { activeStudyPlan, addLearningSession } = useLearningData();

  const [topic, setTopic] = useState(defaultTopic || '');
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [loading, setLoading] = useState(false);
  const [lesson, setLesson] = useState<TopicLesson | null>(null);
  const [studentNotes, setStudentNotes] = useState('');
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [savingSession, setSavingSession] = useState(false);

  // Sync default topic if changed
  React.useEffect(() => {
    if (defaultTopic) {
      setTopic(defaultTopic);
    }
  }, [defaultTopic]);

  if (!isOpen) return null;

  const handleGenerateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setLesson(null);
    setSessionCompleted(false);

    try {
      const res = await fetch('/api/gemini/explain-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          subject: activeStudyPlan?.subject || 'General Study'
        })
      });

      const data = await res.json();
      if (data.lesson) {
        setLesson(data.lesson);
      }
    } catch (err) {
      console.error('Error generating lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSession = async () => {
    if (!topic) return;
    setSavingSession(true);

    try {
      await addLearningSession({
        topic: topic.trim(),
        subject: activeStudyPlan?.subject || 'Study Concept',
        durationMinutes,
        notes: studentNotes.trim() || undefined
      });
      setSessionCompleted(true);
    } catch (err) {
      console.error('Failed to complete learning session:', err);
    } finally {
      setSavingSession(false);
    }
  };

  const handleReset = () => {
    setLesson(null);
    setSessionCompleted(false);
    setStudentNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Learn a Topic with Gemini</h2>
              <p className="text-[11px] text-slate-500">First-principles concept breakdown and deep-dive notes</p>
            </div>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!lesson && !loading && (
            <form onSubmit={handleGenerateLesson} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Concept or Topic Name
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="e.g., Dynamic Programming: Memoization, Binary Search, Photosynthesis"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 placeholder:text-slate-400"
                />
              </div>

              {/* Study Plan topics shortcut if available */}
              {activeStudyPlan && activeStudyPlan.modules && activeStudyPlan.modules.length > 0 && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                    Or select from your current plan ({activeStudyPlan.title}):
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {activeStudyPlan.modules
                      .flatMap(m => m.topics)
                      .slice(0, 6)
                      .map(t => (
                        <button
                          type="button"
                          key={t.id}
                          onClick={() => setTopic(t.name)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                            topic === t.name
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50 hover:text-indigo-700'
                          }`}
                        >
                          {t.name}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Target Study Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[15, 25, 45].map(mins => (
                    <button
                      type="button"
                      key={mins}
                      onClick={() => setDurationMinutes(mins)}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        durationMinutes === mins
                          ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{mins} Minutes</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!topic.trim()}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Interactive Lesson</span>
              </button>
            </form>
          )}

          {loading && (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-8 h-8 rounded-full border-3 border-indigo-600 border-t-transparent animate-spin" />
              <p className="text-sm font-bold text-slate-800">Synthesizing First-Principles Lesson...</p>
              <p className="text-xs text-slate-500 max-w-sm">
                Gemini is deconstructing "{topic}" into core mechanisms, concrete examples, and common traps.
              </p>
            </div>
          )}

          {lesson && !loading && (
            <div className="space-y-6">
              {/* Concept Header */}
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-200/60 text-indigo-900 font-bold text-[10px] uppercase">
                    {lesson.subject}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-semibold text-indigo-700 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{durationMinutes} min session</span>
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{lesson.topic}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{lesson.conceptSummary}</p>
              </div>

              {/* First Principles Section */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-2">
                  <Brain className="w-4 h-4" />
                  <span>First Principles Core Intuition</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{lesson.firstPrinciples}</p>
              </div>

              {/* Step by Step Breakdown */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider mb-3">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>Mechanics & Derivation</span>
                </div>
                <div className="space-y-2">
                  {lesson.stepByStep.map((step, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {i + 1}
                      </span>
                      <span className="pt-0.5 leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Concrete Example */}
              <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-4">
                <span className="block text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">
                  Concrete Walkthrough Example
                </span>
                <p className="text-xs text-emerald-950/90 leading-relaxed font-mono bg-white/70 p-2.5 rounded-lg border border-emerald-100">
                  {lesson.concreteExample}
                </p>
              </div>

              {/* Common Pitfalls & Traps */}
              {lesson.commonTraps && lesson.commonTraps.length > 0 && (
                <div className="border border-amber-200 bg-amber-50/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider mb-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Common Traps & Edge Cases</span>
                  </div>
                  <ul className="space-y-1.5">
                    {lesson.commonTraps.map((trap, i) => (
                      <li key={i} className="text-xs text-amber-900/90 flex items-start gap-2">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{trap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Memory Hook */}
              {lesson.memoryHook && (
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                  <p className="text-xs font-semibold text-purple-900">
                    <span className="font-bold">Memory Anchor: </span>
                    {lesson.memoryHook}
                  </p>
                </div>
              )}

              {/* Student Scratchpad */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Key Takeaways / Notes (Optional)
                </label>
                <textarea
                  value={studentNotes}
                  onChange={e => setStudentNotes(e.target.value)}
                  placeholder="Record key equations, mental models, or points you want to test in the Feynman Teach-Back..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              {/* Completion State or Button */}
              {sessionCompleted ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
                  <div className="inline-flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Learning Session Saved to Firestore! (+{Math.max(durationMinutes * 4, 30)} XP)</span>
                  </div>
                  <p className="text-xs text-emerald-700">
                    Your real learning session has been logged. Reinforce this concept right now:
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    {onLaunchQuizForTopic && (
                      <button
                        onClick={() => {
                          onClose();
                          onLaunchQuizForTopic(lesson.topic);
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Take Practice Quiz
                      </button>
                    )}
                    {onLaunchTeachBackForTopic && (
                      <button
                        onClick={() => {
                          onClose();
                          onLaunchTeachBackForTopic(lesson.topic);
                        }}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Teach Back Concept
                      </button>
                    )}
                    <button
                      onClick={() => {
                        handleReset();
                        onClose();
                      }}
                      className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Return to Dashboard
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleCompleteSession}
                    disabled={savingSession}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{savingSession ? 'Logging Session...' : 'Complete Study Session & Save'}</span>
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Change Topic
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
