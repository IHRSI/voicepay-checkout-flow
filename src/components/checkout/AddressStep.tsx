
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Check, Mic } from 'lucide-react';
import VoiceStatusIndicator from './VoiceStatusIndicator';
import { useLanguage } from '@/context/LanguageContext';

interface AddressStepProps {
  address: string;
  voiceMode: boolean;
  isListening: boolean;
  isProcessing: boolean;
  selectedAddressIndex: number;
  onAddressChange: (address: string) => void;
  onAddressSelect: (index: number) => void;
  onContinue: () => void;
  onSwitchToManual: () => void;
}

const savedAddresses = [
  "123 MG Road, Connaught Place, New Delhi, Delhi 110001",
  "45 Brigade Road, Bangalore, Karnataka 560025", 
  "78 Marine Drive, Mumbai, Maharashtra 400002"
];

const AddressStep: React.FC<AddressStepProps> = ({
  address,
  voiceMode,
  isListening,
  isProcessing,
  selectedAddressIndex,
  onAddressChange,
  onAddressSelect,
  onContinue,
  onSwitchToManual
}) => {
  const { language, t } = useLanguage();
  const [voiceRecognition, setVoiceRecognition] = useState<any>(null);

  useEffect(() => {
    if (!voiceMode) return;

    const speak = (text: string) => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
        utterance.rate = 1.3;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
      }
    };

    const startVoiceRecognition = () => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        console.log('Address selection transcript:', transcript);
        
        // Enhanced voice recognition for address selection
        if (transcript.includes('address 1') || transcript.includes('first') || 
            transcript.includes('पता 1') || transcript.includes('पहला') ||
            transcript.includes('one') || transcript.includes('एक')) {
          onAddressSelect(0);
          speak(language === 'hi' ? 'पता 1 चुना गया। भुगतान विधि पर जाने के लिए continue कहें।' : 'Address 1 selected. Say continue to proceed to payment method.');
        } else if (transcript.includes('address 2') || transcript.includes('second') || 
                   transcript.includes('पता 2') || transcript.includes('दूसरा') ||
                   transcript.includes('two') || transcript.includes('दो')) {
          onAddressSelect(1);
          speak(language === 'hi' ? 'पता 2 चुना गया। भुगतान विधि पर जाने के लिए continue कहें।' : 'Address 2 selected. Say continue to proceed to payment method.');
        } else if (transcript.includes('address 3') || transcript.includes('third') || 
                   transcript.includes('पता 3') || transcript.includes('तीसरा') ||
                   transcript.includes('three') || transcript.includes('तीन')) {
          onAddressSelect(2);
          speak(language === 'hi' ? 'पता 3 चुना गया। भुगतान विधि पर जाने के लिए continue कहें।' : 'Address 3 selected. Say continue to proceed to payment method.');
        } else if ((transcript.includes('continue') || transcript.includes('proceed') || 
                   transcript.includes('next') || transcript.includes('आगे') || 
                   transcript.includes('जारी')) && selectedAddressIndex >= 0) {
          speak(language === 'hi' ? 'भुगतान विधि पर जा रहे हैं।' : 'Proceeding to payment method.');
          setTimeout(onContinue, 1000);
          return;
        } else {
          speak(language === 'hi' ? 'कृपया पता 1, पता 2, या पता 3 कहें।' : 'Please say address 1, address 2, or address 3.');
        }
        
        // Restart listening after selection
        setTimeout(() => {
          if (recognition) {
            recognition.start();
          }
        }, 2000);
      };

      recognition.onerror = (event: any) => {
        console.error('Address recognition error:', event.error);
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
      recognition.start();
    };

    const timer = setTimeout(() => {
      const instructionText = language === 'hi' 
        ? 'अपना डिलीवरी पता चुनें। पता 1, पता 2, या पता 3 कहें।'
        : 'Choose your delivery address. Say address 1, address 2, or address 3.';
      speak(instructionText);
      setTimeout(startVoiceRecognition, 2000);
    }, 500);

    return () => {
      clearTimeout(timer);
      if (voiceRecognition) {
        voiceRecognition.abort();
      }
      window.speechSynthesis.cancel();
    };
  }, [voiceMode, language, selectedAddressIndex, onAddressSelect, onContinue]);

  return (
    <Card className="mb-6 shadow-lg border-gray-200">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-6 w-6" />
          {language === 'hi' ? 'डिलीवरी पता' : 'Delivery Address'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {voiceMode ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Mic className={`h-5 w-5 ${isListening ? 'text-red-500 animate-pulse' : 'text-blue-500'}`} />
              <span className="text-sm font-medium text-blue-700">
                {language === 'hi' ? 'वॉयस निर्देश' : 'Voice Instructions'}
              </span>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700">
                {language === 'hi' ? 'सेव किए गए पतों में से चुनें:' : 'Choose from saved addresses:'}
              </h3>
              {savedAddresses.map((addr, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedAddressIndex === index 
                      ? 'bg-orange-50 border-orange-300 ring-2 ring-orange-200' 
                      : 'bg-gray-50 border-gray-200 hover:bg-orange-50'
                  }`}
                  onClick={() => onAddressSelect(index)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                      selectedAddressIndex === index 
                        ? 'bg-orange-500 border-orange-500' 
                        : 'border-gray-300'
                    }`}>
                      {selectedAddressIndex === index && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {language === 'hi' ? `पता ${index + 1}` : `Address ${index + 1}`}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{addr}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedAddressIndex >= 0 && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-600 font-medium">
                  {language === 'hi' ? 'चुना गया पता:' : 'Selected Address:'}
                </p>
                <p className="text-green-800 mt-1">{savedAddresses[selectedAddressIndex]}</p>
                <p className="text-sm text-green-600 mt-2">
                  {language === 'hi' ? '"Continue" कहें या नीचे बटन दबाएं।' : 'Say "Continue" or click the button below.'}
                </p>
              </div>
            )}

            {selectedAddressIndex >= 0 && (
              <Button
                onClick={onContinue}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white transition-colors"
              >
                {language === 'hi' ? 'भुगतान विधि पर जाएं' : 'Continue to Payment Method'}
              </Button>
            )}

            <Button
              onClick={onSwitchToManual}
              variant="outline"
              className="w-full hover:bg-orange-50 border-orange-200"
            >
              {language === 'hi' ? 'मैनुअल टाइपिंग पर स्विच करें' : 'Switch to Manual Typing'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700">
                {language === 'hi' ? 'सेव किए गए पतों में से चुनें:' : 'Choose from saved addresses:'}
              </h3>
              {savedAddresses.map((addr, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedAddressIndex === index 
                      ? 'bg-orange-50 border-orange-300 ring-2 ring-orange-200' 
                      : 'bg-gray-50 border-gray-200 hover:bg-orange-50'
                  }`}
                  onClick={() => onAddressSelect(index)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                      selectedAddressIndex === index 
                        ? 'bg-orange-500 border-orange-500' 
                        : 'border-gray-300'
                    }`}>
                      {selectedAddressIndex === index && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {language === 'hi' ? `पता ${index + 1}` : `Address ${index + 1}`}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{addr}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedAddressIndex >= 0 && (
              <Button 
                onClick={onContinue}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white transition-colors"
              >
                {language === 'hi' ? 'भुगतान विधि पर जाएं' : 'Continue to Payment Method'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AddressStep;
