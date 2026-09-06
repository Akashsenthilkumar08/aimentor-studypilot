import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  Mic,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useLearningData } from '../../context/LearningDataContext';
import { LearningCycleStep } from '../../types';

interface LearningCycleTrackerProps {
  onOpenQuiz: () => void;
  onOpenTeachBack: () => void;
  onOpenWeakness: () => void;
}

export const LearningCycleTracker: React.FC<LearningCycleTrackerProps> = ({
  onOpenQuiz,
  onOpenTeachBack,
  onOpenWeakness
}) => {
  const { currentCycleStep, setCurrentCycleStep, advanceCycleStep } = useLearningData();

  const cycleSteps: {
    id: LearningCycleStep;
    stepNumber: number;
    title: string;
    subtitle: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    actionLabel: string;
    onAction: () => void;
  }[] = [
    {
      id: 'study',
      stepNumber: 1,
      title: 'STUDY',
      subtitle: 'Structured Mastery',
      description: 'Review prioritized syllabus topics with Gemini breakdown levels and milestone tracking.',
      icon: BookOpen,
      accentColor: 'blue',
      actionLabel: 'Explore Study Plan',
      onAction: () => setCurrentCycleStep('practice')
    },
    {
      id: 'practice',
      stepNumber: 2,
      title: 'PRACTICE',
      subtitle: 'Active Retrieval',
      description: 'Challenge your memory with targeted diagnostic micro-quizzes to test retention.',
      icon: CheckCircle2,
      accentColor: 'indigo',
      actionLabel: 'Launch Practice Quiz',
      onAction: onOpenQuiz
    },
    {
      id: 'evaluate',
      stepNumber: 3,
      title: 'EVALUATE',
      subtitle: 'Teach Back (Feynman)',
      description: 'Explain the concept back in your own words. Gemini grades your depth, clarity, and precision.',
      icon: Mic,
      accentColor: 'purple',
      actionLabel: 'Start Teach Back',
      onAction: onOpenTeachBack
    },
    {
      id: 'detect',
      stepNumber: 4,
      title: 'DETECT WEAKNESS',
      subtitle: 'Gap Identification',
      description: 'Diagnostic engines isolate root-cause misconceptions and low-confidence boundaries.',
      icon: AlertTriangle,
      accentColor: 'amber',
      actionLabel: 'Analyze Weak Spots',
      onAction: onOpenWeakness
    },
    {
      id: 'improve',
      stepNumber: 5,
      title: 'IMPROVE',
      subtitle: 'Targeted Remediation',
      description: 'Reinforce weak spots with personalized bite-sized drills until 90%+ mastery is achieved.',
      icon: TrendingUp,
      accentColor: 'emerald',
      actionLabel: 'Complete & Reset Cycle',
      onAction: () => setCurrentCycleStep('study')
    }
  ];

  const activeIndex = cycleSteps.findIndex(s => s.id === currentCycleStep);
  const activeStep = cycleSteps[activeIndex] || cycleSteps[0];
  const StepIcon = activeStep.icon;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Adaptive Cognitive Learning Loop
            </h3>
            <p className="text-xs text-slate-500">
              The continuous 5-step cycle that transforms passive reading into permanent recall
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">
            Current Phase: <strong className="text-indigo-600">{activeStep.title}</strong> ({activeStep.stepNumber}/5)
          </span>
          <button
            id="advance-cycle-btn"
            onClick={advanceCycleStep}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span>Next Phase</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Horizontal Pipeline Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 py-4">
        {cycleSteps.map((step, idx) => {
          const Icon = step.icon;
          const isCurrent = currentCycleStep === step.id;
          const isPassed = idx < activeIndex;

          return (
            <button
              key={step.id}
              id={`cycle-step-btn-${step.id}`}
              onClick={() => setCurrentCycleStep(step.id)}
              className={`group relative flex flex-col items-start rounded-xl p-3 text-left transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-indigo-50/90 ring-2 ring-indigo-600 shadow-xs'
                  : isPassed
                  ? 'bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200'
                  : 'bg-white hover:bg-slate-50/60 border border-slate-200 opacity-80'
              }`}
            >
              <div className="flex w-full items-center justify-between mb-2">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                    isCurrent
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : isPassed
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isPassed ? '✓' : step.stepNumber}
                </div>
                <Icon
                  className={`h-4 w-4 ${
                    isCurrent ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
              </div>

              <span
                className={`text-xs font-bold tracking-tight ${
                  isCurrent ? 'text-indigo-950' : 'text-slate-800'
                }`}
              >
                {step.title}
              </span>
              <span className="text-[11px] font-medium text-slate-500 line-clamp-1">
                {step.subtitle}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Phase Deep Dive & Action CTA */}
      <div className="mt-2 rounded-xl bg-gradient-to-r from-slate-50 to-indigo-50/40 p-4 border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-xs border border-slate-200">
            <StepIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                Phase {activeStep.stepNumber} in Focus
              </span>
              <span className="text-xs text-slate-400">•</span>
              <h4 className="text-xs font-bold text-slate-900">{activeStep.title}</h4>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">{activeStep.description}</p>
          </div>
        </div>

        <button
          id="cycle-active-action-btn"
          onClick={activeStep.onAction}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          <span>{activeStep.actionLabel}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
