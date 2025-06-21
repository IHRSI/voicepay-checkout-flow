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
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const isActiveRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const speechInProgressRef = useRef(false);

  const speak = (text: string, lang: string = 'en-US') => {
    if ('speechSynthesis' in window && !isCompleted) {
      speechInProgressRef.current = true;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
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
  };

  const stopRecognition = () => {
    console.log('Stopping language selector recognition');
    isActiveRef.current = false;
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log('Error stopping language recognition:', e);
      }
      recognitionRef.current = null;
    }
    
    setIsListening(false);
    setCurrentTranscript('');
  };

  const startVoiceRecognition = () => {
    if (isCompleted || isActiveRef.current || speechInProgressRef.current || 
        !('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return;
    }

    console.log('Starting language selector recognition');
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onstart = () => {
      console.log('Language selection listening started');
      setIsListening(true);
      isActiveRef.current = true;
    };
    
    rec.onresult = (event: any) => {
      if (isCompleted || !isActiveRef.current || speechInProgressRef.current) return;
      
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
        const transcript = finalTranscript.toLowerCase().trim();
        console.log('Language selection transcript:', transcript);
        
        if (transcript.includes('english') || transcript.includes('इंग्लिश')) {
          handleLanguageSelect('en');
        } else if (transcript.includes('hindi') || transcript.includes('हिंदी')) {
          handleLanguageSelect('hi');
        }
        
        setCurrentTranscript('');
      }
    };

    rec.onend = () => {
      console.log('Language selection ended');
      setIsListening(false);
      
      // Only restart if not completed and still active and no speech in progress
      if (!isCompleted && isActiveRef.current && !speechInProgressRef.current) {
        setTimeout(() => {
          if (!isCompleted && isActiveRef.current && !speechInProgressRef.current) {
            startVoiceRecognition();
          }
        }, 1000);
      }
    };

    rec.onerror = (event: any) => {
      console.log('Language selection error:', event.error);
      
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        setTimeout(() => {
          if (!isCompleted && isActiveRef.current && !speechInProgressRef.current) {
            startVoiceRecognition();
          }
        }, 1500);
      } else if (event.error !== 'aborted') {
        setIsListening(false);
        setTimeout(() => {
          if (!isCompleted && isActiveRef.current && !speechInProgressRef.current) {
            startVoiceRecognition();
          }
        }, 2000);
      }
    };

    recognitionRef.current = rec;
    
    try {
      rec.start();
    } catch (error) {
      console.error('Failed to start language recognition:', error);
      isActiveRef.current = false;
    }
  };

  useEffect(() => {
    if (hasInitializedRef.current || isCompleted) return;
    hasInitializedRef.current = true;

    const initializeVoice = async () => {
      if (!hasSpoken && !isCompleted) {
        setHasSpoken(true);
        await speak("Welcome to VoicePay! Please choose your language. Say English for English or Hindi for Hindi. VoicePay में आपका स्वागत है! कृपया अपनी भाषा चुनें।");
        
        // Wait longer after speech before starting recognition
        setTimeout(() => {
          if (!isCompleted && !speechInProgressRef.current) {
            startVoiceRecognition();
          }
        }, 2000);
      }
    };

    initializeVoice();

    return () => {
      console.log('Language selector cleanup');
      stopRecognition();
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleLanguageSelect = async (lang: 'en' | 'hi') => {
    console.log('Language selected:', lang);
    setIsCompleted(true);
    stopRecognition();
    
    setLanguage(lang);
    localStorage.setItem('voicepay-language', lang);
    
    if (lang === 'en') {
      await speak("English selected! Welcome to VoicePay. Starting your shopping experience.", 'en-US');
    } else {
      await speak("Hindi चुनी गई! VoicePay में आपका स्वागत है। आपका शॉपिंग अनुभव शुरू हो रहा है।", 'hi-IN');
    }
    
    // Ensure complete cleanup before proceeding
    window.speechSynthesis.cancel();
    setTimeout(onLanguageSelected, 1500);
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
            
            {currentTranscript && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
                <span className="text-sm text-blue-600">You said:</span>
                <p className="font-medium text-blue-800">{currentTranscript}</p>
              </div>
            )}
            
            <p className="text-gray-600 mb-6">
              Speak your choice or click below<br />
              अपनी पसंद बोलें या नीचे क्लिक करें
            </p>
          </div>
          
          <div className="space-y-4">
            <Button
              onClick={() => handleLanguageSelect('en')}
              disabled={isCompleted}
              className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              🇺🇸 English
            </Button>
            <Button
              onClick={() => handleLanguageSelect('hi')}
              disabled={isCompleted}
              className="w-full h-14 text-lg bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
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
