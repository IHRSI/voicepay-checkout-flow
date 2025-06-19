
import { useState, useEffect } from 'react';

interface UseAddressVoiceRecognitionProps {
  voiceMode: boolean;
  language: string;
  selectedAddressIndex: number;
  onAddressSelect: (index: number) => void;
  onContinue: () => void;
}

export const useAddressVoiceRecognition = ({
  voiceMode,
  language,
  selectedAddressIndex,
  onAddressSelect,
  onContinue
}: UseAddressVoiceRecognitionProps) => {
  const [voiceRecognition, setVoiceRecognition] = useState<any>(null);

  useEffect(() => {
    if (!voiceMode) return;

    const speak = (text: string) => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
        utterance.rate = 1.3;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
      }
    };

    const startVoiceRecognition = () => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        console.log('Address selection transcript:', transcript);
        
        // Enhanced voice recognition for address selection
        if (transcript.includes('address 1') || transcript.includes('first') || 
            transcript.includes('पता 1') || transcript.includes('पहला') ||
            transcript.includes('one') || transcript.includes('एक')) {
          onAddressSelect(0);
          speak(language === 'hi' ? 'पता 1 चुना गया। भुगतान विधि पर जाने के लिए continue कहें।' : 'Address 1 selected. Say continue to proceed to payment method.');
        } else if (transcript.includes('address 2') || transcript.includes('second') || 
                   transcript.includes('पता 2') || transcript.includes('दूसरा') ||
                   transcript.includes('two') || transcript.includes('दो')) {
          onAddressSelect(1);
          speak(language === 'hi' ? 'पता 2 चुना गया। भुगतान विधि पर जाने के लिए continue कहें।' : 'Address 2 selected. Say continue to proceed to payment method.');
        } else if (transcript.includes('address 3') || transcript.includes('third') || 
                   transcript.includes('पता 3') || transcript.includes('तीसरा') ||
                   transcript.includes('three') || transcript.includes('तीन')) {
          onAddressSelect(2);
          speak(language === 'hi' ? 'पता 3 चुना गया। भुगतान विधि पर जाने के लिए continue कहें।' : 'Address 3 selected. Say continue to proceed to payment method.');
        } else if ((transcript.includes('continue') || transcript.includes('proceed') || 
                   transcript.includes('next') || transcript.includes('आगे') || 
                   transcript.includes('जारी')) && selectedAddressIndex >= 0) {
          speak(language === 'hi' ? 'भुगतान विधि पर जा रहे हैं।' : 'Proceeding to payment method.');
          setTimeout(onContinue, 1000);
          return;
        } else {
          speak(language === 'hi' ? 'कृपया पता 1, पता 2, या पता 3 कहें।' : 'Please say address 1, address 2, or address 3.');
        }
        
        // Restart listening after selection
        setTimeout(() => {
          if (recognition) {
            recognition.start();
          }
        }, 2000);
      };

      recognition.onerror = (event: any) => {
        console.error('Address recognition error:', event.error);
        if (event.error !== 'aborted') {
          setTimeout(() => {
            if (recognition) {
              recognition.start();
            }
          }, 1000);
        }
      };

      recognition.onend = () => {
        setTimeout(() => {
          if (recognition) {
            recognition.start();
          }
        }, 500);
      };

      setVoiceRecognition(recognition);
      recognition.start();
    };

    const timer = setTimeout(() => {
      const instructionText = language === 'hi' 
        ? 'अपना डिलीवरी पता चुनें। पता 1, पता 2, या पता 3 कहें।'
        : 'Choose your delivery address. Say address 1, address 2, or address 3.';
      speak(instructionText);
      setTimeout(startVoiceRecognition, 2000);
    }, 500);

    return () => {
      clearTimeout(timer);
      if (voiceRecognition) {
        voiceRecognition.abort();
      }
      window.speechSynthesis.cancel();
    };
  }, [voiceMode, language, selectedAddressIndex, onAddressSelect, onContinue]);

  return { voiceRecognition };
};
