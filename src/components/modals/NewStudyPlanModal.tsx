import React, { useState } from 'react';
import { X, Sparkles, Calendar, Clock, BookOpen, Layers, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useLearningData } from '../../context/LearningDataContext';
import { StudyPlan } from '../../types';

interface NewStudyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewStudyPlanModal: React.FC<NewStudyPlanModalProps> = ({ isOpen, onClose }) => {
  const { saveNewStudyPlan } = useLearningData();

  const [subject, setSubject] = useState('Data Structures & Algorithms');
  const [goal, setGoal] = useState('Ace Technical Interviews & Final Exams');
  const [targetDate, setTargetDate] = useState('4 Weeks');
  const [hoursPerDay, setHoursPerDay] = useState<number>(2);
  const [currentLevel, setCurrentLevel] = useState('Intermediate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsGenerating(true);

    try {
      const res = await fetch('/api/gemini/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          goal,
          targetDate,
          hoursPerDay,
          currentLevel
        })
      });

      if (!res.ok) {
        throw new Error('Failed to reach Gemini API');
      }

      const data = await res.json();
      const planData = data.plan;

      await saveNewStudyPlan({
        title: planData.title || `${subject} Master Plan`,
        subject: subject,
        description: planData.description || `Personalized ${hoursPerDay}h/day plan for ${goal}`,
        level: currentLevel,
        targetDate: targetDate,
        estimatedHours: planData.estimatedHours || hoursPerDay * 20,
        progressPercent: 0,
        status: 'active',
        modules: planData.modules.map((m: any, idx: number) => ({
          id: m.id || `mod-${idx + 1}`,
          title: m.title || `Module ${idx + 1}`,
          duration: m.duration || `Week ${idx + 1}`,
          status: idx === 0 ? 'in_progress' : 'upcoming',
          topics: (m.topics || []).map((t: any, tIdx: number) => ({
            id: `top-${idx + 1}-${tIdx + 1}`,
            name: typeof t === 'string' ? t : t.name,
            duration: t.duration || '2 hours',
            completed: false,
            masteryLevel: 0
          }))
        }))
      });

      onClose();
    } catch (err: any) {
      console.error('Plan generation error:', err);
      setError(err.message || 'Could not generate plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const presetSubjects = [
    'Data Structures & Algorithms',
    'Organic Chemistry',
    'Calculus & Linear Algebra',
    'AP Biology',
    'Machine Learning & AI'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="new-plan-modal-card"
        className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Create Adaptive Study Plan</h3>
            <p className="text-xs text-slate-500">Gemini will structure topics, modules, and target pacing</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700 border border-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleGenerateAndSave} className="space-y-4">
          {/* Preset quick pills */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Subject or Topic</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {presetSubjects.map(p => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setSubject(p)}
                  className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                    subject === p
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="relative">
              <BookOpen className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                id="plan-subject-input"
                type="text"
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Distributed Systems or Quantum Mechanics"
                className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Goal */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Exam or Goal</label>
            <input
              id="plan-goal-input"
              type="text"
              required
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder="e.g. Final Exams, Tech Interview, or A* Certification"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Target Horizon & Hours per day */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Timeline</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="plan-target-date-input"
                  type="text"
                  required
                  value={targetDate}
                  onChange={e => setTargetDate(e.target.value)}
                  placeholder="e.g. 4 Weeks or May 20"
                  className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Daily Commitment</label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <select
                  id="plan-hours-select"
                  value={hoursPerDay}
                  onChange={e => setHoursPerDay(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value={1}>1 hour / day</option>
                  <option value={2}>2 hours / day (Recommended)</option>
                  <option value={3}>3 hours / day</option>
                  <option value={4}>4+ hours / day (Intensive)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Current Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Current Mastery Level</label>
            <div className="grid grid-cols-3 gap-2">
              {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setCurrentLevel(lvl)}
                  className={`rounded-lg border py-2 px-3 text-xs font-medium transition-colors cursor-pointer text-center ${
                    currentLevel === lvl
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              id="generate-plan-submit-btn"
              type="submit"
              disabled={isGenerating}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 px-4 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors disabled:opacity-60 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Generating Adaptive Syllabus with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate & Save Study Plan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
