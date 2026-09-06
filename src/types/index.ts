export type LearningCycleStep = 'study' | 'practice' | 'evaluate' | 'detect' | 'improve';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  gradeLevel?: string;
  targetExam?: string;
  streakDays: number;
  totalStudyMinutes: number;
  totalQuizzesTaken: number;
  xpPoints: number;
  currentCycleStep: LearningCycleStep;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudyTopic {
  id: string;
  name: string;
  duration: string;
  completed: boolean;
  masteryLevel?: number; // 0 - 100
}

export interface StudyModule {
  id: string;
  title: string;
  duration: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  topics: StudyTopic[];
}

export interface StudyPlan {
  id: string;
  userId: string;
  title: string;
  subject: string;
  description: string;
  level: string;
  targetDate: string;
  estimatedHours: number;
  progressPercent: number;
  status: 'active' | 'completed' | 'archived';
  modules: StudyModule[];
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  selectedOption?: number;
}

export interface Quiz {
  id: string;
  userId: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  totalQuestions: number;
  correctCount: number;
  scorePercent: number;
  passed: boolean;
  questions: QuizQuestion[];
  createdAt: string;
  identifiedGaps?: string[];
}

export interface WeakTopic {
  id: string;
  userId: string;
  topicName: string;
  subject: string;
  severity: 'high' | 'medium' | 'low';
  confidenceScore: number; // 0 - 100
  lastErrorReason: string;
  recommendedAction: string;
  status: 'active' | 'improving' | 'resolved';
  detectedAt: string;
}

export interface TeachBackRubric {
  accuracy: number;
  clarity: number;
  completeness: number;
  simplicity: number;
}

export interface TeachBackSession {
  id: string;
  userId: string;
  topic: string;
  targetConcept: string;
  studentExplanation: string;
  score: number;
  rubric: TeachBackRubric;
  verdict: string;
  strengths: string[];
  misconceptions: string[];
  targetedImprovement: string;
  detectedWeakness?: string;
  createdAt: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: 'quick_review' | 'quiz_drill' | 'teach_back' | 'deep_dive';
  priority: 'high' | 'medium' | 'low';
  actionLabel: string;
  targetTopic: string;
}

export interface LearningSession {
  id: string;
  userId: string;
  topic: string;
  subject?: string;
  durationMinutes: number;
  notes?: string;
  completedAt: string;
}

export interface TopicProgress {
  id: string; // topicId
  userId: string;
  planId?: string;
  moduleId?: string;
  topicName: string;
  completed: boolean;
  masteryScore?: number;
  lastPracticedAt?: string;
  quizzesTaken?: number;
  teachBackScore?: number;
  updatedAt: string;
}

export interface ChatAttachment {
  name: string;
  type: string;
  size: number;
  base64: string;
  previewUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: ChatAttachment[];
  timestamp: string;
  isFallback?: boolean;
}

export interface ChatConversation {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: string;
  createdAt: string;
  pinned?: boolean;
}

