import React, { useState } from 'react';
import {
  BrainCircuit,
  ArrowRight,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Mic,
  AlertTriangle,
  TrendingUp,
  Target,
  Zap,
  Check,
  ChevronRight,
  GraduationCap,
  ShieldCheck,
  Compass,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Molecule3DViewer } from './Molecule3DViewer';
import { ThreeTextTitle } from './ThreeTextTitle';

interface LandingPageProps {
  onOpenAuth: () => void;
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, onEnterApp }) => {
  const { signInDemoGuest } = useAuth();
  const [activeCyclePreview, setActiveCyclePreview] = useState<number>(0);

  const HERO_VARIANTS = [
    {
      prefix: "Master Tough Subjects With",
      highlight: "Precision AI Feedback",
      subtitle: "StudyPilot AI replaces random cramming with a structured cognitive loop. Create custom study plans, practice with smart quizzes, evaluate your depth with Feynman Teach-Back, and pinpoint exact weak spots before exam day."
    },
    {
      prefix: "Transform Exam Stress Into",
      highlight: "Predictable Academic Excellence",
      subtitle: "Experience personalized study roadmaps, active recall practice, and automated root-cause misconception diagnosis tailored to your exam schedule."
    },
    {
      prefix: "Ace Your High-Stakes Exams With",
      highlight: "Active Cognitive Recall",
      subtitle: "Stop passive highlighting. Leverage Feynman Teach-Back evaluation, real-time diagnostic heatmaps, and deliberate practice drills calibrated by AI."
    },
    {
      prefix: "Supercharge Your Study Velocity With",
      highlight: "Adaptive AI Mentorship",
      subtitle: "Turn complex STEM, CS, and humanities subjects into bite-sized daily modules with instant AI feedback and continuous streak tracking."
    },
    {
      prefix: "Eliminate Knowledge Gaps Before",
      highlight: "Exam Day Arrives",
      subtitle: "StudyPilot AI continuously diagnoses memory decay, boundary errors, and conceptual flaws, guiding you directly to high-scoring mastery."
    }
  ];

  const [heroVariantIndex, setHeroVariantIndex] = useState<number>(() =>
    Math.floor(Math.random() * 5)
  );
  const [isFading, setIsFading] = useState<boolean>(false);

  // Auto-cycle hero text every 7 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      handleNextVariant();
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const handleNextVariant = () => {
    setIsFading(true);
    setTimeout(() => {
      setHeroVariantIndex((prev) => (prev + 1) % HERO_VARIANTS.length);
      setIsFading(false);
    }, 200);
  };

  const currentHero = HERO_VARIANTS[heroVariantIndex];

  const cycleDetails = [
    {
      stepNum: '01',
      title: 'STUDY',
      subtitle: 'Personalized Adaptive Syllabus',
      desc: 'Gemini breaks down high-difficulty subjects into structured, bite-sized modules calibrated to your exam dates and daily study bandwidth.',
      tag: 'Cognitive Chunking',
      icon: BookOpen,
      color: 'from-blue-500 to-indigo-600',
      sample: {
        heading: 'AP Computer Science: Week 2 Roadmap',
        detail: '• Dynamic Programming: 0/1 Knapsack\n• Memoization tables vs Tabulation\n• Space complexity optimization'
      }
    },
    {
      stepNum: '02',
      title: 'PRACTICE',
      subtitle: 'Active Retrieval Quizzes',
      desc: 'Instead of passive re-reading, generate instant multiple-choice and conceptual retrieval checks designed to test deep edge cases.',
      tag: 'Active Recall',
      icon: CheckCircle2,
      color: 'from-indigo-600 to-violet-600',
      sample: {
        heading: 'Diagnostic Question 3 of 5',
        detail: 'Why must the 1D Knapsack capacity array be traversed backwards?\n✓ Prevents counting the same item multiple times in a single step.'
      }
    },
    {
      stepNum: '03',
      title: 'EVALUATE',
      subtitle: 'Feynman "Teach Back" Engine',
      desc: 'The gold standard of comprehension: explain a difficult concept back to the AI. Gemini grades your explanation on simplicity, completeness, and factual precision.',
      tag: 'Feynman Technique',
      icon: Mic,
      color: 'from-purple-600 to-pink-600',
      sample: {
        heading: 'Rubric Analysis: 88/100',
        detail: '• Simplicity: Excellent analogy using backpack packing.\n• Missing: Overlooked base case constraints on zero weight.'
      }
    },
    {
      stepNum: '04',
      title: 'DETECT WEAKNESS',
      subtitle: 'Automated Diagnostic Heatmap',
      desc: 'No more guessing why you lost points. StudyPilot maps every error to its root-cause cognitive misconception.',
      tag: 'Root-Cause Discovery',
      icon: AlertTriangle,
      color: 'from-amber-500 to-orange-600',
      sample: {
        heading: 'Identified Knowledge Gap: High Priority',
        detail: 'Binary Search index offset boundaries. You have missed 2 boundary checks in off-by-one comparisons.'
      }
    },
    {
      stepNum: '05',
      title: 'IMPROVE',
      subtitle: 'Targeted Remediation Loop',
      desc: 'Get immediate micro-recommendations and laser-focused drills to convert weak spots into high-scoring strengths.',
      tag: 'Deliberate Practice',
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-600',
      sample: {
        heading: '3-Minute Reinforcement Drill',
        detail: 'Targeted 3 questions on left <= right invariants. Result: 100% accuracy. Confidence score +32%.'
      }
    }
  ];

  const handleLaunchDemo = async () => {
    await signInDemoGuest();
    onEnterApp();
  };

  return (
    <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Dynamic Ambient Background Glows */}
      <div className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-blue-500/20 opacity-70 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge & Next Headline Trigger */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 dark:border-indigo-800/80 bg-indigo-50/90 dark:bg-indigo-950/80 px-4 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 shadow-xs mb-8 backdrop-blur-md transition-all">
            <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>The 5-Step Adaptive Student Learning Cycle</span>
            <button
              onClick={handleNextVariant}
              className="ml-1 p-0.5 rounded-full hover:bg-indigo-200/60 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 transition-colors cursor-pointer"
              title="Shuffle Hero Headline"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Dynamic Main Heading & Subtitle Container */}
          <div className={`transition-all duration-300 ${isFading ? 'opacity-0 scale-98 blur-xs' : 'opacity-100 scale-100 blur-none'}`}>
            <h1 className="mx-auto max-w-4xl font-heading text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl/tight">
              {currentHero.prefix}{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 dark:from-indigo-400 dark:via-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                {currentHero.highlight}
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {currentHero.subtitle}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="hero-launch-demo-btn"
              onClick={handleLaunchDemo}
              className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 px-7 py-4 text-sm font-extrabold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              <span>Explore Live Interactive Demo</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              id="hero-get-started-btn"
              onClick={onOpenAuth}
              className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-7 py-4 text-sm font-extrabold text-slate-800 dark:text-slate-200 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <span>Sign In / Create Account</span>
            </button>
          </div>

          {/* Feature Badges Grid */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 px-3.5 py-2 shadow-xs backdrop-blur-xs">
              <Check className="h-4 w-4 text-emerald-500" />
              <span>Zero Generic Chatbot Slop</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 px-3.5 py-2 shadow-xs backdrop-blur-xs">
              <Check className="h-4 w-4 text-emerald-500" />
              <span>Teach-Back Comprehension Rubric</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 px-3.5 py-2 shadow-xs backdrop-blur-xs">
              <Check className="h-4 w-4 text-emerald-500" />
              <span>Real Firestore Database Persistence</span>
            </div>
          </div>

          {/* Interactive 3D WebGL Molecule Animation & 3D Text Showcase */}
          <div className="mt-14 max-w-5xl mx-auto space-y-8 text-left">
            <ThreeTextTitle initialText="StudyPilot AI" />
            <Molecule3DViewer />
          </div>
        </div>
      </section>

      {/* Interactive Core Learning Cycle Demonstration */}
      <section className="py-16 bg-white/80 dark:bg-slate-900/80 border-y border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              The Cognitive Loop
            </span>
            <h2 className="mt-2 font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Study → Practice → Evaluate → Detect → Improve
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium">
              Click through the five interconnected phases to experience how StudyPilot drives long-term retention.
            </p>
          </div>

          {/* Cycle Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
            {cycleDetails.map((item, index) => {
              const Icon = item.icon;
              const isSelected = activeCyclePreview === index;
              return (
                <button
                  key={index}
                  id={`interactive-cycle-tab-${index}`}
                  onClick={() => setActiveCyclePreview(index)}
                  className={`flex flex-col items-center text-center p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/90 dark:bg-indigo-950/80 shadow-md ring-2 ring-indigo-500/40 scale-[1.02]'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl mb-2.5 text-white bg-gradient-to-tr ${item.color} shadow-xs`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <span className={`text-xs font-extrabold ${isSelected ? 'text-indigo-950 dark:text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                    {item.stepNum}. {item.title}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {item.tag}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Cycle Card Showcase */}
          {(() => {
            const current = cycleDetails[activeCyclePreview];
            const Icon = current.icon;
            return (
              <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-slate-50/90 dark:bg-slate-950/90 p-6 sm:p-10 shadow-lg backdrop-blur-md">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Left Column: Description & Action */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 px-3 py-1 text-xs font-bold border border-indigo-200 dark:border-indigo-800">
                      <span>Phase {current.stepNum} of 05</span>
                      <span>•</span>
                      <span>{current.tag}</span>
                    </div>
                    <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                      {current.subtitle}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {current.desc}
                    </p>

                    <div className="pt-3 flex items-center gap-4">
                      <button
                        onClick={handleLaunchDemo}
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-sm transition-all cursor-pointer"
                      >
                        <span>Try This Phase Live</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Code/Sample Preview */}
                  <div className="lg:col-span-5">
                    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-6 shadow-md">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-xl bg-gradient-to-tr ${current.color} text-white shadow-xs`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                            {current.sample.heading}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
                          Live Sample
                        </span>
                      </div>
                      <pre className="whitespace-pre-wrap font-sans text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50/80 dark:bg-slate-950/80 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                        {current.sample.detail}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* 3 Pillar Capabilities */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Student Features
            </span>
            <h2 className="mt-2 font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Engineered for High-Performing Students
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium">
              Every feature solves a specific bottleneck in real-world exam preparation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-8 shadow-sm hover:shadow-xl hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 mb-6 border border-indigo-200/60 dark:border-indigo-800/60">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-lg font-extrabold text-slate-900 dark:text-white mb-3">
                Automated Weakness Heatmap
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                When you miss a question or fumble an explanation, StudyPilot doesn't just show "incorrect". It classifies the mistake into boundary failure, memory decay, or conceptual confusion.
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-8 shadow-sm hover:shadow-xl hover:border-purple-500/40 hover:-translate-y-1 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 mb-6 border border-purple-200/60 dark:border-purple-800/60">
                <Mic className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-lg font-extrabold text-slate-900 dark:text-white mb-3">
                Feynman "Teach Back" Coach
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                "If you can't explain it simply, you don't understand it well enough." Speak or type your explanation. AI pinpoints logical holes and jargon crutches.
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-8 shadow-sm hover:shadow-xl hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mb-6 border border-emerald-200/60 dark:border-emerald-800/60">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-lg font-extrabold text-slate-900 dark:text-white mb-3">
                Dynamic Pacing & Daily Streaks
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Stay accountable with XP awards, daily streaks, and automatic recalculations when life happens and study schedules shift.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* High-Impact CTA Section */}
      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 p-10 sm:p-14 text-center text-white shadow-2xl border border-indigo-500/30">
            <h2 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Accelerate Your Academic Mastery?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-indigo-100/90 font-medium">
              Try StudyPilot AI right now with preloaded study plans or generate your own custom blueprint.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                id="footer-launch-demo-btn"
                onClick={handleLaunchDemo}
                className="w-full sm:w-auto rounded-2xl bg-white px-7 py-3.5 text-xs sm:text-sm font-extrabold text-indigo-950 shadow-lg hover:bg-indigo-50 transition-all cursor-pointer"
              >
                Launch Instant Student Workspace
              </button>
              <button
                id="footer-signin-btn"
                onClick={onOpenAuth}
                className="w-full sm:w-auto rounded-2xl border border-white/30 bg-white/10 backdrop-blur-md px-7 py-3.5 text-xs sm:text-sm font-extrabold text-white hover:bg-white/20 transition-all cursor-pointer"
              >
                Sign In / Register Account
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
