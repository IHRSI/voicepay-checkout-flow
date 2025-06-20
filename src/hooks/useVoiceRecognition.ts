
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
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(false);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      if (language === 'hi') {
        utterance.lang = 'hi-IN';
        utterance.rate = 1.4; // Faster Hindi speech
        utterance.pitch = 1.0;
      } else {
        utterance.lang = 'en-IN';
        utterance.rate = 1.1;
        utterance.pitch = 1.1;
      }
      
      utterance.volume = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, [language]);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current && isActiveRef.current) {
      console.log('Stopping voice recognition');
      isActiveRef.current = false;
      recognitionRef.current.abort();
      recognitionRef.current = null;
      setIsListening(false);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startRecognition = useCallback(() => {
    if (!voiceMode || isActiveRef.current) return;

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      
      rec.continuous = false; // Changed to false for better stability
      rec.interimResults = false;
      rec.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      rec.onstart = () => {
        console.log(`Voice recognition started in ${language} for step ${currentStep}`);
        setIsListening(true);
        isActiveRef.current = true;
      };
      
      rec.onend = () => {
        console.log('Voice recognition ended');
        setIsListening(false);
        
        // Auto-restart with delay if still in voice mode
        if (voiceMode && isActiveRef.current) {
          timeoutRef.current = setTimeout(() => {
            if (voiceMode && isActiveRef.current) {
              startRecognition();
            }
          }, 1000);
        }
      };
      
      rec.onerror = (event: any) => {
        console.log('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error !== 'aborted' && voiceMode && isActiveRef.current) {
          timeoutRef.current = setTimeout(() => {
            if (voiceMode && isActiveRef.current) {
              startRecognition();
            }
          }, 2000);
        }
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
        console.log(`Voice input (${language}):`, transcript);
        
        if (transcript.length > 0) {
          onVoiceCommand(transcript);
        }
      };

      recognitionRef.current = rec;
      
      try {
        rec.start();
      } catch (error) {
        console.error('Failed to start recognition:', error);
        isActiveRef.current = false;
      }
    }
  }, [voiceMode, language, currentStep, onVoiceCommand]);

  useEffect(() => {
    if (voiceMode) {
      // Small delay before starting
      timeoutRef.current = setTimeout(() => {
        startRecognition();
      }, 1000);
    } else {
      stopRecognition();
    }

    return () => {
      stopRecognition();
    };
  }, [voiceMode, startRecognition, stopRecognition]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecognition();
      window.speechSynthesis.cancel();
    };
  }, [stopRecognition]);

  return {
    isListening,
    speak,
    recognition: recognitionRef.current
  };
};
