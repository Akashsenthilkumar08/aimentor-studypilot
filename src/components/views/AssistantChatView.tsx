import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Paperclip,
  Image as ImageIcon,
  FileText,
  X,
  Plus,
  Trash2,
  MessageSquare,
  Bot,
  User,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Menu,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLearningData } from '../../context/LearningDataContext';
import { ChatConversation, ChatMessage, ChatAttachment } from '../../types';
import { MarkdownRenderer } from '../chat/MarkdownRenderer';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

interface AssistantChatViewProps {
  initialPrompt?: string;
  onOpenStudyPlanModal?: () => void;
  onOpenQuizModal?: (topic?: string) => void;
  onOpenTeachBackModal?: (topic?: string) => void;
}

const SUGGESTED_PROMPTS = [
  { text: 'Explain quantum computing', tag: 'Physics & CS' },
  { text: 'Debug this Python code', tag: 'Programming' },
  { text: 'Help me solve this math problem', tag: 'Mathematics' },
  { text: 'What should I study today based on my data?', tag: 'Personalized' },
  { text: 'What should I improve based on my quiz results?', tag: 'Diagnostic' },
  { text: 'Explain the Feynman Technique simply', tag: 'Learning Science' },
  { text: 'Write a binary search algorithm in C++', tag: 'Algorithms' },
  { text: 'Explain ACID properties in databases', tag: 'Databases' }
];

