
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
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 1.3;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  }, [language]);

  useEffect(() => {
    if (!voiceMode || currentStep === 1) return;

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
        console.log('Voice input:', transcript);
        onVoiceCommand(transcript);
      };

      setRecognition(rec);
    }

    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, [voiceMode, currentStep, language, onVoiceCommand]);

  return {
    isListening,
    speak,
    recognition
  };
};
