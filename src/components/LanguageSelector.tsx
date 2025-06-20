
import React, { useState, useEffect } from 'react';
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
  const [recognition, setRecognition] = useState<any>(null);

  const speak = (text: string, lang: string = 'en-US') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    // Initial welcome message
    const timer = setTimeout(() => {
      speak("Welcome to VoicePay! नमस्ते VoicePay में आपका स्वागत है! Please choose your language. Say English for English or Hindi for Hindi. अपनी भाषा चुनें - English या Hindi कहें।");
    }, 1000);

    // Start voice recognition
    const startListening = () => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.log('Speech recognition not supported');
        return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      
      rec.continuous = false; // Changed to false for stability
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        console.log('Language selection - listening started');
      };
      
      rec.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
        console.log('Language selection transcript:', transcript);
        
        // Enhanced language detection
        if (transcript.includes('english') || transcript.includes('इंग्लिश') || transcript.includes('अंग्रेजी')) {
          handleLanguageSelect('en');
        } else if (transcript.includes('hindi') || transcript.includes('हिंदी') || transcript.includes('हिन्दी')) {
          handleLanguageSelect('hi');
        } else {
          // Retry prompt
          speak("Please say English or Hindi clearly. कृपया English या Hindi स्पष्ट रूप से कहें।");
          // Restart listening
          setTimeout(() => {
            if (rec) {
              rec.start();
            }
          }, 2000);
        }
      };

      rec.onerror = (event: any) => {
        console.log('Language selection error:', event.error);
        setIsListening(false);
        if (event.error !== 'aborted') {
          setTimeout(() => {
            if (rec) {
              rec.start();
            }
          }, 2000);
        }
      };

      rec.onend = () => {
        setIsListening(false);
        // Only restart if no language was selected
        setTimeout(() => {
          if (rec) {
            rec.start();
          }
        }, 1500);
      };

      setRecognition(rec);
      setTimeout(() => rec.start(), 3000);
    };

    const listenTimer = setTimeout(startListening, 2000);

    return () => {
      clearTimeout(timer);
      clearTimeout(listenTimer);
      if (recognition) {
        recognition.abort();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleLanguageSelect = (lang: 'en' | 'hi') => {
    if (recognition) {
      recognition.abort();
      setRecognition(null);
    }
    
    setLanguage(lang);
    localStorage.setItem('voicepay-language', lang);
    
    if (lang === 'en') {
      speak("English selected! Welcome to VoicePay. Starting your voice-powered shopping experience. Voice mode is automatically enabled for you.", 'en-US');
    } else {
      speak("Hindi चुनी गई! VoicePay में आपका स्वागत है। आपका वॉयस-पावर्ड शॉपिंग अनुभव शुरू हो रहा है। वॉयस मोड आपके लिए चालू कर दिया गया है।", 'hi-IN');
    }
    
    setTimeout(onLanguageSelected, 4000);
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
