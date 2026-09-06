import React from 'react';
import { BrainCircuit, Sparkles, Shield, Cpu, RefreshCw } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* The 5-Step Learning Loop Banner */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/80 p-6 sm:p-8 mb-10 shadow-xs">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-xs">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  The StudyPilot 5-Step Cognitive Learning Cycle
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Backed by cognitive science: Active Recall, Feynman Teach-Back, and Automated Diagnostic Remediation.
                </p>
              </div>
            </div>

            {/* Visual Step Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
              <span className="rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 px-3 py-1.5 shadow-2xs">
                1. STUDY
              </span>
              <span className="text-slate-400 dark:text-slate-600 font-bold">→</span>
              <span className="rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 px-3 py-1.5 shadow-2xs">
                2. PRACTICE
              </span>
              <span className="text-slate-400 dark:text-slate-600 font-bold">→</span>
              <span className="rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 px-3 py-1.5 shadow-2xs">
                3. EVALUATE
              </span>
              <span className="text-slate-400 dark:text-slate-600 font-bold">→</span>
              <span className="rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 px-3 py-1.5 shadow-2xs">
                4. DETECT WEAKNESS
              </span>
              <span className="text-slate-400 dark:text-slate-600 font-bold">→</span>
              <span className="rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 px-3 py-1.5 shadow-2xs">
                5. IMPROVE
              </span>
            </div>
          </div>
        </div>

        {/* Links & Attribution */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <BrainCircuit className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">StudyPilot AI</span>
            <span>&copy; {new Date().getFullYear()} Educational Cognitive Intelligence.</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
              <Cpu className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Gemini AI Engine</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
              <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Cloud Firestore & Auth</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
              <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              <span>Cloud Run Container</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
