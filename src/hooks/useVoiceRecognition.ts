
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

  const stopRecognition = useCallback(() => {
    console.log('Stopping main voice recognition');
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

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    
    setIsListening(false);
    setCurrentTranscript('');
  }, []);

  const startRecognition = useCallback(() => {
    if (!voiceMode || isActiveRef.current || processingRef.current) {
      return;
    }

    console.log('Starting main voice recognition for step:', currentStep);
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      rec.onstart = () => {
        console.log(`Main voice recognition started for ${language}, step ${currentStep}`);
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
        
        setCurrentTranscript(finalTranscript || interimTranscript);
        
        if (finalTranscript.trim()) {
          processingRef.current = true;
          console.log('Processing main voice command:', finalTranscript.trim());
          
          // Stop current recognition before processing
          if (recognitionRef.current) {
            recognitionRef.current.abort();
          }
          
          // Process the command
          onVoiceCommand(finalTranscript.trim().toLowerCase());
          
          // Clear transcript and restart after delay
          setTimeout(() => {
            setCurrentTranscript('');
            processingRef.current = false;
            
            // Restart recognition if still in voice mode
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
        console.log('Main voice recognition ended');
        setIsListening(false);
        
        // Only restart if we're still active and not processing
        if (voiceMode && isActiveRef.current && !processingRef.current) {
          restartTimeoutRef.current = setTimeout(() => {
            if (voiceMode && isActiveRef.current && !processingRef.current) {
              startRecognition();
            }
          }, 1500);
        }
      };
      
      rec.onerror = (event: any) => {
        console.log('Main speech recognition error:', event.error);
        setIsListening(false);
        
        // Only restart on non-abort errors if still active
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
        console.error('Failed to start main recognition:', error);
        isActiveRef.current = false;
      }
    }
  }, [voiceMode, language, currentStep, onVoiceCommand]);

  // Effect for managing voice recognition lifecycle
  useEffect(() => {
    if (voiceMode) {
      // Small delay to ensure no conflicts
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
    currentTranscript,
    awaitingConfirmation: false,
    speak,
    recognition: recognitionRef.current
  };
};