export const AssistantChatView: React.FC<AssistantChatViewProps> = ({
  initialPrompt,
  onOpenStudyPlanModal,
  onOpenQuizModal,
  onOpenTeachBackModal
}) => {
  const { user, userProfile } = useAuth();
  const {
    activeStudyPlan,
    studyPlans,
    weakTopics,
    recentQuizzes,
    teachBackSessions,
    learningSessions,
    conversations,
    saveConversation,
    deleteConversation,
    clearAllConversations
  } = useLearningData();

  const [activeConvId, setActiveConvId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [useStudentData, setUseStudentData] = useState<boolean>(true);
  const [showHistorySidebar, setShowHistorySidebar] = useState<boolean>(true);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [showTeachBackTopics, setShowTeachBackTopics] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Web Speech API hook for dictating questions or teach-back explanations
  const {
    isListening,
    isSupported: isSpeechSupported,
    interimTranscript,
    errorMessage: speechError,
    startListening,
    stopListening,
    toggleListening,
    clearError: clearSpeechError,
    resetTranscript
  } = useSpeechRecognition({
    onTranscript: (newText, isFinal) => {
      if (isFinal && newText) {
        setInputPrompt(prev => {
          const trimmed = prev.trim();
          return trimmed ? `${trimmed} ${newText}` : newText;
        });
      }
    }
  });

  // Text-To-Speech Read Aloud for Quill responses
  const handleToggleReadAloud = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code snippet omitted for audio.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*#_~>]/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Quick helper to start teach-back dictation with topic context
  const handleStartTeachBackDictation = (topicName?: string) => {
    const chosenTopic =
      topicName ||
      weakTopics.find(w => w.status === 'active')?.topicName ||
      (activeStudyPlan?.modules?.[0]?.topics?.[0]?.name) ||
      'this core concept';

    const teachBackHeader = `[Teach-Back] Let me explain ${chosenTopic} in my own words: `;
    setInputPrompt(prev => {
      if (prev.includes('[Teach-Back]')) {
        return prev;
      }
      return prev ? `${prev}\n\n${teachBackHeader}` : teachBackHeader;
    });

    setShowTeachBackTopics(false);
    if (!isListening) {
      startListening();
    }
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Initialize or load conversation
  useEffect(() => {
    if (conversations.length > 0 && !activeConvId) {
      const first = conversations[0];
      setActiveConvId(first.id);
      setMessages(first.messages);
    } else if (conversations.length === 0 && !activeConvId) {
      handleNewConversation();
    }
  }, [conversations, activeConvId]);

  // Handle initial prompt passed from other views
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      setInputPrompt(initialPrompt);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [initialPrompt]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputPrompt]);

  const handleSelectConversation = (conv: ChatConversation) => {
    setActiveConvId(conv.id);
    setMessages(conv.messages);
    setAttachments([]);
  };

  const handleNewConversation = () => {
    const newId = 'conv-' + Date.now();
    const newConv: ChatConversation = {
      id: newId,
      userId: user?.uid || 'user-local',
      title: 'New Conversation',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setActiveConvId(newId);
    setMessages([]);
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Handle File Input
  const processFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      // Limit file size to 10MB
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} exceeds the 10MB limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setAttachments(prev => [
          ...prev,
          {
            name: file.name,
            type: file.type || 'application/octet-stream',
            size: file.size,
            base64,
            previewUrl: file.type.startsWith('image/') ? base64 : undefined
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Drag & drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  // Send Message
  const handleSendMessage = async (textToSend?: string) => {
    if (isListening) {
      stopListening();
    }
    const prompt = (textToSend || inputPrompt).trim();
    if ((!prompt && attachments.length === 0) || isLoading) return;

    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: prompt,
      attachments: attachments.length > 0 ? [...attachments] : undefined,
      timestamp: new Date().toISOString()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputPrompt('');
    setAttachments([]);
    setIsLoading(true);

    // Dynamic Title creation for first message
    const currentConvTitle =
      messages.length === 0
        ? prompt
          ? prompt.slice(0, 36) + (prompt.length > 36 ? '...' : '')
          : attachments.length > 0
          ? `Analysis of ${attachments[0].name}`
          : 'New Conversation'
        : undefined;

    // Compile real-time student context if enabled
    let studentContext = undefined;
    if (useStudentData) {
      const activeGaps = weakTopics.filter(w => w.status === 'active');
      const upcomingTopicsList: string[] = [];
      if (activeStudyPlan && activeStudyPlan.modules) {
        activeStudyPlan.modules.forEach(m => {
          m.topics.forEach(t => {
            if (!t.completed && upcomingTopicsList.length < 5) {
              upcomingTopicsList.push(`${t.name} (${m.title})`);
            }
          });
        });
      }

      studentContext = {
        displayName: userProfile?.displayName || user?.displayName || 'Student',
        targetExam: userProfile?.targetExam || 'General Studies',
        streakDays: userProfile?.streakDays ?? 0,
        activePlanTitle: activeStudyPlan ? activeStudyPlan.title : undefined,
        activePlanProgress: activeStudyPlan
          ? `${activeStudyPlan.modules?.filter(m => m.status === 'completed').length || 0}/${
              activeStudyPlan.modules?.length || 0
            } modules completed`
          : undefined,
        upcomingTopics: upcomingTopicsList,
        weakTopics: activeGaps.map(g => ({
          topic: g.topicName,
          severity: g.severity,
          score: g.confidenceScore
        })),
        recentQuizzes: recentQuizzes.slice(0, 5).map(q => ({
          topic: q.topic,
          scorePercent: q.scorePercent
        })),
        recentTeachBacks: teachBackSessions.slice(0, 3).map(t => ({
          topic: t.topic,
          score: t.score
        }))
      };
    }

    try {
      const res = await fetch('/api/gemini/assistant-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({
            role: m.role,
            content: m.content,
            attachments: m.attachments?.map(a => ({
              name: a.name,
              mimeType: a.type,
              base64: a.base64
            }))
          })),
          studentContext
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        role: 'assistant',
        content: data.reply || 'No response received.',
        timestamp: new Date().toISOString(),
        isFallback: data.isFallback
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);

      // Persist to conversation store
      const conversationToSave: ChatConversation = {
        id: activeConvId || 'conv-' + Date.now(),
        userId: user?.uid || 'user-local',
        title: currentConvTitle || conversations.find(c => c.id === activeConvId)?.title || 'StudyPilot Session',
        messages: finalMessages,
        updatedAt: new Date().toISOString(),
        createdAt: conversations.find(c => c.id === activeConvId)?.createdAt || new Date().toISOString()
      };

      await saveConversation(conversationToSave);
      if (!activeConvId) {
        setActiveConvId(conversationToSave.id);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        role: 'assistant',
        content:
          `Unable to complete the response at this moment.\n\n` +
          `*Error:* ${err.message || 'Network request failed'}. Please check your connection and try again.`,
        timestamp: new Date().toISOString(),
        isFallback: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-slate-50 relative"
      onDragOver={e => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={e => {
        e.preventDefault();
        setIsDragOver(false);
      }}
      onDrop={handleDrop}
    >
      {/* Drag & drop overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 bg-indigo-600/10 backdrop-blur-xs border-2 border-dashed border-indigo-500 flex flex-col items-center justify-center p-6 pointer-events-none">
          <ImageIcon className="w-16 h-16 text-indigo-600 animate-bounce mb-3" />
          <p className="text-base font-bold text-indigo-900">Drop your notes, code, or images here</p>
          <p className="text-xs text-indigo-700">Quill will analyze questions, diagrams, and code snippets</p>
        </div>
      )}

      {/* Conversations History Sidebar (Desktop & Mobile Drawer) */}
      <div
        className={`${
          showHistorySidebar ? 'translate-x-0 w-72 sm:w-80' : '-translate-x-full w-0 overflow-hidden'
        } shrink-0 bg-slate-900 text-slate-200 border-r border-slate-800 transition-all duration-200 flex flex-col h-full z-30`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white tracking-wide">Conversations</h2>
          </div>
          <button
            onClick={() => setShowHistorySidebar(false)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Collapse sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3 border-b border-slate-800/80">
          <button
            onClick={handleNewConversation}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 px-3 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Conversation</span>
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              <MessageSquare className="w-8 h-8 text-slate-700 mx-auto mb-2 opacity-50" />
              <p>No conversations yet.</p>
              <p className="text-[11px] text-slate-600 mt-1">Start chatting with Quill to create your first session.</p>
            </div>
          ) : (
            conversations.map(conv => {
              const isActive = conv.id === activeConvId;
              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`group relative flex items-center justify-between p-3 rounded-xl cursor-pointer text-xs transition-colors ${
                    isActive
                      ? 'bg-indigo-950/70 text-indigo-200 border border-indigo-500/30'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <div className="truncate">
                      <p className="font-medium truncate">{conv.title || 'Conversation'}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {conv.messages.length} message{conv.messages.length === 1 ? '' : 's'} •{' '}
                        {new Date(conv.updatedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      if (confirm('Delete this conversation?')) {
                        deleteConversation(conv.id);
                        if (activeConvId === conv.id) {
                          handleNewConversation();
                        }
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded-md transition-opacity cursor-pointer"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Clear All Option */}
        {conversations.length > 0 && (
          <div className="p-3 border-t border-slate-800">
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear all conversation history?')) {
                  clearAllConversations();
                  handleNewConversation();
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-rose-400/80 hover:text-rose-300 py-2 rounded-lg hover:bg-rose-950/20 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Conversations</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-slate-900 transition-colors duration-200">
        {/* Top Control Bar */}
        <div className="h-14 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            {!showHistorySidebar && (
              <button
                onClick={() => setShowHistorySidebar(true)}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Open conversation history"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Quill Chatbot</h2>
                  <span className="text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                    3.8 Flash
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  General Q&A • STEM • Coding • Math • Personalized Real-Time Guidance
                </p>
              </div>
            </div>
          </div>

          {/* Right Tools: Personalized Data Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseStudentData(!useStudentData)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                useStudentData
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="When enabled, Quill uses your real study plans, quizzes, and weak topics to personalize answers"
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${useStudentData ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">Use My Study Data:</span>
              <span>{useStudentData ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={handleNewConversation}
              className="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              title="Start fresh conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
          {messages.length === 0 ? (
            /* Empty State / Welcome Screen */
            <div className="max-w-3xl mx-auto py-8 text-center space-y-6 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400 shadow-xs">
                <Sparkles className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  How can I help you learn today?
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto mt-2 leading-relaxed">
                  Ask me anything across <strong>Math, Physics, Chemistry, Computer Science, Coding, Writing</strong>,
                  or request personalized recommendations using your real StudyPilot activity.
                </p>
              </div>

              {/* Real-time Student Context Summary Card if enabled */}
              {useStudentData && (
                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 text-left max-w-xl mx-auto shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Active Personalized Context Connected</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-600 dark:text-slate-400">
                    <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700">
                      <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-semibold">Active Syllabus</span>
                      <span className="font-semibold text-slate-900 dark:text-white truncate block">
                        {activeStudyPlan ? activeStudyPlan.title : 'No plan yet'}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700">
                      <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-semibold">Cognitive Gaps</span>
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {weakTopics.filter(w => w.status === 'active').length > 0
                          ? `${weakTopics.filter(w => w.status === 'active').length} weak areas flagged`
                          : 'Zero gaps detected'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Web Speech Dictation Quick Action Banner */}
              <div className="bg-gradient-to-r from-rose-50/80 via-purple-50/60 to-indigo-50/80 dark:from-slate-850 dark:via-purple-950/30 dark:to-indigo-950/30 border border-rose-200/80 dark:border-slate-700 rounded-2xl p-4 text-left max-w-xl mx-auto shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Web Speech Voice Input</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                          Live
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        Dictate questions, homework problems, or teach-back explanations instead of typing
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-3 pt-2.5 border-t border-rose-100 dark:border-slate-750">
                  <button
                    type="button"
                    onClick={() => {
                      if (!isListening) startListening();
                      textareaRef.current?.focus();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-rose-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Mic className="w-3.5 h-3.5 text-rose-500" />
                    <span>Dictate Question</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartTeachBackDictation()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Dictate Teach-Back Explanation</span>
                  </button>
                </div>
              </div>

              {/* Suggested Prompts Grid */}
              <div className="pt-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Suggested Prompts to Explore
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-2xl mx-auto text-left">
                  {SUGGESTED_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt.text)}
                      className="p-3 bg-white dark:bg-slate-800 hover:bg-indigo-50/50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 rounded-xl transition-all text-xs text-slate-800 dark:text-slate-200 font-medium flex items-center justify-between group cursor-pointer shadow-xs hover:shadow-sm"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md inline-block mb-1">
                          {prompt.tag}
                        </span>
                        <p className="text-slate-900 dark:text-white font-medium truncate">{prompt.text}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Active Messages List */
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map(msg => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 shadow-xs ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-tr-xs'
                          : 'bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-tl-xs'
                      }`}
                    >
                      {/* Render Attachments if any */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-2">
                          {msg.attachments.map((att, attIdx) => (
                            <div
                              key={attIdx}
                              className={`p-2 rounded-xl flex items-center gap-2 border text-xs ${
                                isUser
                                  ? 'bg-indigo-700 border-indigo-500 text-indigo-100'
                                  : 'bg-slate-50 border-slate-200 text-slate-800'
                              }`}
                            >
                              {att.previewUrl ? (
                                <img
                                  src={att.previewUrl}
                                  alt={att.name}
                                  className="w-10 h-10 object-cover rounded-lg"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <FileText className="w-5 h-5 text-indigo-400" />
                              )}
                              <div className="min-w-0 pr-2">
                                <p className="font-semibold truncate max-w-[140px]">{att.name}</p>
                                <p className="text-[10px] opacity-75">
                                  {(att.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Content */}
                      {isUser ? (
                        <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{msg.content}</p>
                      ) : (
                        <MarkdownRenderer content={msg.content} />
                      )}

                      {/* Fallback Simulation Notice if applicable */}
                      {msg.isFallback && (
                        <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-amber-700 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>Simulation mode active. Configure Gemini API key for complete live reasoning.</span>
                        </div>
                      )}

                      {/* Footer: Read aloud (for assistant) & Timestamp */}
                      <div
                        className={`text-[10px] mt-2 flex items-center gap-2 ${
                          isUser ? 'justify-end text-indigo-200' : 'justify-between text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {!isUser && (
                          <button
                            type="button"
                            onClick={() => handleToggleReadAloud(msg.id, msg.content)}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors cursor-pointer"
                            title={speakingMsgId === msg.id ? 'Stop audio' : 'Listen to Quill read this response aloud'}
                          >
                            {speakingMsgId === msg.id ? (
                              <>
                                <VolumeX className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                                <span className="text-rose-600 dark:text-rose-400 font-semibold">Stop Audio</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-600" />
                                <span>Read Aloud</span>
                              </>
                            )}
                          </button>
                        )}
                        <span>
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex gap-3 sm:gap-4 justify-start items-start">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs animate-pulse">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl rounded-tl-xs p-4 shadow-xs flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Quill is thinking...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar Area */}
        <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 shrink-0 transition-colors duration-200">
          <div className="max-w-3xl mx-auto">
            {/* Attachment preview pills */}
            {attachments.length > 0 && (
              <div className="mb-2.5 flex flex-wrap gap-2">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 px-3 py-1.5 rounded-xl text-xs shadow-xs"
                  >
                    {att.previewUrl ? (
                      <img
                        src={att.previewUrl}
                        alt={att.name}
                        className="w-5 h-5 rounded object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    )}
                    <span className="max-w-[160px] truncate font-medium">{att.name}</span>
                    <button
                      onClick={() => removeAttachment(idx)}
                      className="text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-200 p-0.5 rounded cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Speech Recognition Error Banner if any */}
            {speechError && (
              <div className="mb-2.5 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center justify-between text-xs text-rose-800 dark:text-rose-200 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{speechError}</span>
                </div>
                <button
                  type="button"
                  onClick={clearSpeechError}
                  className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 p-1 rounded cursor-pointer"
                  title="Dismiss alert"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Active Speech Listening HUD */}
            {isListening && (
              <div className="mb-2.5 p-3 rounded-2xl bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-indigo-500/10 border border-rose-300 dark:border-rose-800/80 backdrop-blur-xs flex flex-col gap-2 animate-in fade-in shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                    </span>
                    <span className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                      <span>Listening...</span>
                      <span className="font-normal text-slate-600 dark:text-slate-400 hidden sm:inline">
                        Speak your question or Feynman explanation
                      </span>
                    </span>
                    {/* Animated soundwave bars */}
                    <div className="flex items-center gap-0.5 h-3.5 ml-1">
                      <span className="w-1 h-2 bg-rose-500 rounded-full animate-[pulse_0.5s_ease-in-out_infinite]" />
                      <span className="w-1 h-3.5 bg-rose-500 rounded-full animate-[pulse_0.7s_ease-in-out_infinite_0.1s]" />
                      <span className="w-1 h-2 bg-rose-500 rounded-full animate-[pulse_0.6s_ease-in-out_infinite_0.2s]" />
                      <span className="w-1 h-3 bg-rose-500 rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.15s]" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={stopListening}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                    >
                      Done Listening
                    </button>
                  </div>
                </div>
                {interimTranscript && (
                  <div className="text-xs text-slate-700 dark:text-slate-200 bg-white/90 dark:bg-slate-800/90 p-2 rounded-xl border border-rose-200/60 dark:border-slate-700 italic">
                    "{interimTranscript}"
                  </div>
                )}
              </div>
            )}

            {/* Quick Action Pills: Teach-Back Voice Mode & Topic Selector */}
            <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowTeachBackTopics(!showTeachBackTopics)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors cursor-pointer shadow-2xs"
                  title="Dictate an explanation to evaluate understanding via the Feynman Technique"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Dictate Teach-Back Explanation</span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showTeachBackTopics ? 'rotate-90' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => handleStartTeachBackDictation()}
                  className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 underline cursor-pointer hidden sm:inline"
                >
                  Quick Start
                </button>
              </div>

              {!isSpeechSupported && (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                  Web Speech requires Chrome/Edge/Safari
                </span>
              )}
            </div>

            {/* Teach-Back Topic Selection Tray */}
            {showTeachBackTopics && (
              <div className="mb-2.5 p-3 bg-purple-50/70 dark:bg-slate-800/90 border border-purple-200 dark:border-purple-900 rounded-2xl animate-in fade-in shadow-xs">
                <p className="text-xs font-semibold text-purple-900 dark:text-purple-200 mb-2">
                  Select a topic to dictate your Feynman explanation back to Quill:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {weakTopics.filter(w => w.status === 'active').slice(0, 3).map(w => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => handleStartTeachBackDictation(w.topicName)}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-200 text-xs font-medium border border-purple-200 dark:border-purple-600 hover:bg-purple-100 dark:hover:bg-slate-650 cursor-pointer shadow-2xs"
                    >
                      🎯 {w.topicName} (Weak Topic)
                    </button>
                  ))}
                  {activeStudyPlan?.modules?.flatMap(m => m.topics).filter(t => !t.completed).slice(0, 3).map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleStartTeachBackDictation(t.name)}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-600 hover:bg-purple-50 dark:hover:bg-slate-650 cursor-pointer shadow-2xs"
                    >
                      📚 {t.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleStartTeachBackDictation('a core concept')}
                    className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium cursor-pointer shadow-2xs"
                  >
                    Custom Topic
                  </button>
                </div>
              </div>
            )}

            {/* Input Box */}
            <div className="relative flex items-end bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 rounded-2xl p-2 transition-all shadow-xs">
              {/* Attachment Button */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,.pdf,.txt,.py,.java,.cpp,.c,.js,.ts,.html,.css,.json"
                multiple
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-xl transition-colors cursor-pointer shrink-0"
                title="Attach question image, homework diagram, notes, or code file"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              {/* Web Speech Dictation Mic Button */}
              <button
                type="button"
                id="quill-dictation-btn"
                onClick={toggleListening}
                className={`p-2 rounded-xl transition-all cursor-pointer shrink-0 relative ${
                  isListening
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-500/30 animate-pulse ring-2 ring-rose-300 dark:ring-rose-800'
                    : 'text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                }`}
                title={
                  isListening
                    ? 'Stop voice dictation (listening active)'
                    : isSpeechSupported
                    ? 'Dictate question or teach-back (Web Speech API)'
                    : 'Web Speech API not supported in this browser'
                }
                disabled={!isSpeechSupported}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                {isListening && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                  </span>
                )}
              </button>

              {/* Text Input */}
              <textarea
                ref={textareaRef}
                value={inputPrompt}
                onChange={e => setInputPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isListening
                    ? 'Listening... Speak your question or explanation now...'
                    : 'Ask any question, or click the mic to dictate your question or teach-back...'
                }
                rows={1}
                className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden resize-none max-h-44 leading-relaxed"
              />

              {/* Send Button */}
              <button
                type="button"
                disabled={(!inputPrompt.trim() && attachments.length === 0) || isLoading}
                onClick={() => handleSendMessage()}
                className={`p-2.5 rounded-xl text-white transition-all cursor-pointer shrink-0 ${
                  (!inputPrompt.trim() && attachments.length === 0) || isLoading
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-xs'
                }`}
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Helper footer */}
            <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-400">
              <span>
                Press <strong>Enter</strong> to send, <strong>Shift+Enter</strong> for newline, or click <strong>🎙️ Mic</strong> to dictate
              </span>
              <span className="hidden sm:inline">Web Speech API Voice Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
