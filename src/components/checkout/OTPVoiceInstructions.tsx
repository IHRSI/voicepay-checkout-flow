
import React from 'react';
import { Mic } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface OTPVoiceInstructionsProps {
  isListening: boolean;
  otp: string;
}

const OTPVoiceInstructions: React.FC<OTPVoiceInstructionsProps> = ({
  isListening,
  otp
}) => {
  const { language } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <Mic className={`h-5 w-5 ${isListening ? 'text-red-500 animate-pulse' : 'text-blue-500'}`} />
        <span className="text-sm font-medium text-blue-700">
          {language === 'hi' ? 'वॉयस से ओटीपी बोलें' : 'Speak your OTP'}
        </span>
      </div>
      
      {otp && (
        <div className="p-3 bg-white rounded border">
          <label className="text-sm text-purple-600">
            {language === 'hi' ? 'कैप्चर किया गया ओटीपी:' : 'Captured OTP:'}
          </label>
          <p className="font-bold font-mono text-2xl text-purple-800 tracking-wider">
            {otp.split('').join(' ')}
          </p>
        </div>
      )}
    </div>
  );
};

export default OTPVoiceInstructions;
