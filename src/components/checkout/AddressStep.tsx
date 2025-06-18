
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Check } from 'lucide-react';
import VoiceStatusIndicator from './VoiceStatusIndicator';

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
  return (
    <Card className="mb-6 shadow-lg border-gray-200">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-6 w-6" />
          Delivery Address
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {voiceMode ? (
          <div className="space-y-4">
            <VoiceStatusIndicator 
              isListening={isListening} 
              isProcessing={isProcessing} 
              currentStep={2}
            />
            
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700">Choose from saved addresses:</h3>
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
                      <p className="font-medium text-gray-800">Address {index + 1}</p>
                      <p className="text-sm text-gray-600 mt-1">{addr}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedAddressIndex >= 0 && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-600 font-medium">Selected Address:</p>
                <p className="text-green-800 mt-1">{savedAddresses[selectedAddressIndex]}</p>
              </div>
            )}

            <Button
              onClick={onSwitchToManual}
              variant="outline"
              className="w-full hover:bg-orange-50 border-orange-200"
            >
              Switch to Manual Typing
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700">Choose from saved addresses:</h3>
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
                      <p className="font-medium text-gray-800">Address {index + 1}</p>
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
                Continue to Payment Method
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AddressStep;
