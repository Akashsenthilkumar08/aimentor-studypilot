import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLearningData } from '../../context/LearningDataContext';
import { QuizQuestion } from '../../types';

interface QuickQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTopic?: string;
}

export const QuickQuizModal: React.FC<QuickQuizModalProps> = ({
  isOpen,
  onClose,
  defaultTopic
}) => {
  const { addQuizResult, activeStudyPlan } = useLearningData();

  const [topic, setTopic] = useState(
    defaultTopic || activeStudyPlan?.subject || 'Data Structures & Algorithms'
  );
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [scoreReport, setScoreReport] = useState<{
    correct: number;
    total: number;
    percent: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleStartQuiz = async () => {
    setIsGenerating(true);
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setQuizFinished(false);
    setScoreReport(null);

    try {
      const res = await fetch('/api/gemini/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty, count: 3 })
      });

      const data = await res.json();
      if (data.quiz?.questions?.length > 0) {
        setQuestions(data.quiz.questions);
      } else {
        // Safe fallback questions
        setQuestions([
          {
            id: 'q1',
            question: `In algorithm analysis for ${topic}, what does the Big-O notation represent?`,
            options: [
              'The exact instruction count for every microarchitecture',
              'The asymptotic upper bound on running time or space as input approaches infinity',
              'The average wall-clock duration of a multithreaded process',
              'The cache miss ratio during execution'
            ],
            correctIndex: 1,
            explanation: 'Big-O describes how the algorithm scales in the worst-case scenario asymptotically.'
          },
          {
            id: 'q2',
            question: 'Which of the following describes why the Feynman Technique accelerates mastery?',
            options: [
              'It relies on passive listening to recorded lectures',
              'Translating concepts into plain language forces retrieval and exposes illusion of explanatory depth',
              'It focuses purely on memorizing question answer keys',
              'It eliminates the need for foundational prerequisites'
            ],
            correctIndex: 1,
            explanation: 'The Feynman technique forces active reconstruction of the mental model without relying on memorized jargon.'
          }
        ]);
      }
    } catch (e) {
      console.error('Quiz fetch error:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    const q = questions[currentIndex];
    if (!q || selectedAnswers[q.id] !== undefined) return; // Answer locked
    setSelectedAnswers(prev => ({ ...prev, [q.id]: optionIndex }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Finish Quiz
      let correct = 0;
      questions.forEach(q => {
        if (selectedAnswers[q.id] === q.correctIndex) {
          correct++;
        }
      });
      const total = questions.length;
      const percent = Math.round((correct / total) * 100);

      setScoreReport({ correct, total, percent });
      setQuizFinished(true);

      // Record to Firestore & update weak topics
      addQuizResult({
        topic,
        difficulty,
        totalQuestions: total,
        correctCount: correct,
        scorePercent: percent,
        passed: percent >= 70,
        questions: questions.map(q => ({
          ...q,
          selectedOption: selectedAnswers[q.id]
        }))
      });

      if (percent >= 70) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const currentQ = questions[currentIndex];
  const hasAnsweredCurrent = currentQ && selectedAnswers[currentQ.id] !== undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="quick-quiz-modal-card"
        className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Diagnostic Practice Quiz</h3>
              <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800">
                Phase 2: PRACTICE
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Active retrieval drills that pinpoint your exact level of retention
            </p>
          </div>
        </div>

        {questions.length === 0 ? (
          /* Quiz Setup view */
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Quiz Topic</label>
              <input
                id="quiz-topic-input"
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. Dynamic Programming or Binary Search"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty Level</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Easy', 'Medium', 'Hard'] as const).map(d => (
                  <button
                    type="button"
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`rounded-lg border py-2 px-3 text-xs font-medium transition-colors cursor-pointer text-center ${
                      difficulty === d
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 space-y-1">
              <div className="font-semibold text-slate-900">Diagnostic Learning Feature:</div>
              <p>
                Missed questions will automatically feed into your <strong>Weakness Radar</strong>, generating targeted remediation exercises.
              </p>
            </div>

            <button
              id="start-quiz-btn"
              onClick={handleStartQuiz}
              disabled={isGenerating || !topic.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 px-4 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Synthesizing Questions with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Diagnostic Quiz</span>
                </>
              )}
            </button>
          </div>
        ) : !quizFinished ? (
          /* Active Question View */
          <div className="space-y-4">
            {/* Progress indicator */}
            <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2">
              <span>
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="font-semibold text-indigo-600">{difficulty} Difficulty</span>
            </div>

            {/* Question Text */}
            <div className="text-sm font-semibold text-slate-900 leading-relaxed">
              {currentQ.question}
            </div>

            {/* Options */}
            <div className="space-y-2">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedAnswers[currentQ.id] === idx;
                const isCorrect = idx === currentQ.correctIndex;
                const showFeedback = hasAnsweredCurrent;

                let btnClass = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800';

                if (showFeedback) {
                  if (isCorrect) {
                    btnClass = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold';
                  } else if (isSelected && !isCorrect) {
                    btnClass = 'border-rose-500 bg-rose-50 text-rose-950';
                  } else {
                    btnClass = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={hasAnsweredCurrent}
                    onClick={() => handleSelectOption(idx)}
                    className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left text-xs transition-all cursor-pointer ${btnClass}`}
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                        showFeedback && isCorrect
                          ? 'bg-emerald-600 text-white'
                          : showFeedback && isSelected
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="flex-1 mt-0.5">{option}</span>
                    {showFeedback && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />}
                    {showFeedback && isSelected && !isCorrect && (
                      <XCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation */}
            {hasAnsweredCurrent && (
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-3.5 animate-in fade-in duration-100">
                <span className="block text-[11px] font-bold text-indigo-900 mb-1">Concept Rationale:</span>
                <p className="text-xs text-indigo-950 leading-relaxed">{currentQ.explanation}</p>
              </div>
            )}

            {/* Next Button */}
            <div className="flex justify-end pt-2">
              <button
                disabled={!hasAnsweredCurrent}
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-40 cursor-pointer"
              >
                <span>{currentIndex === questions.length - 1 ? 'View Performance' : 'Next Question'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Finished Report */
          <div className="text-center space-y-4">
            <div
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${
                scoreReport && scoreReport.percent >= 70
                  ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20'
                  : 'bg-amber-50 text-amber-600 ring-1 ring-amber-500/20'
              }`}
            >
              {scoreReport && scoreReport.percent >= 70 ? (
                <CheckCircle2 className="h-8 w-8" />
              ) : (
                <AlertTriangle className="h-8 w-8" />
              )}
            </div>

            <div>
              <h4 className="text-lg font-bold text-slate-900">
                {scoreReport && scoreReport.percent >= 70 ? 'Knowledge Verified!' : 'Knowledge Gap Identified'}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                You scored {scoreReport?.correct} out of {scoreReport?.total} ({scoreReport?.percent}%)
              </p>
            </div>

            {scoreReport && scoreReport.percent < 70 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-left text-xs text-amber-900">
                <div className="font-bold mb-1">Learning Cycle Activated:</div>
                <p>
                  Because your score was under 75%, StudyPilot has registered{' '}
                  <strong>{topic}</strong> onto your <strong>Weakness Radar</strong> and prepared a Feynman Teach-Back drill to reinforce the foundation.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-left text-xs text-emerald-900">
                <div className="font-bold mb-1">Concept Retention Proven!</div>
                <p>Great job! You demonstrated solid retention for {topic}. +100 XP awarded to your student profile.</p>
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleStartQuiz}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Try Another Quiz</span>
              </button>
              <button
                onClick={onClose}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 cursor-pointer"
              >
                <span>Return to Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
