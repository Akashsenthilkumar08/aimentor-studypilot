import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LearningDataProvider } from './context/LearningDataContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './components/landing/LandingPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { StudyPlansView } from './components/views/StudyPlansView';
import { PracticeQuizView } from './components/views/PracticeQuizView';
import { TeachBackView } from './components/views/TeachBackView';
import { WeaknessRadarView } from './components/views/WeaknessRadarView';

import { AuthModal } from './components/auth/AuthModal';
import { NewStudyPlanModal } from './components/modals/NewStudyPlanModal';
import { TeachBackModal } from './components/modals/TeachBackModal';
import { QuickQuizModal } from './components/modals/QuickQuizModal';
import { WeakTopicsModal } from './components/modals/WeakTopicsModal';
import { LearnTopicModal } from './components/modals/LearnTopicModal';
import { AssistantChatView } from './components/views/AssistantChatView';

function MainApp() {
  const { userProfile, loading } = useAuth();

  // Navigation State
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [forceShowLanding, setForceShowLanding] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [assistantInitialPrompt, setAssistantInitialPrompt] = useState<string | undefined>(undefined);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [newPlanModalOpen, setNewPlanModalOpen] = useState(false);
  const [teachBackModalOpen, setTeachBackModalOpen] = useState(false);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [weakTopicsModalOpen, setWeakTopicsModalOpen] = useState(false);
  const [learnTopicModalOpen, setLearnTopicModalOpen] = useState(false);
  const [modalTopic, setModalTopic] = useState<string | undefined>(undefined);

  const handleOpenAssistant = (prompt?: string) => {
    setAssistantInitialPrompt(prompt);
    setActiveView('assistant');
  };

  const handleOpenTeachBack = (topic?: string) => {
    setModalTopic(topic);
    setTeachBackModalOpen(true);
  };

  const handleOpenQuiz = (topic?: string) => {
    setModalTopic(topic);
    setQuizModalOpen(true);
  };

  const handleOpenLearnTopic = (topic?: string) => {
    setModalTopic(topic);
    setLearnTopicModalOpen(true);
  };

  // If unauthenticated and hasn't clicked to enter demo app
  const showLanding = (!userProfile && !loading) || forceShowLanding;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
          <span className="text-xs font-semibold text-slate-600">Initializing StudyPilot AI...</span>
        </div>
      </div>
    );
  }

  // LANDING PAGE VIEW
  if (showLanding) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-200">
        <Navbar
          onOpenAuth={() => setAuthModalOpen(true)}
          onOpenNewPlan={() => setNewPlanModalOpen(true)}
          onOpenTeachBack={() => handleOpenTeachBack()}
          onOpenQuiz={() => handleOpenQuiz()}
          activeView="landing"
          setActiveView={view => {
            if (view !== 'landing') {
              setForceShowLanding(false);
              setActiveView(view);
            }
          }}
        />

        <main className="flex-1">
          <LandingPage
            onOpenAuth={() => setAuthModalOpen(true)}
            onEnterApp={() => {
              setForceShowLanding(false);
              setActiveView('dashboard');
            }}
          />
        </main>

        <Footer />

        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </div>
    );
  }

  // GEOMETRIC BALANCE IN-APP WORKSPACE
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:flex h-full">
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          onOpenNewPlan={() => setNewPlanModalOpen(true)}
        />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="h-full animate-in slide-in-from-left duration-200">
            <Sidebar
              activeView={activeView}
              setActiveView={setActiveView}
              onOpenNewPlan={() => {
                setMobileSidebarOpen(false);
                setNewPlanModalOpen(true);
              }}
              onCloseMobile={() => setMobileSidebarOpen(false)}
            />
          </div>
          <div className="flex-1" onClick={() => setMobileSidebarOpen(false)} />
        </div>
      )}

      {/* Main Column */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Geometric Balance Top Header */}
        <Header
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onOpenNewPlan={() => setNewPlanModalOpen(true)}
          onOpenQuiz={() => handleOpenQuiz()}
          onViewLanding={() => setForceShowLanding(true)}
          onOpenAssistant={() => handleOpenAssistant()}
        />

        {/* View Container */}
        {activeView === 'assistant' ? (
          <div className="flex-1 overflow-hidden">
            <AssistantChatView
              initialPrompt={assistantInitialPrompt}
              onOpenStudyPlanModal={() => setNewPlanModalOpen(true)}
              onOpenQuizModal={handleOpenQuiz}
              onOpenTeachBackModal={handleOpenTeachBack}
            />
          </div>
        ) : (
          <section className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {activeView === 'dashboard' && (
                <Dashboard
                  onOpenNewPlan={() => setNewPlanModalOpen(true)}
                  onOpenTeachBack={handleOpenTeachBack}
                  onOpenQuiz={handleOpenQuiz}
                  onOpenWeakness={() => setWeakTopicsModalOpen(true)}
                  onOpenLearnTopic={handleOpenLearnTopic}
                  onOpenAssistant={handleOpenAssistant}
                />
              )}

              {activeView === 'study_plans' && (
                <StudyPlansView
                  onOpenNewPlan={() => setNewPlanModalOpen(true)}
                  onOpenTeachBack={handleOpenTeachBack}
                />
              )}

              {activeView === 'practice' && (
                <PracticeQuizView
                  onOpenQuiz={handleOpenQuiz}
                  onOpenTeachBack={handleOpenTeachBack}
                />
              )}

              {activeView === 'teach_back' && (
                <TeachBackView onOpenTeachBack={handleOpenTeachBack} />
              )}

              {activeView === 'weaknesses' && (
                <WeaknessRadarView
                  onOpenTeachBack={handleOpenTeachBack}
                  onOpenQuiz={handleOpenQuiz}
                />
              )}
            </div>
          </section>
        )}
      </main>

      {/* Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      <NewStudyPlanModal
        isOpen={newPlanModalOpen}
        onClose={() => setNewPlanModalOpen(false)}
      />

      <TeachBackModal
        isOpen={teachBackModalOpen}
        onClose={() => {
          setTeachBackModalOpen(false);
          setModalTopic(undefined);
        }}
        defaultTopic={modalTopic}
      />

      <QuickQuizModal
        isOpen={quizModalOpen}
        onClose={() => {
          setQuizModalOpen(false);
          setModalTopic(undefined);
        }}
        defaultTopic={modalTopic}
      />

      <WeakTopicsModal
        isOpen={weakTopicsModalOpen}
        onClose={() => setWeakTopicsModalOpen(false)}
        onLaunchTeachBackForTopic={handleOpenTeachBack}
        onLaunchQuizForTopic={handleOpenQuiz}
      />

      <LearnTopicModal
        isOpen={learnTopicModalOpen}
        onClose={() => {
          setLearnTopicModalOpen(false);
          setModalTopic(undefined);
        }}
        defaultTopic={modalTopic}
        onLaunchQuizForTopic={handleOpenQuiz}
        onLaunchTeachBackForTopic={handleOpenTeachBack}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LearningDataProvider>
          <MainApp />
        </LearningDataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
