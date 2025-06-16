
import React from 'react';
import { Mic, MicOff, Volume2, ShoppingBag } from 'lucide-react';

interface VoiceStatusIndicatorProps {
  isListening: boolean;
  isProcessing: boolean;
  currentStep: number;
}

const VoiceStatusIndicator: React.FC<VoiceStatusIndicatorProps> = ({ 
  isListening, 
  isProcessing, 
  currentStep 
}) => {
  const getStepIcon = () => {
    switch (currentStep) {
      case 1: return <ShoppingBag className="h-5 w-5 text-blue-500" />;
      default: return isListening ? <MicOff className="h-5 w-5 text-red-500 animate-pulse" /> : <Mic className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusText = () => {
    if (isListening) return "Listening to your voice...";
    if (isProcessing) return "Processing your request...";
    return "Voice Mode Active";
  };

  return (
    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-400 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        {isProcessing ? (
          <>
            <Volume2 className="h-5 w-5 text-orange-500 animate-pulse" />
            <span className="text-blue-800 font-medium">Speaking...</span>
          </>
        ) : (
          <>
            {getStepIcon()}
            <span className="text-blue-800 font-medium">{getStatusText()}</span>
          </>
        )}
      </div>
      <p className="text-sm text-blue-700">
        Say "repeat" to hear instructions again, "help" for commands, or "manual mode" to switch to typing.
      </p>
    </div>
  );
};

export default VoiceStatusIndicator;
