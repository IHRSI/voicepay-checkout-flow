
import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface UseVoiceRecognitionProps {
  voiceMode: boolean;
  currentStep: number;
  onVoiceCommand: (transcript: string) => void;
}

export const useVoiceRecognition = ({ voiceMode, currentStep, onVoiceCommand }: UseVoiceRecognitionProps) => {
  const { language } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Enhanced language-specific voice settings
      if (language === 'hi') {
        utterance.lang = 'hi-IN';
        utterance.rate = 1.2; // Faster Hindi speech
        utterance.pitch = 1.0;
      } else {
        utterance.lang = 'en-IN';
        utterance.rate = 1.0;
        utterance.pitch = 1.1;
      }
      
      utterance.volume = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, [language]);

  useEffect(() => {
    if (!voiceMode) return;

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      
      rec.continuous = true;
      rec.interimResults = false;
      
      // Enhanced language-specific recognition settings
      if (language === 'hi') {
        rec.lang = 'hi-IN';
      } else {
        rec.lang = 'en-IN';
      }

      rec.onstart = () => {
        setIsListening(true);
        console.log(`Voice recognition started in ${language}`);
      };
      
      rec.onend = () => {
        setIsListening(false);
        // Auto-restart recognition for continuous listening
        setTimeout(() => {
          if (rec && voiceMode) {
            rec.start();
          }
        }, 500);
      };
      
      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error !== 'aborted' && voiceMode) {
          setTimeout(() => {
            if (rec) {
              rec.start();
            }
          }, 1000);
        }
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
        console.log(`Voice input (${language}):`, transcript);
        onVoiceCommand(transcript);
      };

      setRecognition(rec);
      
      // Start recognition with a small delay
      const startTimer = setTimeout(() => {
        if (rec && voiceMode) {
          rec.start();
        }
      }, 1000);

      return () => {
        clearTimeout(startTimer);
      };
    }

    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, [voiceMode, currentStep, language, onVoiceCommand]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognition) {
        recognition.abort();
      }
      window.speechSynthesis.cancel();
    };
  }, [recognition]);

  return {
    isListening,
    speak,
    recognition
  };
};
