
import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface UseOTPVoiceRecognitionProps {
  voiceMode: boolean;
  onOtpChange: (otp: string) => void;
  onCancel: () => void;
}

export const useOTPVoiceRecognition = ({ voiceMode, onOtpChange, onCancel }: UseOTPVoiceRecognitionProps) => {
  const { language } = useLanguage();
  const [voiceRecognition, setVoiceRecognition] = useState<any>(null);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (!voiceMode) return;

    const timer = setTimeout(() => {
      const instructionText = language === 'hi' 
        ? 'अपना ओटीपी नंबर बोलें। आप छह अंकों का ओटीपी एक साथ बोल सकते हैं या एक-एक करके। रद्द करने के लिए "कैंसल" कहें।'
        : 'Please speak your OTP number. You can say all six digits together or one by one. Say "cancel" to cancel the transaction.';
      speak(instructionText);
    }, 500);

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        console.log('OTP transcript:', transcript);
        
        if (transcript.includes('cancel') || transcript.includes('रद्द') || transcript.includes('कैंसल')) {
          speak(language === 'hi' ? 'लेनदेन रद्द की जा रही है।' : 'Transaction being cancelled.');
          setTimeout(onCancel, 1000);
          return;
        }
        
        // Enhanced number extraction for both languages
        let otpValue = '';
        
        // Handle Hindi numbers
        const hindiNumbers: { [key: string]: string } = {
          'शून्य': '0', 'एक': '1', 'दो': '2', 'तीन': '3', 'चार': '4',
          'पांच': '5', 'छह': '6', 'सात': '7', 'आठ': '8', 'नौ': '9'
        };
        
        // Handle English numbers
        const englishNumbers: { [key: string]: string } = {
          'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
          'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9'
        };
        
        // First try direct digit extraction
        const directNumbers = transcript.match(/\d+/g);
        if (directNumbers) {
          otpValue = directNumbers.join('');
        } else {
          // Try word to number conversion
          const words = transcript.split(' ');
          for (const word of words) {
            if (hindiNumbers[word]) {
              otpValue += hindiNumbers[word];
            } else if (englishNumbers[word]) {
              otpValue += englishNumbers[word];
            }
          }
        }
        
        if (otpValue.length >= 4 && otpValue.length <= 6) {
          onOtpChange(otpValue);
          speak(language === 'hi' ? `ओटीपी ${otpValue} सेव किया गया।` : `OTP ${otpValue} saved.`);
        } else {
          speak(language === 'hi' ? 'कृपया छह अंकों का ओटीपी बोलें।' : 'Please speak six digit OTP.');
        }
        
        setTimeout(() => {
          if (recognition) {
            recognition.start();
          }
        }, 2000);
      };

      recognition.onerror = (event: any) => {
        console.error('OTP recognition error:', event.error);
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
      setTimeout(() => recognition.start(), 2000);
    }

    return () => {
      clearTimeout(timer);
      if (voiceRecognition) {
        voiceRecognition.abort();
      }
      window.speechSynthesis.cancel();
    };
  }, [voiceMode, language, onOtpChange, onCancel]);

  return { voiceRecognition };
};
