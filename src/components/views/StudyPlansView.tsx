import React from 'react';
import { BookOpen, Plus, Calendar, Clock, Check, ChevronRight, Sparkles } from 'lucide-react';
import { useLearningData } from '../../context/LearningDataContext';

interface StudyPlansViewProps {
  onOpenNewPlan: () => void;
  onOpenTeachBack: (topic?: string) => void;
}

export const StudyPlansView: React.FC<StudyPlansViewProps> = ({ onOpenNewPlan, onOpenTeachBack }) => {
  const { studyPlans, activeStudyPlan, toggleTopicCompletion } = useLearningData();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
              Phase 1: STUDY
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500">Personalized Roadmaps</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Adaptive Study Plans
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            AI-structured learning milestones calibrated to your exam deadlines and daily hours.
          </p>
        </div>

        <button
          onClick={onOpenNewPlan}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Study Plan</span>
        </button>
      </div>

      {/* Plans List */}
      <div className="space-y-8">
        {studyPlans.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-slate-300 bg-white shadow-2xs">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No study plans created yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
              Create a personalized study plan for your exams. Gemini will generate structured modules, topic milestones, and estimated completion times.
            </p>
            <button
              onClick={onOpenNewPlan}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create Your First Study Plan</span>
            </button>
          </div>
        ) : (
          studyPlans.map(plan => {
          const isActive = plan.id === activeStudyPlan?.id;

          return (
            <div
              key={plan.id}
              className={`rounded-2xl border bg-white p-6 shadow-xs transition-all ${
                isActive ? 'border-indigo-600 ring-1 ring-indigo-600/30' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded-md bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                      {plan.subject}
                    </span>
                    {isActive && (
                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                        Active Target
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{plan.title}</h3>
                  <p className="text-xs text-slate-600 mt-1">{plan.description}</p>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 shrink-0">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>{plan.targetDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>{plan.estimatedHours} Total Hours</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-700">Syllabus Completion</span>
                  <span className="text-indigo-600">{plan.progressPercent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${plan.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Modules Accordion */}
              <div className="space-y-4">
                {plan.modules.map(module => (
                  <div key={module.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-slate-900">{module.title}</h4>
                      <span className="text-[11px] font-medium text-slate-500">{module.duration}</span>
                    </div>

                    <div className="space-y-2">
                      {module.topics.map(topic => (
                        <div
                          key={topic.id}
                          className="flex items-center justify-between rounded-lg bg-white p-2.5 shadow-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <button
                              onClick={() => toggleTopicCompletion(module.id, topic.id)}
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border cursor-pointer ${
                                topic.completed
                                  ? 'border-emerald-600 bg-emerald-600 text-white'
                                  : 'border-slate-300'
                              }`}
                            >
                              {topic.completed && <Check className="h-3 w-3 stroke-[3]" />}
                            </button>
                            <span
                              className={`text-xs ${
                                topic.completed ? 'line-through text-slate-400' : 'font-medium text-slate-800'
                              }`}
                            >
                              {topic.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-400">{topic.duration}</span>
                            {!topic.completed && (
                              <button
                                onClick={() => onOpenTeachBack(topic.name)}
                                className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700 hover:bg-purple-100 transition-colors cursor-pointer"
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
            </div>
          );
        })
      )}
      </div>
    </div>
  );
};
