import { useState, useEffect, useRef, useCallback } from 'react';

// Declare standard Web Speech API interfaces if not defined in standard TS dom lib
interface SpeechRecognitionResultItem {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionResultItem;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface BrowserSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: BrowserSpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: BrowserSpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: BrowserSpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: BrowserSpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionConstructor {
  new (): BrowserSpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export interface UseSpeechRecognitionOptions {
  onTranscript?: (newTranscript: string, isFinal: boolean) => void;
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

export interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  errorMessage: string | null;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  resetTranscript: () => void;
  clearError: () => void;
}

export const useSpeechRecognition = (
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn => {
  const {
    onTranscript,
    lang = 'en-US',
    continuous = true,
    interimResults = true,
  } = options;

  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  const isSupported =
    typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  // Initialize SpeechRecognition instance
  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) return;

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = lang;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const text = result[0]?.transcript || '';
          if (result.isFinal) {
            currentFinal += text;
          } else {
            currentInterim += text;
          }
        }

        if (currentFinal) {
          setTranscript((prev) => {
            const next = prev ? `${prev} ${currentFinal.trim()}` : currentFinal.trim();
            if (onTranscriptRef.current) {
              onTranscriptRef.current(currentFinal.trim(), true);
            }
            return next;
          });
          setInterimTranscript('');
        } else {
          setInterimTranscript(currentInterim);
          if (onTranscriptRef.current && currentInterim) {
            onTranscriptRef.current(currentInterim, false);
          }
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setIsListening(false);
        setInterimTranscript('');

        let message = 'Speech recognition error encountered.';
        switch (event.error) {
          case 'not-allowed':
          case 'permission-denied':
            message =
              'Microphone access denied. Please allow microphone permissions in your browser address bar.';
            break;
          case 'no-speech':
            message = 'No speech detected. Please speak clearly into your microphone.';
            break;
          case 'audio-capture':
            message = 'No microphone device was found on this device.';
            break;
          case 'network':
            message = 'Network error occurred during speech recognition.';
            break;
          case 'aborted':
            // User or script aborted, no error message necessary
            return;
          default:
            message = `Speech error (${event.error}). Please try again.`;
        }
        setErrorMessage(message);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Failed to initialize SpeechRecognition:', err);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
    };
  }, [isSupported, continuous, interimResults, lang]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setErrorMessage(
        'Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.'
      );
      return;
    }

    setErrorMessage(null);
    setInterimTranscript('');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err: any) {
        // If already started or aborting, ignore or restart
        if (err.name !== 'InvalidStateError') {
          console.error('Speech recognition start error:', err);
        }
      }
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('Speech recognition stop error:', err);
      }
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    errorMessage,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
    clearError,
  };
};
