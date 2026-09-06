import React from 'react';
import {
  Compass,
  BookOpen,
  CheckCircle2,
  Mic,
  AlertTriangle,
  Flame,
  Zap,
  Plus,
  ArrowRight,
  Sparkles,
  Check,
  Clock,
  Calendar,
  ChevronRight,
  Brain,
  Layers,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLearningData } from '../../context/LearningDataContext';
import { ActivityHeatmap } from './ActivityHeatmap';

interface DashboardProps {
  onOpenNewPlan: () => void;
  onOpenTeachBack: (topic?: string) => void;
  onOpenQuiz: (topic?: string) => void;
  onOpenWeakness: () => void;
  onOpenLearnTopic: (topic?: string) => void;
  onOpenAssistant?: (prompt?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenNewPlan,
  onOpenTeachBack,
  onOpenQuiz,
  onOpenWeakness,
  onOpenLearnTopic,
  onOpenAssistant
}) => {
  const { userProfile } = useAuth();
  const {
    activeStudyPlan,
    studyPlans,
    weakTopics,
    recentQuizzes,
    teachBackSessions,
    learningSessions,
    userActivities,
    toggleTopicCompletion,
    currentCycleStep,
    setCurrentCycleStep
  } = useLearningData();

  const activeWeakTopics = weakTopics.filter(w => w.status === 'active');
  const topWeakTopic = activeWeakTopics[0] || null;

  // Real calculations derived strictly from Firestore data
  const quizzesCompleted = recentQuizzes.length;
  const avgQuizAccuracy =
    quizzesCompleted > 0
      ? Math.round(recentQuizzes.reduce((sum, q) => sum + q.scorePercent, 0) / quizzesCompleted)
      : null;

  const totalStudyMinutes =
    userProfile?.totalStudyMinutes ||
    learningSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

  const nextReadyTopic =
    activeStudyPlan?.modules
      ?.flatMap(m => m.topics)
      ?.find(t => !t.completed)?.name || null;

  // Has the user generated any study activity yet?
  const isBrandNewUser =
    studyPlans.length === 0 &&
    recentQuizzes.length === 0 &&
    teachBackSessions.length === 0 &&
    learningSessions.length === 0;

  const cycleSteps = [
    {
      num: 1,
      name: 'Study',
      desc: 'Master concepts with AI',
      stepKey: 'study' as const,
      action: () => (activeStudyPlan ? onOpenLearnTopic(nextReadyTopic || undefined) : onOpenNewPlan())
    },
    {
      num: 2,
      name: 'Practice',
      desc: 'Adaptive diagnostic drills',
      stepKey: 'practice' as const,
      action: () => onOpenQuiz(nextReadyTopic || undefined)
    },
    {
      num: 3,
      name: 'Evaluate',
      desc: 'Teach back to AI',
      stepKey: 'evaluate' as const,
      action: () => onOpenTeachBack(topWeakTopic?.topicName || nextReadyTopic || undefined)
    },
    {
      num: 4,
      name: 'Detect Weakness',
      desc: 'Cognitive gap analysis',
      stepKey: 'detect' as const,
      action: () => onOpenWeakness()
    },
    {
      num: 5,
      name: 'Improve',
      desc: 'Targeted revision loops',
      stepKey: 'improve' as const,
      action: () => (topWeakTopic ? onOpenTeachBack(topWeakTopic.topicName) : onOpenQuiz())
    }
  ];

  const getStepCircleStyle = (stepKey: string, index: number) => {
    if (currentCycleStep === stepKey) {
      return 'bg-indigo-600 text-white shadow-xs';
    }
    const stepOrder = ['study', 'practice', 'evaluate', 'detect', 'improve'];
    const currentIndex = stepOrder.indexOf(currentCycleStep);
    if (currentIndex >= 0 && index < currentIndex) {
      return 'bg-slate-900 text-white';
    }
    return 'bg-slate-100 text-slate-400';
  };

  return (
    <div className="space-y-6">
      {/* Brand New User Zero State Banner (if no study activity yet) */}
      {isBrandNewUser && (
        <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-3 border border-indigo-100 dark:border-indigo-800">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized Learning Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Welcome to StudyPilot AI 👋
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300 font-medium mt-1">No study activity yet.</p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              StudyPilot AI operates on a 5-step cognitive mastery loop:{' '}
              <strong className="text-indigo-600 dark:text-indigo-400">STUDY → PRACTICE → EVALUATE → DETECT WEAKNESS → IMPROVE</strong>.
              Begin your learning journey by selecting an initial action below. Everything in your dashboard will be calculated in real-time from your actual activity.
            </p>

            {/* The primary onboarding actions */}
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <button
                id="create-study-plan-btn"
                onClick={onOpenNewPlan}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Study Plan</span>
              </button>
              <button
                id="learn-topic-btn"
                onClick={() => onOpenLearnTopic()}
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Learn a Topic</span>
              </button>
              <button
                id="take-quiz-btn"
                onClick={() => onOpenQuiz()}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Take a Quiz</span>
              </button>
              <button
                id="ask-assistant-btn"
                onClick={() => onOpenAssistant?.()}
                className="inline-flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ask Quill Chatbot</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-Time GitHub-Style Activity Heatmap & Streak Tracker */}
      <section id="activity-heatmap-section">
        <ActivityHeatmap
          activities={userActivities}
          onOpenNewPlan={onOpenNewPlan}
          onOpenQuiz={() => onOpenQuiz(nextReadyTopic || undefined)}
          onOpenTeachBack={() => onOpenTeachBack(topWeakTopic?.topicName || nextReadyTopic || undefined)}
          onOpenLearnTopic={() => onOpenLearnTopic(nextReadyTopic || undefined)}
        />
      </section>

      {/* 12-Column Geometric Balance Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 8 Cols (Hero card + 2-col Diagnostic Cards + Module Checklist) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Learning Track Hero Card */}
          <div className="bg-indigo-600 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-md">
            <div className="relative z-10 max-w-xl">
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold text-white mb-3 backdrop-blur-xs">
                {activeStudyPlan ? 'Current Active Roadmap' : 'Learning Track'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2 leading-tight">
                {activeStudyPlan ? (
                  <>Current Learning: <br />{activeStudyPlan.title}</>
                ) : (
                  <>Start Your Learning Journey</>
                )}
              </h2>
              <p className="text-indigo-100 mb-6 text-xs sm:text-sm leading-relaxed">
                {activeStudyPlan?.description ||
                  'No study plan selected yet. Create an adaptive roadmap calibrated to your target exam or explore any topic with Gemini.'}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {activeStudyPlan ? (
                  <>
                    <button
                      id="continue-study-path-btn"
                      onClick={() => onOpenQuiz(nextReadyTopic || activeStudyPlan.title)}
                      className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer text-xs sm:text-sm"
                    >
                      Practice Next Concept
                    </button>
                    <button
                      onClick={() => onOpenTeachBack(nextReadyTopic || activeStudyPlan.title)}
                      className="bg-indigo-700/80 hover:bg-indigo-700 border border-indigo-400/40 text-white px-5 py-3 rounded-xl font-semibold transition-all cursor-pointer text-xs sm:text-sm"
                    >
                      Teach Back Concept
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={onOpenNewPlan}
                      className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer text-xs sm:text-sm"
                    >
                      Create Study Plan
                    </button>
                    <button
                      onClick={() => onOpenLearnTopic()}
                      className="bg-indigo-700/80 hover:bg-indigo-700 border border-indigo-400/40 text-white px-5 py-3 rounded-xl font-semibold transition-all cursor-pointer text-xs sm:text-sm"
                    >
                      Learn a Topic
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Geometric Glowing Spheres */}
            <div className="absolute top-[-20%] right-[-5%] w-64 h-64 bg-indigo-500 rounded-full opacity-50 blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[10%] w-32 h-32 bg-sky-400 rounded-full opacity-30 blur-2xl pointer-events-none" />
          </div>

          {/* 2-Card Row: Weak Area Diagnostic & Ready to Test */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Card 1: Weak Topic */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              {topWeakTopic ? (
                <>
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 border border-amber-200/60 dark:border-amber-800">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Identified Gap</span>
                      </div>
                      <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-md">
                        {topWeakTopic.confidenceScore}% Measured
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{topWeakTopic.topicName}</h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                      {topWeakTopic.lastErrorReason}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={onOpenWeakness}
                      className="text-indigo-600 dark:text-indigo-400 font-bold text-xs sm:text-sm flex items-center gap-1 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                    >
                      <span>View Radar</span>
                      <span className="text-base leading-none">→</span>
                    </button>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          onOpenAssistant?.(
                            `Can you explain ${topWeakTopic.topicName} simply and help me overcome this gap: ${topWeakTopic.lastErrorReason || 'struggling with concepts'}`
                          )
                        }
                        className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        title="Ask Quill Chatbot about this topic"
                      >
                        <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                        <span>Ask Quill</span>
                      </button>
                      <button
                        onClick={() => onOpenTeachBack(topWeakTopic.topicName)}
                        className="text-xs font-semibold px-2.5 py-1 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/60 cursor-pointer"
                      >
                        Teach Back
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col justify-between h-full space-y-4">
                  <div>
                    <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 border border-slate-200/60 dark:border-slate-700 mb-4">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Cognitive Radar</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No learning gaps detected yet.</h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      As you complete quizzes and Feynman teach-backs, missed concepts will automatically appear here for root-cause remediation.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => onOpenQuiz()}
                      className="text-indigo-600 dark:text-indigo-400 font-bold text-xs sm:text-sm flex items-center gap-1 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                    >
                      <span>Take Diagnostic Quiz</span>
                      <span className="text-base leading-none">→</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Card 2: Ready to Test */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              {nextReadyTopic ? (
                <>
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 border border-emerald-200/60 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ready for Assessment</span>
                      </div>
                      <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                        Next Up
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{nextReadyTopic}</h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                      This is the next concept in your syllabus. Test retention or learn first principles with AI.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => onOpenQuiz(nextReadyTopic)}
                      className="text-indigo-600 dark:text-indigo-400 font-bold text-xs sm:text-sm flex items-center gap-1 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                    >
                      <span>Start Quiz</span>
                      <span className="text-base leading-none">→</span>
                    </button>
                    <button
                      onClick={() => onOpenLearnTopic(nextReadyTopic)}
                      className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/60 cursor-pointer"
                    >
                      Learn Concept
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col justify-between h-full space-y-4">
                  <div>
                    <div className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 border border-indigo-100 dark:border-indigo-800 mb-4">
                      <Brain className="w-3.5 h-3.5" />
                      <span>Active Recall</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Practice On-Demand</h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      Launch an AI-generated diagnostic drill on any topic of your choice to test edge cases.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => onOpenQuiz()}
                      className="text-indigo-600 dark:text-indigo-400 font-bold text-xs sm:text-sm flex items-center gap-1 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                    >
                      <span>Launch Custom Quiz</span>
                      <span className="text-base leading-none">→</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Syllabus Checklist */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Active Syllabus Milestones</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {activeStudyPlan
                    ? `Milestones for "${activeStudyPlan.title}". Check off topics to update your mastery.`
                    : 'Create a study plan to generate a structured curriculum.'}
                </p>
              </div>

              {activeStudyPlan && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    {activeStudyPlan.progressPercent}% Completed
                  </span>
                  <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${activeStudyPlan.progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {activeStudyPlan && activeStudyPlan.modules && activeStudyPlan.modules.length > 0 ? (
              <div className="space-y-3">
                {activeStudyPlan.modules.map(module => (
                  <div key={module.id} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{module.title}</span>
                      <span className="text-[11px] font-medium text-slate-400">{module.duration}</span>
                    </div>

                    <div className="space-y-2">
                      {module.topics.map(topic => (
                        <div
                          key={topic.id}
                          className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-lg p-2.5 border border-slate-100 dark:border-slate-800 shadow-xs"
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleTopicCompletion(module.id, topic.id)}
                              className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors cursor-pointer ${
                                topic.completed
                                  ? 'bg-indigo-600 border-indigo-600 text-white'
                                  : 'border-slate-300 dark:border-slate-600 hover:border-slate-400'
                              }`}
                            >
                              {topic.completed && <Check className="w-3 h-3 stroke-[3]" />}
                            </button>
                            <span
                              className={`text-xs ${
                                topic.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200 font-medium'
                              }`}
                            >
                              {topic.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400">{topic.duration}</span>
                            {!topic.completed && (
                              <button
                                onClick={() => onOpenTeachBack(topic.name)}
                                className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 cursor-pointer"
                              >
                                Teach Back
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/30">
                <BookOpen className="mx-auto w-8 h-8 text-slate-400 mb-2" />
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">No active study plan</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 mb-3">
                  Create a custom syllabus to schedule modules, topics, and exam countdowns.
                </p>
                <button
                  onClick={onOpenNewPlan}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Study Plan</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: 4 Cols (Geometric Learning Cycle + Dark Teach Back Mode card + Real Stats) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Learning Cycle Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Learning Cycle</h3>
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                5-Step Loop
              </span>
            </div>

            <div className="space-y-3">
              {cycleSteps.map((step, idx) => {
                const isActive = currentCycleStep === step.stepKey;

                return (
                  <div
                    key={step.num}
                    onClick={() => {
                      setCurrentCycleStep(step.stepKey);
                      step.action();
                    }}
                    className={`flex items-center gap-3.5 p-2.5 rounded-xl transition-all cursor-pointer ${
                      isActive ? 'bg-indigo-50/80 dark:bg-indigo-950/60 ring-1 ring-indigo-200 dark:ring-indigo-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${getStepCircleStyle(
                        step.stepKey,
                        idx
                      )}`}
                    >
                      {step.num}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{step.name}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">{step.desc}</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Teach Back Mode Card (Geometric Dark Slate-900 Card) */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-base">Teach Back Mode</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-md border border-indigo-500/30">
                Feynman Engine
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              {topWeakTopic ? (
                <>
                  The best way to learn is to teach. Explain{' '}
                  <strong className="text-indigo-200">'{topWeakTopic.topicName}'</strong> to the AI in
                  your own words.
                </>
              ) : (
                <>
                  Explain difficult concepts back to Gemini in plain words. AI analyzes simplicity, accuracy, and edge-case fallacies.
                </>
              )}
            </p>

            <div className="bg-slate-800 border border-slate-700 p-3 rounded-xl mb-4">
              <p className="text-xs text-indigo-300 font-mono">// Start explaining concept here...</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Gemini will grade simplicity, completeness, and pinpoint misconceptions.
              </p>
            </div>

            <button
              id="begin-teach-back-btn"
              onClick={() => onOpenTeachBack(topWeakTopic?.topicName || nextReadyTopic || undefined)}
              className="w-full bg-indigo-500 hover:bg-indigo-600 py-3 rounded-xl text-sm font-bold shadow-md transition-colors cursor-pointer text-center text-white"
            >
              Begin Teach Back
            </button>
          </div>

          {/* Real Retention Analytics Widget (Calculated strictly from real records) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Live Performance Metrics
              </h4>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-800">
                Real-Time Firestore
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center">
                <span className="block text-xl font-bold text-slate-900 dark:text-white">
                  {quizzesCompleted}
                </span>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Quizzes Completed</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center">
                <span className="block text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  {avgQuizAccuracy !== null ? `${avgQuizAccuracy}%` : '—'}
                </span>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  {avgQuizAccuracy !== null ? 'Avg Quiz Accuracy' : 'Accuracy (No Quizzes)'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center">
                <span className="block text-xl font-bold text-amber-600 dark:text-amber-400">
                  {activeWeakTopics.length}
                </span>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  {activeWeakTopics.length === 0 ? 'Learning Gaps (0)' : 'Active Gaps'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center">
                <span className="block text-xl font-bold text-slate-900 dark:text-white">
                  {totalStudyMinutes}m
                </span>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Study Time</span>
              </div>
            </div>

            {quizzesCompleted === 0 && activeWeakTopics.length === 0 && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                Zero demo data initialized. Metrics update automatically as you take quizzes and study topics.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
