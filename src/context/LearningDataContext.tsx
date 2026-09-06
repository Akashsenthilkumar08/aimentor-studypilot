import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocFromServer,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import { useAuth } from './AuthContext';
import { toLocalDateStr } from '../lib/heatmapUtils';
import {
  StudyPlan,
  WeakTopic,
  Quiz,
  Recommendation,
  LearningCycleStep,
  TeachBackSession,
  LearningSession,
  ChatConversation,
  UserActivityLog
} from '../types';

interface LearningDataContextType {
  activeStudyPlan: StudyPlan | null;
  studyPlans: StudyPlan[];
  weakTopics: WeakTopic[];
  recentQuizzes: Quiz[];
  recommendations: Recommendation[];
  teachBackSessions: TeachBackSession[];
  learningSessions: LearningSession[];
  userActivities: UserActivityLog[];
  conversations: ChatConversation[];
  currentCycleStep: LearningCycleStep;
  setCurrentCycleStep: (step: LearningCycleStep) => void;
  advanceCycleStep: () => void;
  toggleTopicCompletion: (moduleId: string, topicId: string) => Promise<void>;
  saveNewStudyPlan: (plan: Omit<StudyPlan, 'id' | 'userId' | 'createdAt'>) => Promise<StudyPlan>;
  addQuizResult: (quiz: Omit<Quiz, 'id' | 'userId' | 'createdAt'>) => Promise<Quiz>;
  addTeachBackSession: (session: Omit<TeachBackSession, 'id' | 'userId' | 'createdAt'>) => Promise<TeachBackSession>;
  addLearningSession: (session: { topic: string; subject?: string; durationMinutes: number; notes?: string }) => Promise<LearningSession>;
  logActivity: (act: { type: UserActivityLog['type']; title: string; description?: string }) => Promise<void>;
  resolveWeakTopic: (id: string) => Promise<void>;
  refreshRecommendations: () => void;
  saveConversation: (conv: ChatConversation) => Promise<void>;
  deleteConversation: (convId: string) => Promise<void>;
  clearAllConversations: () => Promise<void>;
  loading: boolean;
}

const LearningDataContext = createContext<LearningDataContextType | undefined>(undefined);

const CYCLE_ORDER: LearningCycleStep[] = ['study', 'practice', 'evaluate', 'detect', 'improve'];

