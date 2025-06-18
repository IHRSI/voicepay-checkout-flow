
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

  useEffect(() => {
    // Voice prompt for language selection
    const speak = (text: string, lang: string = 'en-US') => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
      }
    };

    const timer = setTimeout(() => {
      speak("Welcome to VoicePay! Choose your language. Say English for English or Hindi for Hindi. आपका स्वागत है! English या Hindi कहें।");
    }, 1000);

    // Voice recognition for language selection
    const startListening = () => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      
      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
        console.log('Language selection transcript:', transcript);
        
        if (transcript.includes('english') || transcript.includes('इंग्लिश')) {
          setLanguage('en');
          speak("English selected. Welcome to VoicePay!");
          setTimeout(onLanguageSelected, 2000);
        } else if (transcript.includes('hindi') || transcript.includes('हिंदी')) {
          setLanguage('hi');
          speak("Hindi चुनी गई। VoicePay में आपका स्वागत है!", 'hi-IN');
          setTimeout(onLanguageSelected, 2000);
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => {
        setIsListening(false);
        // Restart listening after a short delay
        setTimeout(startListening, 1000);
      };

      recognition.start();
    };

    const listenTimer = setTimeout(startListening, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(listenTimer);
      window.speechSynthesis.cancel();
    };
  }, [setLanguage, onLanguageSelected]);

  const handleLanguageSelect = (lang: 'en' | 'hi') => {
    setLanguage(lang);
    const speak = (text: string, speechLang: string = 'en-US') => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = speechLang;
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
      }
    };

    if (lang === 'en') {
      speak("English selected. Welcome to VoicePay!");
    } else {
      speak("Hindi चुनी गई। VoicePay में आपका स्वागत है!", 'hi-IN');
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
                {isListening ? 'Listening...' : 'Voice Ready'}
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
              English
            </Button>
            <Button
              onClick={() => handleLanguageSelect('hi')}
              className="w-full h-14 text-lg bg-orange-600 hover:bg-orange-700 text-white"
            >
              हिंदी (Hindi)
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
