
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface UseVoiceRecognitionProps {
  voiceMode: boolean;
  currentStep: number;
  onVoiceCommand: (transcript: string) => void;
}

export const useVoiceRecognition = ({ voiceMode, currentStep, onVoiceCommand }: UseVoiceRecognitionProps) => {
  const { language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const isActiveRef = useRef(false);
  const processingRef = useRef(false);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      if (language === 'hi') {
        utterance.lang = 'hi-IN';
        utterance.rate = 0.8;
      } else {
        utterance.lang = 'en-IN';
        utterance.rate = 0.9;
      }
      
      utterance.volume = 0.9;
      
      return new Promise<void>((resolve) => {
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        window.speechSynthesis.speak(utterance);
      });
    }
    return Promise.resolve();
  }, [language]);

  const cleanupRecognition = useCallback(() => {
    console.log('Cleaning up voice recognition');
    isActiveRef.current = false;
    processingRef.current = false;
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        console.log('Error aborting recognition:', e);
      }
      recognitionRef.current = null;
    }
    
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    
    setIsListening(false);
    setCurrentTranscript('');
  }, []);

  const startRecognition = useCallback(() => {
    if (!voiceMode || isActiveRef.current || processingRef.current) {
      console.log('Recognition not started:', { voiceMode, isActive: isActiveRef.current, processing: processingRef.current });
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.log('Speech recognition not supported');
      return;
    }

    console.log('Starting voice recognition for step:', currentStep);
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      console.log('Voice recognition started successfully');
      setIsListening(true);
      isActiveRef.current = true;
    };
    
    rec.onresult = (event: any) => {
      if (processingRef.current || !isActiveRef.current) return;
      
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      const displayTranscript = finalTranscript || interimTranscript;
      setCurrentTranscript(displayTranscript);
      
      if (finalTranscript.trim()) {
        console.log('Processing final transcript:', finalTranscript.trim());
        processingRef.current = true;
        
        // Stop current recognition
        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }
        
        // Process the command
        onVoiceCommand(finalTranscript.trim());
        
        // Clear and restart after processing
        setTimeout(() => {
          setCurrentTranscript('');
          processingRef.current = false;
          
          if (voiceMode && isActiveRef.current) {
            restartTimeoutRef.current = setTimeout(() => {
              if (voiceMode && isActiveRef.current && !processingRef.current) {
                startRecognition();
              }
            }, 2000);
          }
        }, 1000);
      }
    };
    
    rec.onend = () => {
      console.log('Voice recognition ended');
      setIsListening(false);
      
      if (voiceMode && isActiveRef.current && !processingRef.current) {
        restartTimeoutRef.current = setTimeout(() => {
          if (voiceMode && isActiveRef.current && !processingRef.current) {
            startRecognition();
          }
        }, 1000);
      }
    };
    
    rec.onerror = (event: any) => {
      console.log('Voice recognition error:', event.error);
      setIsListening(false);
      
      if (event.error !== 'aborted' && voiceMode && isActiveRef.current && !processingRef.current) {
        restartTimeoutRef.current = setTimeout(() => {
          if (voiceMode && isActiveRef.current && !processingRef.current) {
            startRecognition();
          }
        }, 2000);
      }
    };

    recognitionRef.current = rec;
    
    try {
      rec.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      isActiveRef.current = false;
    }
  }, [voiceMode, language, currentStep, onVoiceCommand]);

  // Main effect for managing voice recognition
  useEffect(() => {
    if (voiceMode) {
      const timer = setTimeout(() => {
        startRecognition();
      }, 500);
      
      return () => {
        clearTimeout(timer);
      };
    } else {
      cleanupRecognition();
    }
  }, [voiceMode, startRecognition, cleanupRecognition]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRecognition();
      window.speechSynthesis.cancel();
    };
  }, [cleanupRecognition]);

  return {
    isListening,
    currentTranscript,
    awaitingConfirmation: false,
    speak,
    recognition: recognitionRef.current
  };
};
