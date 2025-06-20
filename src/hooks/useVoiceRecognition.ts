
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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(false);
  const processingRef = useRef(false);

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

  const stopRecognition = useCallback(() => {
    console.log('Stopping voice recognition');
    isActiveRef.current = false;
    processingRef.current = false;
    
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setIsListening(false);
    setCurrentTranscript('');
  }, []);

  const startRecognition = useCallback(() => {
    if (!voiceMode || isActiveRef.current || processingRef.current) {
      return;
    }

    console.log('Starting voice recognition for step:', currentStep);
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      rec.onstart = () => {
        console.log(`Voice recognition started for ${language}, step ${currentStep}`);
        setIsListening(true);
        isActiveRef.current = true;
      };
      
      rec.onresult = (event: any) => {
        if (processingRef.current) return;
        
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
        
        setCurrentTranscript(finalTranscript || interimTranscript);
        
        if (finalTranscript.trim()) {
          processingRef.current = true;
          console.log('Processing voice command:', finalTranscript.trim());
          
          // Process the command
          onVoiceCommand(finalTranscript.trim().toLowerCase());
          
          // Clear transcript after processing
          setTimeout(() => {
            setCurrentTranscript('');
            processingRef.current = false;
          }, 2000);
        }
      };
      
      rec.onend = () => {
        console.log('Voice recognition ended');
        setIsListening(false);
        
        // Restart if still active and not processing
        if (voiceMode && isActiveRef.current && !processingRef.current) {
          timeoutRef.current = setTimeout(() => {
            if (voiceMode && isActiveRef.current && !processingRef.current) {
              startRecognition();
            }
          }, 2000);
        }
      };
      
      rec.onerror = (event: any) => {
        console.log('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error !== 'aborted' && voiceMode && isActiveRef.current && !processingRef.current) {
          timeoutRef.current = setTimeout(() => {
            if (voiceMode && isActiveRef.current && !processingRef.current) {
              startRecognition();
            }
          }, 3000);
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

  useEffect(() => {
    return () => {
      stopRecognition();
      window.speechSynthesis.cancel();
    };
  }, [stopRecognition]);

  return {
    isListening,
    currentTranscript,
    awaitingConfirmation: false,
    speak,
    recognition: recognitionRef.current
  };
};
