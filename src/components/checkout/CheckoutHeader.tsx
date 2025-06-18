
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface CheckoutHeaderProps {
  voiceMode: boolean;
  isListening: boolean;
  onToggleVoiceMode: () => void;
}

const CheckoutHeader: React.FC<CheckoutHeaderProps> = ({
  voiceMode,
  isListening,
  onToggleVoiceMode
}) => {
  const { language } = useLanguage();

  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">
        {language === 'hi' ? 'वॉयस चेकआउट' : 'Voice Checkout'}
      </h1>
      <p className="text-gray-600">
        {language === 'hi' 
          ? 'भारत की सबसे सुलभ चेकआउट प्रक्रिया' 
          : 'India\'s most accessible checkout experience'
        }
      </p>
      
      <div className="flex items-center justify-center gap-4 mt-4">
        <Button
          onClick={onToggleVoiceMode}
          variant={voiceMode ? "default" : "outline"}
          className="flex items-center gap-2"
        >
          {voiceMode ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          {voiceMode 
            ? (language === 'hi' ? 'वॉयस मोड चालू' : 'Voice Mode ON')
            : (language === 'hi' ? 'वॉयस मोड बंद' : 'Voice Mode OFF')
          }
        </Button>
        
        {isListening && (
          <div className="flex items-center gap-2 text-red-600">
            <Volume2 className="h-5 w-5 animate-pulse" />
            <span className="text-sm font-medium">
              {language === 'hi' ? 'सुन रहा है...' : 'Listening...'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutHeader;
