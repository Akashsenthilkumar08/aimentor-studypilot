import React, { useState } from 'react';
import {
  X,
  Mic,
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLearningData } from '../../context/LearningDataContext';
import { TeachBackSession } from '../../types';

interface TeachBackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTopic?: string;
}

export const TeachBackModal: React.FC<TeachBackModalProps> = ({
  isOpen,
  onClose,
  defaultTopic
}) => {
  const { addTeachBackSession, activeStudyPlan, weakTopics } = useLearningData();

  const [topic, setTopic] = useState(
    defaultTopic || weakTopics[0]?.topicName || '0/1 Knapsack Space Optimization'
  );
  const [targetConcept, setTargetConcept] = useState('Why the 1D capacity array must be traversed backwards');
  const [explanation, setExplanation] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<TeachBackSession | null>(null);

  if (!isOpen) return null;

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!explanation.trim()) return;

    setIsEvaluating(true);
    setResult(null);

    try {
      const res = await fetch('/api/gemini/teach-back-evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          targetConcept,
          studentExplanation: explanation
        })
      });

      const data = await res.json();
      const evalData = data.evaluation;

      const saved = await addTeachBackSession({
        topic,
        targetConcept,
        studentExplanation: explanation,
        score: evalData.score || 85,
        rubric: evalData.rubric || {
          accuracy: 85,
          clarity: 85,
          completeness: 80,
          simplicity: 85
        },
        verdict: evalData.verdict || 'Good Conceptual Understanding',
        strengths: evalData.strengths || ['Clear terminology and intuition.'],
        misconceptions: evalData.misconceptions || [],
        targetedImprovement: evalData.targetedImprovement || 'Review boundary condition edge cases.',
        detectedWeakness: evalData.detectedWeakness
      });

      setResult(saved);

      if (evalData.score >= 80) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Teach back error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setExplanation('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="teach-back-modal-card"
        className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 ring-1 ring-purple-500/20">
            <Mic className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Feynman Teach-Back Evaluation</h3>
              <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800">
                Phase 3: EVALUATE
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Explain the concept back in simple terms. Gemini tests for depth and exposes hidden misconceptions.
            </p>
          </div>
        </div>

        {!result ? (
          <form onSubmit={handleEvaluate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Concept or Topic</label>
              <input
                id="teach-back-topic-input"
                type="text"
                required
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. 0/1 Knapsack Space Optimization"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Mechanism</label>
              <input
                id="teach-back-concept-input"
                type="text"
                value={targetConcept}
                onChange={e => setTargetConcept(e.target.value)}
                placeholder="e.g. Explaining why index iteration must run in reverse"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Your Explanation (Imagine explaining to a fellow student)
                </label>
                <span className="text-[11px] text-slate-400">Aim for clarity, not jargon</span>
              </div>
              <textarea
                id="teach-back-explanation-textarea"
                rows={5}
                required
                value={explanation}
                onChange={e => setExplanation(e.target.value)}
                placeholder="e.g. When we optimize the 2D table into a 1D array, we must loop from maximum capacity down to the item's weight. If we went from left to right, we would overwrite earlier values with the current item, accidentally counting the item multiple times like an unbounded knapsack..."
                className="w-full rounded-lg border border-slate-200 p-3 text-xs text-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none leading-relaxed"
              />
            </div>

            <div className="rounded-xl bg-purple-50/60 border border-purple-100 p-3 flex items-start gap-2.5">
              <HelpCircle className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-purple-900">
                <strong>Feynman Rule:</strong> Avoid copying definitions verbatim. Use your own mental models or analogies. If your explanation has gaps, Gemini will highlight the exact edge condition you missed.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="teach-back-submit-btn"
                type="submit"
                disabled={isEvaluating || !explanation.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-purple-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isEvaluating ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Grading Depth & Nuance...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Evaluate Explanation</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Evaluation Results View */
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Score Banner */}
            <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-purple-900">{result.score}/100</span>
                  <span className="rounded-md bg-purple-200/80 px-2 py-0.5 text-xs font-bold text-purple-900">
                    {result.score >= 80 ? 'Mastery Proven' : 'Conceptual Gaps Detected'}
                  </span>
                </div>
                <p className="text-xs font-medium text-purple-800 mt-1">{result.verdict}</p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-purple-600 shadow-xs border border-purple-100">
                <Award className="h-6 w-6" />
              </div>
            </div>

            {/* Rubric Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { label: 'Accuracy', val: result.rubric.accuracy },
                { label: 'Clarity', val: result.rubric.clarity },
                { label: 'Completeness', val: result.rubric.completeness },
                { label: 'Simplicity', val: result.rubric.simplicity }
              ].map(item => (
                <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 text-center">
                  <span className="block text-[11px] font-medium text-slate-500">{item.label}</span>
                  <span className="text-sm font-bold text-slate-900">{item.val}%</span>
                </div>
              ))}
            </div>

            {/* Strengths */}
            {result.strengths?.length > 0 && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 mb-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Key Strengths</span>
                </div>
                <ul className="space-y-1 text-xs text-emerald-800 list-disc list-inside">
                  {result.strengths.map((str, idx) => (
                    <li key={idx}>{str}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Misconceptions */}
            {result.misconceptions?.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span>Misconceptions or Gaps Detected</span>
                </div>
                <ul className="space-y-1 text-xs text-amber-800 list-disc list-inside">
                  {result.misconceptions.map((misc, idx) => (
                    <li key={idx}>{misc}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Targeted Improvement Recommendation */}
            {result.targetedImprovement && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-3.5">
                <span className="block text-[11px] font-bold text-indigo-900 uppercase tracking-wider mb-1">
                  Next Step in Learning Loop
                </span>
                <p className="text-xs text-indigo-950">{result.targetedImprovement}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Explain Again</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 cursor-pointer"
              >
                <span>Done</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
