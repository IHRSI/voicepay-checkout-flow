
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import VoiceStatusIndicator from './VoiceStatusIndicator';

interface AddressStepProps {
  address: string;
  voiceMode: boolean;
  isListening: boolean;
  isProcessing: boolean;
  onAddressChange: (address: string) => void;
  onContinue: () => void;
  onSwitchToManual: () => void;
}

const AddressStep: React.FC<AddressStepProps> = ({
  address,
  voiceMode,
  isListening,
  isProcessing,
  onAddressChange,
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
            {address && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <Label className="text-sm text-green-600">Captured Address:</Label>
                <p className="font-medium mt-1 text-green-800">{address}</p>
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
            <Label htmlFor="address" className="text-gray-700 font-medium">Delivery Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => onAddressChange(e.target.value)}
              placeholder="Enter your complete delivery address"
              className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
            />
            {address && (
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
