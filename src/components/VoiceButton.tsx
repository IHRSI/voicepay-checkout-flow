
import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceButtonProps {
  isListening: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({ 
  isListening, 
  onClick, 
  disabled = false,
  className = ""
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`${className} ${isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-orange-500 hover:bg-orange-600'}`}
    >
      {isListening ? (
        <>
          <MicOff className="h-4 w-4 mr-2" />
          Listening...
        </>
      ) : (
        <>
          <Mic className="h-4 w-4 mr-2" />
          🎙️ Speak
        </>
      )}
    </Button>
  );
};

export default VoiceButton;
