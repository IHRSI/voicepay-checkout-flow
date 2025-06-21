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
  const speechInProgressRef = useRef(false);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window && voiceMode) {
      return new Promise<void>((resolve) => {
        speechInProgressRef.current = true;
        
        // Stop any ongoing speech
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
        utterance.pitch = 1.0;
        
        utterance.onend = () => {
          speechInProgressRef.current = false;
          console.log('Speech synthesis ended');
          resolve();
        };
        
        utterance.onerror = () => {
          speechInProgressRef.current = false;
          console.log('Speech synthesis error');
          resolve();
        };
        
        window.speechSynthesis.speak(utterance);
      });
    }
    speechInProgressRef.current = false;
    return Promise.resolve();
  }, [language, voiceMode]);

  const stopRecognition = useCallback(() => {
    console.log('Stopping voice recognition');
    isActiveRef.current = false;
    
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    
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
    // Don't start if not in voice mode, already active, or speech in progress
    if (!voiceMode || isActiveRef.current || speechInProgressRef.current) {
      console.log('Not starting recognition:', { voiceMode, isActive: isActiveRef.current, speechInProgress: speechInProgressRef.current });
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.log('Speech recognition not supported');
      return;
    }

    console.log('Starting voice recognition for step:', currentStep);
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Key settings for continuous recognition
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('Voice recognition started successfully');
      setIsListening(true);
      isActiveRef.current = true;
    };
    
    recognition.onresult = (event: any) => {
      if (!isActiveRef.current || speechInProgressRef.current) {
        console.log('Ignoring result - not active or speech in progress');
        return;
      }
      
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
        
        // Process the command
        onVoiceCommand(finalTranscript.trim());
        
        // Clear transcript after processing
        setTimeout(() => {
          setCurrentTranscript('');
        }, 2000);
      }
    };
    
    recognition.onend = () => {
      console.log('Voice recognition ended, restarting...');
      setIsListening(false);
      
      // Always restart if voice mode is still active and no speech in progress
      if (voiceMode && isActiveRef.current && !speechInProgressRef.current) {
        restartTimeoutRef.current = setTimeout(() => {
          if (voiceMode && isActiveRef.current && !speechInProgressRef.current) {
            console.log('Restarting recognition after end');
            startRecognition();
          }
        }, 500);
      }
    };
    
    recognition.onerror = (event: any) => {
      console.log('Voice recognition error:', event.error);
      
      // Handle different error types
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        // These are recoverable errors, restart after a short delay
        if (voiceMode && isActiveRef.current && !speechInProgressRef.current) {
          restartTimeoutRef.current = setTimeout(() => {
            if (voiceMode && isActiveRef.current && !speechInProgressRef.current) {
              console.log('Restarting recognition after recoverable error');
              startRecognition();
            }
          }, 1000);
        }
      } else if (event.error !== 'aborted') {
        // Other errors, restart after longer delay
        setIsListening(false);
        if (voiceMode && isActiveRef.current && !speechInProgressRef.current) {
          restartTimeoutRef.current = setTimeout(() => {
            if (voiceMode && isActiveRef.current && !speechInProgressRef.current) {
              console.log('Restarting recognition after error');
              startRecognition();
            }
          }, 2000);
        }
      }
    };

    recognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      isActiveRef.current = false;
    }
  }, [voiceMode, language, currentStep, onVoiceCommand]);

  // Effect to manage voice recognition lifecycle
  useEffect(() => {
    if (voiceMode) {
      console.log('Voice mode enabled, waiting for speech to complete...');
      
      // Wait for speech to complete before starting recognition
      const checkAndStart = () => {
        if (!speechInProgressRef.current && voiceMode && !isActiveRef.current) {
          console.log('Starting recognition after speech check');
          startRecognition();
        } else if (speechInProgressRef.current) {
          console.log('Speech still in progress, checking again...');
          setTimeout(checkAndStart, 1000);
        }
      };
      
      // Initial delay to allow for any immediate speech
      setTimeout(checkAndStart, 2000);
    } else {
      stopRecognition();
    }

    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
  }, [voiceMode, startRecognition, stopRecognition]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('useVoiceRecognition cleanup');
      stopRecognition();
      window.speechSynthesis.cancel();
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
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