export const LearningDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile, awardXp } = useAuth();
  const userId = user?.uid || userProfile?.id;

  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [activeStudyPlan, setActiveStudyPlan] = useState<StudyPlan | null>(null);
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [recentQuizzes, setRecentQuizzes] = useState<Quiz[]>([]);
  const [teachBackSessions, setTeachBackSessions] = useState<TeachBackSession[]>([]);
  const [learningSessions, setLearningSessions] = useState<LearningSession[]>([]);
  const [firestoreActivities, setFirestoreActivities] = useState<UserActivityLog[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentCycleStep, setCurrentCycleStep] = useState<LearningCycleStep>('study');
  const [loading, setLoading] = useState(true);

  // Connectivity check on mount
  useEffect(() => {
    async function verifyConnection() {
      if (!userId) return;
      try {
        const testRef = doc(db, 'users', userId);
        await getDocFromServer(testRef).catch(() => {
          // Document might not exist yet, but backend is reachable
        });
      } catch (err) {
        console.warn('Firestore server connectivity check info:', err);
      }
    }
    verifyConnection();
  }, [userId]);

  // Real-time Firestore Listeners - NO hard-coded mock records
  useEffect(() => {
    if (!userId) {
      setStudyPlans([]);
      setActiveStudyPlan(null);
      setWeakTopics([]);
      setRecentQuizzes([]);
      setTeachBackSessions([]);
      setLearningSessions([]);
      setFirestoreActivities([]);
      setConversations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubs: Unsubscribe[] = [];

    // 1. Study Plans Listener
    const plansPath = `users/${userId}/studyPlans`;
    try {
      const plansRef = collection(db, 'users', userId, 'studyPlans');
      const unsubPlans = onSnapshot(
        plansRef,
        snapshot => {
          const loaded: StudyPlan[] = [];
          snapshot.forEach(docSnap => {
            loaded.push({ ...(docSnap.data() as StudyPlan), id: docSnap.id });
          });
          // Sort latest first
          loaded.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setStudyPlans(loaded);
          setActiveStudyPlan(loaded.find(p => p.status === 'active') || loaded[0] || null);
          setLoading(false);
        },
        err => {
          console.warn('Real-time study plans listener warning:', err);
          setLoading(false);
        }
      );
      unsubs.push(unsubPlans);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, plansPath);
    }

    // 2. Weak Topics Listener
    const weakPath = `users/${userId}/weakTopics`;
    try {
      const weakRef = collection(db, 'users', userId, 'weakTopics');
      const unsubWeak = onSnapshot(
        weakRef,
        snapshot => {
          const loaded: WeakTopic[] = [];
          snapshot.forEach(docSnap => {
            loaded.push({ ...(docSnap.data() as WeakTopic), id: docSnap.id });
          });
          loaded.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
          setWeakTopics(loaded);
        },
        err => {
          console.warn('Real-time weak topics listener warning:', err);
        }
      );
      unsubs.push(unsubWeak);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, weakPath);
    }

    // 3. Quizzes Listener (support users/{userId}/quizResults and users/{userId}/quizzes)
    const quizzesPath = `users/${userId}/quizResults`;
    try {
      const quizzesRef = collection(db, 'users', userId, 'quizResults');
      const unsubQuizzes = onSnapshot(
        quizzesRef,
        snapshot => {
          const loaded: Quiz[] = [];
          snapshot.forEach(docSnap => {
            loaded.push({ ...(docSnap.data() as Quiz), id: docSnap.id });
          });
          loaded.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setRecentQuizzes(loaded);
        },
        err => {
          console.warn('Real-time quizzes listener warning:', err);
        }
      );
      unsubs.push(unsubQuizzes);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, quizzesPath);
    }

    // 4. Teach Back Sessions Listener
    const tbPath = `users/${userId}/teachBackSessions`;
    try {
      const tbRef = collection(db, 'users', userId, 'teachBackSessions');
      const unsubTb = onSnapshot(
        tbRef,
        snapshot => {
          const loaded: TeachBackSession[] = [];
          snapshot.forEach(docSnap => {
            loaded.push({ ...(docSnap.data() as TeachBackSession), id: docSnap.id });
          });
          loaded.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setTeachBackSessions(loaded);
        },
        err => {
          console.warn('Real-time teach back listener warning:', err);
        }
      );
      unsubs.push(unsubTb);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, tbPath);
    }

    // 5. Learning Sessions Listener
    const lsPath = `users/${userId}/learningSessions`;
    try {
      const lsRef = collection(db, 'users', userId, 'learningSessions');
      const unsubLs = onSnapshot(
        lsRef,
        snapshot => {
          const loaded: LearningSession[] = [];
          snapshot.forEach(docSnap => {
            loaded.push({ ...(docSnap.data() as LearningSession), id: docSnap.id });
          });
          loaded.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
          setLearningSessions(loaded);
        },
        err => {
          console.warn('Real-time learning sessions listener warning:', err);
        }
      );
      unsubs.push(unsubLs);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, lsPath);
    }

    // 6. Conversations Listener
    const convPath = `users/${userId}/conversations`;
    try {
      const convRef = collection(db, 'users', userId, 'conversations');
      const unsubConv = onSnapshot(
        convRef,
        snapshot => {
          const loaded: ChatConversation[] = [];
          snapshot.forEach(docSnap => {
            loaded.push({ ...(docSnap.data() as ChatConversation), id: docSnap.id });
          });
          loaded.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          setConversations(loaded);
        },
        err => {
          console.warn('Real-time conversations listener warning:', err);
        }
      );
      unsubs.push(unsubConv);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, convPath);
    }

    // 7. Activities Listener (Real-Time Firestore Activity Stream)
    const actPath = `users/${userId}/activities`;
    try {
      const actRef = collection(db, 'users', userId, 'activities');
      const unsubAct = onSnapshot(
        actRef,
        snapshot => {
          const loaded: UserActivityLog[] = [];
          snapshot.forEach(docSnap => {
            loaded.push({ ...(docSnap.data() as UserActivityLog), id: docSnap.id });
          });
          loaded.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setFirestoreActivities(loaded);
        },
        err => {
          console.warn('Real-time activities listener warning:', err);
        }
      );
      unsubs.push(unsubAct);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, actPath);
    }

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, [userId]);

  // Consolidate real-time Firestore activities with derived activities for complete user history
  const userActivities: UserActivityLog[] = useMemo(() => {
    const combinedMap = new Map<string, UserActivityLog>();

    // 1. Direct Firestore activity records
    firestoreActivities.forEach(act => {
      combinedMap.set(act.id, act);
    });

    // 2. Derive from learning sessions
    learningSessions.forEach(ls => {
      const id = `ls-act-${ls.id}`;
      if (!combinedMap.has(id)) {
        combinedMap.set(id, {
          id,
          userId: ls.userId || userId || '',
          type: 'session',
          title: `Study Session: ${ls.topic}`,
          description: `Completed ${ls.durationMinutes}m of focused study on ${ls.subject || 'General'}.`,
          timestamp: ls.completedAt,
          dateStr: toLocalDateStr(ls.completedAt)
        });
      }
    });

    // 3. Derive from quiz results
    recentQuizzes.forEach(q => {
      const id = `quiz-act-${q.id}`;
      if (!combinedMap.has(id)) {
        combinedMap.set(id, {
          id,
          userId: q.userId || userId || '',
          type: 'quiz',
          title: `Diagnostic Quiz: ${q.topic}`,
          description: `Scored ${q.scorePercent}% (${q.correctCount}/${q.totalQuestions} correct) on ${q.difficulty} difficulty.`,
          timestamp: q.createdAt,
          dateStr: toLocalDateStr(q.createdAt)
        });
      }
    });

    // 4. Derive from teach back sessions
    teachBackSessions.forEach(tb => {
      const id = `tb-act-${tb.id}`;
      if (!combinedMap.has(id)) {
        combinedMap.set(id, {
          id,
          userId: tb.userId || userId || '',
          type: 'teach_back',
          title: `Teach Back: ${tb.topic}`,
          description: `Achieved ${tb.score}% Feynman comprehension score. ${tb.verdict}`,
          timestamp: tb.createdAt,
          dateStr: toLocalDateStr(tb.createdAt)
        });
      }
    });

    // 5. Derive from study plans created
    studyPlans.forEach(p => {
      const id = `plan-act-${p.id}`;
      if (!combinedMap.has(id)) {
        combinedMap.set(id, {
          id,
          userId: p.userId || userId || '',
          type: 'plan',
          title: `Created Roadmap: ${p.title}`,
          description: `Targeting ${p.subject} syllabus (${p.level} level).`,
          timestamp: p.createdAt,
          dateStr: toLocalDateStr(p.createdAt)
        });
      }

      p.modules?.forEach(mod => {
        mod.topics?.forEach(t => {
          if (t.completed) {
            const tId = `topic-act-${p.id}-${t.id}`;
            if (!combinedMap.has(tId)) {
              combinedMap.set(tId, {
                id: tId,
                userId: p.userId || userId || '',
                type: 'task',
                title: `Completed Topic: ${t.name}`,
                description: `Mastered topic under ${mod.title}.`,
                timestamp: p.createdAt,
                dateStr: toLocalDateStr(p.createdAt)
              });
            }
          }
        });
      });
    });

    const list = Array.from(combinedMap.values());
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return list;
  }, [firestoreActivities, learningSessions, recentQuizzes, teachBackSessions, studyPlans, userId]);

  // Dynamically calculate recommendations strictly based on actual user activity
  const recommendations: Recommendation[] = useMemo(() => {
    const recs: Recommendation[] = [];
    const activeGaps = weakTopics.filter(w => w.status === 'active');

    // 1. High-priority remediation if weak topics exist
    if (activeGaps.length > 0) {
      const topGap = activeGaps[0];
      recs.push({
        id: `rec-gap-${topGap.id}`,
        title: `Remediate: ${topGap.topicName}`,
        description: topGap.recommendedAction || 'Engage in a Feynman Teach-Back session to resolve detected cognitive friction.',
        category: 'teach_back',
        priority: 'high',
        actionLabel: 'Teach Back Now',
        targetTopic: topGap.topicName
      });
    }

    // 2. Next topic to study from active study plan
    if (activeStudyPlan) {
      const nextTopic = activeStudyPlan.modules
        ?.flatMap(m => m.topics)
        ?.find(t => !t.completed);

      if (nextTopic) {
        recs.push({
          id: `rec-next-${nextTopic.id}`,
          title: `Study Next: ${nextTopic.name}`,
          description: `Continue your ${activeStudyPlan.title} curriculum. Target duration: ${nextTopic.duration}.`,
          category: 'deep_dive',
          priority: 'medium',
          actionLabel: 'Learn Concept',
          targetTopic: nextTopic.name
        });
      }
    }

    // 3. Quiz reinforcement if quizzes have been taken
    if (recentQuizzes.length > 0) {
      const lastQuiz = recentQuizzes[0];
      if (!lastQuiz.passed) {
        recs.push({
          id: `rec-retake-${lastQuiz.id}`,
          title: `Retake Diagnostic: ${lastQuiz.topic}`,
          description: `Score was ${lastQuiz.scorePercent}%. Reinforce missed concepts to secure mastery.`,
          category: 'quiz_drill',
          priority: 'high',
          actionLabel: 'Retake Quiz',
          targetTopic: lastQuiz.topic
        });
      }
    }

    // 4. If brand new user with no activity, provide guidance prompts
    if (studyPlans.length === 0 && recentQuizzes.length === 0 && teachBackSessions.length === 0) {
      recs.push({
        id: 'rec-start-plan',
        title: 'Step 1: Create a Personalized Study Plan',
        description: 'Set your exam timeline and let Gemini structure an adaptive syllabus.',
        category: 'deep_dive',
        priority: 'high',
        actionLabel: 'Create Study Plan',
        targetTopic: 'Personalized Study Plan'
      });
      recs.push({
        id: 'rec-start-quiz',
        title: 'Step 2: Take a Diagnostic Quiz',
        description: 'Test your initial retention to detect any foundational gaps.',
        category: 'quiz_drill',
        priority: 'medium',
        actionLabel: 'Take a Quiz',
        targetTopic: 'Diagnostic Assessment'
      });
      recs.push({
        id: 'rec-start-teach',
        title: 'Step 3: Feynman Teach-Back',
        description: 'Explain a core topic back to AI in simple terms to prove true comprehension.',
        category: 'teach_back',
        priority: 'low',
        actionLabel: 'Start Teach Back',
        targetTopic: 'Feynman Technique'
      });
    }

    return recs;
  }, [weakTopics, activeStudyPlan, recentQuizzes, studyPlans, teachBackSessions]);

  const advanceCycleStep = () => {
    const currentIndex = CYCLE_ORDER.indexOf(currentCycleStep);
    const nextIndex = (currentIndex + 1) % CYCLE_ORDER.length;
    setCurrentCycleStep(CYCLE_ORDER[nextIndex]);
  };

  const logActivity = async (act: {
    type: UserActivityLog['type'];
    title: string;
    description?: string;
  }) => {
    const currentUserId = userId || 'user-' + Date.now();
    const actId = 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const now = new Date();
    const dateStr = toLocalDateStr(now);
    const newActivity: UserActivityLog = {
      id: actId,
      userId: currentUserId,
      type: act.type,
      title: act.title,
      description: act.description || '',
      timestamp: now.toISOString(),
      dateStr
    };

    try {
      const actRef = doc(db, 'users', currentUserId, 'activities', actId);
      await setDoc(actRef, newActivity);
    } catch (e) {
      console.warn('Could not persist activity log to Firestore:', e);
    }
  };

  const toggleTopicCompletion = async (moduleId: string, topicId: string) => {
    if (!activeStudyPlan || !userId) return;

    let totalTopics = 0;
    let completedTopics = 0;
    let toggledTopicName = '';
    let toggledState = false;

    const updatedModules = activeStudyPlan.modules.map(mod => {
      if (mod.id !== moduleId) {
        mod.topics.forEach(t => {
          totalTopics++;
          if (t.completed) completedTopics++;
        });
        return mod;
      }

      const updatedTopics = mod.topics.map(t => {
        if (t.id === topicId) {
          const nextVal = !t.completed;
          totalTopics++;
          if (nextVal) {
            completedTopics++;
            awardXp(50);
          }
          toggledTopicName = t.name;
          toggledState = nextVal;
          return { ...t, completed: nextVal, masteryLevel: nextVal ? 90 : 30 };
        }
        totalTopics++;
        if (t.completed) completedTopics++;
        return t;
      });

      return { ...mod, topics: updatedTopics };
    });

    const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    const updatedPlan: StudyPlan = {
      ...activeStudyPlan,
      modules: updatedModules,
      progressPercent
    };

    setActiveStudyPlan(updatedPlan);
    setStudyPlans(prev => prev.map(p => (p.id === updatedPlan.id ? updatedPlan : p)));

    // Real-time Firestore document update
    try {
      const planDocRef = doc(db, 'users', userId, 'studyPlans', updatedPlan.id);
      await updateDoc(planDocRef, {
        modules: updatedModules,
        progressPercent
      });

      // Also persist topic progress record at users/{uid}/progress/{topicId}
      const progressRef = doc(db, 'users', userId, 'progress', topicId);
      await setDoc(progressRef, {
        id: topicId,
        userId,
        topicName: toggledTopicName,
        completed: toggledState,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      if (toggledState) {
        await logActivity({
          type: 'task',
          title: `Completed Topic: ${toggledTopicName}`,
          description: `Mastered milestone in ${activeStudyPlan.title}`
        });
      }
    } catch (e) {
      console.warn('Firestore topic completion update warning:', e);
    }
  };

  const saveNewStudyPlan = async (
    planData: Omit<StudyPlan, 'id' | 'userId' | 'createdAt'>
  ): Promise<StudyPlan> => {
    const currentUserId = userId || 'user-' + Date.now();
    const newId = 'plan-' + Date.now();
    const newPlan: StudyPlan = {
      ...planData,
      id: newId,
      userId: currentUserId,
      createdAt: new Date().toISOString()
    };

    // Update state immediately
    setStudyPlans(prev => [newPlan, ...prev]);
    setActiveStudyPlan(newPlan);
    awardXp(150);

    // Save directly to Firestore
    try {
      const planRef = doc(db, 'users', currentUserId, 'studyPlans', newId);
      await setDoc(planRef, newPlan);

      await logActivity({
        type: 'plan',
        title: `Created Roadmap: ${planData.title}`,
        description: `Targeting ${planData.subject} syllabus (${planData.level} level).`
      });
    } catch (e) {
      console.warn('Could not save study plan to Firestore:', e);
    }

    return newPlan;
  };

  const addQuizResult = async (quizData: Omit<Quiz, 'id' | 'userId' | 'createdAt'>): Promise<Quiz> => {
    const currentUserId = userId || 'user-' + Date.now();
    const newId = 'quiz-' + Date.now();
    const newQuiz: Quiz = {
      ...quizData,
      id: newId,
      userId: currentUserId,
      createdAt: new Date().toISOString()
    };

    setRecentQuizzes(prev => [newQuiz, ...prev]);
    awardXp(quizData.passed ? 100 : 40);

    // Immediately save quiz result to users/{userId}/quizResults
    try {
      const quizRef = doc(db, 'users', currentUserId, 'quizResults', newId);
      await setDoc(quizRef, newQuiz);

      await logActivity({
        type: 'quiz',
        title: `Diagnostic Quiz: ${quizData.topic}`,
        description: `Scored ${quizData.scorePercent}% (${quizData.correctCount}/${quizData.totalQuestions} correct) on ${quizData.difficulty} difficulty.`
      });
    } catch (e) {
      console.warn('Could not save quiz result to Firestore:', e);
    }

    // If student had errors (score < 75%), register real weak topic to close the loop:
    // STUDY -> PRACTICE -> EVALUATE -> DETECT WEAKNESS -> IMPROVE
    if (quizData.scorePercent < 75) {
      const detectedWeakness: WeakTopic = {
        id: 'weak-' + Date.now(),
        userId: currentUserId,
        topicName: quizData.topic,
        subject: activeStudyPlan?.subject || 'Diagnostic Focus',
        severity: quizData.scorePercent < 50 ? 'high' : 'medium',
        confidenceScore: quizData.scorePercent,
        lastErrorReason: `Diagnostic test score: ${quizData.correctCount}/${quizData.totalQuestions} questions correct.`,
        recommendedAction: `Reinforce ${quizData.topic} via Feynman Teach-Back and targeted concept drill.`,
        status: 'active',
        detectedAt: new Date().toISOString()
      };

      setWeakTopics(prev => [detectedWeakness, ...prev.filter(w => w.topicName !== detectedWeakness.topicName)]);

      try {
        const weakDocRef = doc(db, 'users', currentUserId, 'weakTopics', detectedWeakness.id);
        await setDoc(weakDocRef, detectedWeakness);
      } catch (e) {
        console.warn('Could not persist weak topic to Firestore:', e);
      }

      setCurrentCycleStep('detect');
    } else {
      setCurrentCycleStep('improve');
    }

    return newQuiz;
  };

  const addTeachBackSession = async (
    sessionData: Omit<TeachBackSession, 'id' | 'userId' | 'createdAt'>
  ): Promise<TeachBackSession> => {
    const currentUserId = userId || 'user-' + Date.now();
    const newId = 'tb-' + Date.now();
    const newSession: TeachBackSession = {
      ...sessionData,
      id: newId,
      userId: currentUserId,
      createdAt: new Date().toISOString()
    };

    setTeachBackSessions(prev => [newSession, ...prev]);
    awardXp(120);

    // Persist to users/{userId}/teachBackSessions
    try {
      const tbRef = doc(db, 'users', currentUserId, 'teachBackSessions', newId);
      await setDoc(tbRef, newSession);

      await logActivity({
        type: 'teach_back',
        title: `Teach Back: ${sessionData.topic}`,
        description: `Achieved ${sessionData.score}% Feynman comprehension score. ${sessionData.verdict}`
      });
    } catch (e) {
      console.warn('Could not persist teach-back session to Firestore:', e);
    }

    // If teach back detected a weakness, register real weak topic
    if (sessionData.detectedWeakness) {
      const newWeak: WeakTopic = {
        id: 'weak-tb-' + Date.now(),
        userId: currentUserId,
        topicName: sessionData.detectedWeakness,
        subject: activeStudyPlan?.subject || 'Core Knowledge',
        severity: sessionData.score < 70 ? 'high' : 'medium',
        confidenceScore: sessionData.score,
        lastErrorReason: sessionData.misconceptions[0] || 'Unclear conceptual boundaries identified during explanation.',
        recommendedAction: sessionData.targetedImprovement || 'Review foundational definitions and re-explain.',
        status: 'active',
        detectedAt: new Date().toISOString()
      };

      setWeakTopics(prev => [newWeak, ...prev.filter(w => w.topicName !== newWeak.topicName)]);
      try {
        const weakDocRef = doc(db, 'users', currentUserId, 'weakTopics', newWeak.id);
        await setDoc(weakDocRef, newWeak);
      } catch (e) {
        console.warn('Could not persist teach-back weakness to Firestore:', e);
      }
      setCurrentCycleStep('detect');
    } else {
      setCurrentCycleStep('improve');
    }

    return newSession;
  };

  const addLearningSession = async (session: {
    topic: string;
    subject?: string;
    durationMinutes: number;
    notes?: string;
  }): Promise<LearningSession> => {
    const currentUserId = userId || 'user-' + Date.now();
    const newId = 'ls-' + Date.now();
    const newSession: LearningSession = {
      id: newId,
      userId: currentUserId,
      topic: session.topic,
      subject: session.subject || activeStudyPlan?.subject || 'General',
      durationMinutes: session.durationMinutes,
      notes: session.notes,
      completedAt: new Date().toISOString()
    };

    setLearningSessions(prev => [newSession, ...prev]);
    awardXp(Math.max(session.durationMinutes * 4, 30));

    // Persist to users/{uid}/learningSessions/{sessionId}
    try {
      const lsRef = doc(db, 'users', currentUserId, 'learningSessions', newId);
      await setDoc(lsRef, newSession);

      await logActivity({
        type: 'session',
        title: `Study Session: ${session.topic}`,
        description: `Completed ${session.durationMinutes}m of focused study on ${session.subject || 'General'}.`
      });
    } catch (e) {
      console.warn('Could not persist learning session to Firestore:', e);
    }

    return newSession;
  };

  const resolveWeakTopic = async (id: string) => {
    if (!userId) return;
    setWeakTopics(prev =>
      prev.map(w => (w.id === id ? { ...w, status: 'resolved', confidenceScore: 95 } : w))
    );
    awardXp(80);

    try {
      const weakDocRef = doc(db, 'users', userId, 'weakTopics', id);
      await updateDoc(weakDocRef, {
        status: 'resolved',
        confidenceScore: 95
      });
    } catch (e) {
      console.warn('Could not resolve weak topic in Firestore:', e);
    }
  };

  const refreshRecommendations = () => {
    // Computed dynamically by useMemo
  };

  const saveConversation = async (conv: ChatConversation) => {
    const currentUserId = userId || 'user-' + Date.now();
    const updatedConv: ChatConversation = {
      ...conv,
      userId: currentUserId,
      updatedAt: new Date().toISOString()
    };

    setConversations(prev => {
      const exists = prev.some(c => c.id === updatedConv.id);
      if (exists) {
        return prev.map(c => (c.id === updatedConv.id ? updatedConv : c));
      }
      return [updatedConv, ...prev];
    });

    try {
      const convRef = doc(db, 'users', currentUserId, 'conversations', updatedConv.id);
      await setDoc(convRef, updatedConv);
    } catch (e) {
      console.warn('Could not persist conversation to Firestore:', e);
    }
  };

  const deleteConversation = async (convId: string) => {
    setConversations(prev => prev.filter(c => c.id !== convId));
    if (!userId) return;
    try {
      const convRef = doc(db, 'users', userId, 'conversations', convId);
      await deleteDoc(convRef);
    } catch (e) {
      console.warn('Could not delete conversation from Firestore:', e);
    }
  };

  const clearAllConversations = async () => {
    const toDelete = [...conversations];
    setConversations([]);
    if (!userId) return;
    try {
      await Promise.all(
        toDelete.map(c => deleteDoc(doc(db, 'users', userId, 'conversations', c.id)))
      );
    } catch (e) {
      console.warn('Could not clear conversations from Firestore:', e);
    }
  };

  return (
    <LearningDataContext.Provider
      value={{
        activeStudyPlan,
        studyPlans,
        weakTopics,
        recentQuizzes,
        recommendations,
        teachBackSessions,
        learningSessions,
        userActivities,
        conversations,
        currentCycleStep,
        setCurrentCycleStep,
        advanceCycleStep,
        toggleTopicCompletion,
        saveNewStudyPlan,
        addQuizResult,
        addTeachBackSession,
        addLearningSession,
        logActivity,
        resolveWeakTopic,
        refreshRecommendations,
        saveConversation,
        deleteConversation,
        clearAllConversations,
        loading
      }}
    >
      {children}
    </LearningDataContext.Provider>
  );
};

export const useLearningData = () => {
  const context = useContext(LearningDataContext);
  if (!context) {
    throw new Error('useLearningData must be used within a LearningDataProvider');
  }
  return context;
};
