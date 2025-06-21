
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import SavedAddressList from './SavedAddressList';
import VoiceInstructions from './VoiceInstructions';

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
  voiceMode,
  isListening,
  selectedAddressIndex,
  onAddressSelect,
  onContinue,
  onSwitchToManual
}) => {
  const { language } = useLanguage();

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
            <VoiceInstructions
              isListening={isListening}
              language={language}
              selectedAddressIndex={selectedAddressIndex}
              addresses={savedAddresses}
            />
            
            <SavedAddressList
              addresses={savedAddresses}
              selectedIndex={selectedAddressIndex}
              language={language}
              onAddressSelect={onAddressSelect}
              onContinue={onContinue}
              showContinueButton={true}
            />

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
            <SavedAddressList
              addresses={savedAddresses}
              selectedIndex={selectedAddressIndex}
              language={language}
              onAddressSelect={onAddressSelect}
              onContinue={onContinue}
              showContinueButton={true}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AddressStep;
