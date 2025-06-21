
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
  const speechInProgressRef = useRef(false);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      speechInProgressRef.current = true;
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
        utterance.onend = () => {
          speechInProgressRef.current = false;
          resolve();
        };
        utterance.onerror = () => {
          speechInProgressRef.current = false;
          resolve();
        };
        window.speechSynthesis.speak(utterance);
      });
    }
    speechInProgressRef.current = false;
    return Promise.resolve();
  }, [language]);

  const stopRecognition = useCallback(() => {
    console.log('Stopping voice recognition');
    isActiveRef.current = false;
    processingRef.current = false;
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log('Error stopping recognition:', e);
      }
      recognitionRef.current = null;
    }
    
    setIsListening(false);
    setCurrentTranscript('');
  }, []);

  const startRecognition = useCallback(() => {
    // Don't start if speech is in progress or already active
    if (!voiceMode || isActiveRef.current || processingRef.current || speechInProgressRef.current) {
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.log('Speech recognition not supported');
      return;
    }

    console.log('Starting voice recognition for step:', currentStep);
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      console.log('Voice recognition started successfully');
      setIsListening(true);
      isActiveRef.current = true;
    };
    
    rec.onresult = (event: any) => {
      if (processingRef.current || !isActiveRef.current || speechInProgressRef.current) return;
      
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
        
        // Process the command
        onVoiceCommand(finalTranscript.trim());
        
        // Clear transcript and reset processing after a delay
        setTimeout(() => {
          setCurrentTranscript('');
          processingRef.current = false;
        }, 1500);
      }
    };
    
    rec.onend = () => {
      console.log('Voice recognition ended');
      setIsListening(false);
      
      // Only restart if still in voice mode and not processing and no speech in progress
      if (voiceMode && isActiveRef.current && !processingRef.current && !speechInProgressRef.current) {
        setTimeout(() => {
          if (voiceMode && isActiveRef.current && !processingRef.current && !speechInProgressRef.current) {
            startRecognition();
          }
        }, 1000);
      }
    };
    
    rec.onerror = (event: any) => {
      console.log('Voice recognition error:', event.error);
      
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        setTimeout(() => {
          if (voiceMode && isActiveRef.current && !processingRef.current && !speechInProgressRef.current) {
            startRecognition();
          }
        }, 1500);
      } else if (event.error !== 'aborted') {
        setIsListening(false);
        setTimeout(() => {
          if (voiceMode && isActiveRef.current && !processingRef.current && !speechInProgressRef.current) {
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

  // Main effect for managing voice recognition - delay start until after speech
  useEffect(() => {
    if (voiceMode) {
      // Wait longer before starting recognition to avoid capturing instructions
      const timer = setTimeout(() => {
        if (!speechInProgressRef.current) {
          startRecognition();
        }
      }, 3000); // Increased delay
      
      return () => {
        clearTimeout(timer);
      };
    } else {
      stopRecognition();
    }
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
