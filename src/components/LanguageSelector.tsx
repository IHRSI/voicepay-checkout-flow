
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Volume2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface LanguageSelectorProps {
  onLanguageSelected: () => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onLanguageSelected }) => {
  const { setLanguage } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [hasSpoken, setHasSpoken] = useState(false);
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);

  const speak = (text: string, lang: string = 'en-US') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      
      return new Promise<void>((resolve) => {
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        window.speechSynthesis.speak(utterance);
      });
    }
    return Promise.resolve();
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsListening(false);
  };

  const startVoiceRecognition = () => {
    if (isProcessingRef.current || !('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onstart = () => {
      console.log('Language selection listening started');
      setIsListening(true);
    };
    
    rec.onresult = (event: any) => {
      if (isProcessingRef.current) return;
      
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      console.log('Language selection transcript:', transcript);
      
      isProcessingRef.current = true;
      
      if (transcript.includes('english') || transcript.includes('इंग्लिश')) {
        handleLanguageSelect('en');
      } else if (transcript.includes('hindi') || transcript.includes('हिंदी')) {
        handleLanguageSelect('hi');
      } else {
        isProcessingRef.current = false;
        speak("Please say English or Hindi clearly. कृपया English या Hindi स्पष्ट रूप से कहें।");
        
        // Restart after feedback
        timeoutRef.current = setTimeout(() => {
          if (!isProcessingRef.current) {
            startVoiceRecognition();
          }
        }, 3000);
      }
    };

    rec.onerror = (event: any) => {
      console.log('Language selection error:', event.error);
      setIsListening(false);
      
      if (event.error !== 'aborted' && !isProcessingRef.current) {
        timeoutRef.current = setTimeout(() => {
          if (!isProcessingRef.current) {
            startVoiceRecognition();
          }
        }, 2000);
      }
    };

    rec.onend = () => {
      setIsListening(false);
      
      if (!isProcessingRef.current) {
        timeoutRef.current = setTimeout(() => {
          if (!isProcessingRef.current) {
            startVoiceRecognition();
          }
        }, 1500);
      }
    };

    recognitionRef.current = rec;
    rec.start();
  };

  useEffect(() => {
    const initializeVoice = async () => {
      if (!hasSpoken) {
        setHasSpoken(true);
        await speak("Welcome to VoicePay! Please choose your language. Say English for English or Hindi for Hindi. VoicePay में आपका स्वागत है! कृपया अपनी भाषा चुनें।");
        
        // Start voice recognition after welcome message
        setTimeout(() => {
          startVoiceRecognition();
        }, 1000);
      }
    };

    initializeVoice();

    return () => {
      stopRecognition();
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleLanguageSelect = async (lang: 'en' | 'hi') => {
    stopRecognition();
    isProcessingRef.current = true;
    
    setLanguage(lang);
    localStorage.setItem('voicepay-language', lang);
    
    if (lang === 'en') {
      await speak("English selected! Welcome to VoicePay. Starting your shopping experience.", 'en-US');
    } else {
      await speak("Hindi चुनी गई! VoicePay में आपका स्वागत है। आपका शॉपिंग अनुभव शुरू हो रहा है।", 'hi-IN');
    }
    
    setTimeout(onLanguageSelected, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl">
            <Globe className="h-8 w-8" />
            VoicePay
          </CardTitle>
          <p className="text-orange-100 mt-2">Choose Your Language / भाषा चुनें</p>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Volume2 className={`h-6 w-6 ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
              <span className="text-sm text-gray-600">
                {isListening ? 'Listening for your choice...' : 'Voice Ready'}
              </span>
            </div>
            <p className="text-gray-600 mb-6">
              Speak your choice or click below<br />
              अपनी पसंद बोलें या नीचे क्लिक करें
            </p>
          </div>
          
          <div className="space-y-4">
            <Button
              onClick={() => handleLanguageSelect('en')}
              className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white"
            >
              🇺🇸 English
            </Button>
            <Button
              onClick={() => handleLanguageSelect('hi')}
              className="w-full h-14 text-lg bg-orange-600 hover:bg-orange-700 text-white"
            >
              🇮🇳 हिंदी (Hindi)
            </Button>
          </div>
          
          <div className="text-center text-sm text-gray-500 pt-4 border-t">
            India's most accessible e-commerce platform<br />
            भारत का सबसे सुलभ ई-कॉमर्स प्लेटफॉर्म
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LanguageSelector;
