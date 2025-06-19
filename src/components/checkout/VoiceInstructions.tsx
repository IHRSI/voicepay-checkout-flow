
import React from 'react';
import { Mic } from 'lucide-react';

interface VoiceInstructionsProps {
  isListening: boolean;
  language: string;
  selectedAddressIndex: number;
  addresses: string[];
}

const VoiceInstructions: React.FC<VoiceInstructionsProps> = ({
  isListening,
  language,
  selectedAddressIndex,
  addresses
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <Mic className={`h-5 w-5 ${isListening ? 'text-red-500 animate-pulse' : 'text-blue-500'}`} />
        <span className="text-sm font-medium text-blue-700">
          {language === 'hi' ? 'वॉयस निर्देश' : 'Voice Instructions'}
        </span>
      </div>

      {selectedAddressIndex >= 0 && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-600 font-medium">
            {language === 'hi' ? 'चुना गया पता:' : 'Selected Address:'}
          </p>
          <p className="text-green-800 mt-1">{addresses[selectedAddressIndex]}</p>
          <p className="text-sm text-green-600 mt-2">
            {language === 'hi' ? '"Continue" कहें या नीचे बटन दबाएं।' : 'Say "Continue" or click the button below.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceInstructions;
