
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
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [pendingCommand, setPendingCommand] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(false);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      if (language === 'hi') {
        utterance.lang = 'hi-IN';
        utterance.rate = 0.8; // Slower Hindi speech
        utterance.pitch = 1.0;
      } else {
        utterance.lang = 'en-IN';
        utterance.rate = 1.0;
        utterance.pitch = 1.1;
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
    console.log('Stopping voice recognition completely');
    isActiveRef.current = false;
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        console.log('Recognition already stopped');
      }
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
    setAwaitingConfirmation(false);
    setCurrentTranscript('');
  }, []);

  const startRecognition = useCallback(() => {
    if (!voiceMode || isActiveRef.current) return;

    console.log('Starting voice recognition');
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      rec.onstart = () => {
        console.log(`Voice recognition started for ${language}`);
        setIsListening(true);
        isActiveRef.current = true;
      };
      
      rec.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Show live transcript
        setCurrentTranscript(finalTranscript || interimTranscript);
        
        if (finalTranscript.trim()) {
          handleVoiceInput(finalTranscript.trim().toLowerCase());
        }
      };
      
      rec.onend = () => {
        console.log('Voice recognition ended');
        setIsListening(false);
        
        // Only restart if still in voice mode and not awaiting confirmation
        if (voiceMode && isActiveRef.current && !awaitingConfirmation) {
          restartTimeoutRef.current = setTimeout(() => {
            if (voiceMode && isActiveRef.current && !awaitingConfirmation) {
              startRecognition();
            }
          }, 1500); // Longer delay to prevent fluttering
        }
      };
      
      rec.onerror = (event: any) => {
        console.log('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error !== 'aborted' && voiceMode && isActiveRef.current) {
          restartTimeoutRef.current = setTimeout(() => {
            if (voiceMode && isActiveRef.current) {
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
    }
  }, [voiceMode, language, awaitingConfirmation]);

  const handleVoiceInput = useCallback(async (transcript: string) => {
    console.log('Voice input received:', transcript);
    setCurrentTranscript(transcript);
    
    if (awaitingConfirmation) {
      // Handle confirmation
      if (transcript.includes('yes') || transcript.includes('हां') || transcript.includes('confirm')) {
        console.log('Command confirmed:', pendingCommand);
        setAwaitingConfirmation(false);
        setPendingCommand('');
        setCurrentTranscript('');
        onVoiceCommand(pendingCommand);
        
        // Resume listening after processing
        setTimeout(startRecognition, 1000);
      } else if (transcript.includes('no') || transcript.includes('नहीं') || transcript.includes('cancel')) {
        console.log('Command cancelled');
        setAwaitingConfirmation(false);
        setPendingCommand('');
        setCurrentTranscript('');
        await speak(language === 'hi' ? 'रद्द किया गया। फिर से बोलें।' : 'Cancelled. Please speak again.');
        
        // Resume listening
        setTimeout(startRecognition, 1000);
      }
    } else {
      // New command - ask for confirmation
      setAwaitingConfirmation(true);
      setPendingCommand(transcript);
      
      const confirmText = language === 'hi' 
        ? `आपने कहा: "${transcript}"। पुष्टि के लिए "हां" या रद्द करने के लिए "नहीं" कहें।`
        : `You said: "${transcript}". Say "yes" to confirm or "no" to cancel.`;
      
      await speak(confirmText);
      
      // Start listening for confirmation
      setTimeout(startRecognition, 500);
    }
  }, [awaitingConfirmation, pendingCommand, language, speak, onVoiceCommand, startRecognition]);

  useEffect(() => {
    if (voiceMode) {
      // Start with a delay
      timeoutRef.current = setTimeout(() => {
        startRecognition();
      }, 1500);
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
    awaitingConfirmation,
    speak,
    recognition: recognitionRef.current
  };
};
