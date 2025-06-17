
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Smartphone } from 'lucide-react';
import VoiceStatusIndicator from './VoiceStatusIndicator';

interface UPIPaymentFormProps {
  voiceMode: boolean;
  isListening: boolean;
  isProcessing: boolean;
  paymentDetails: {
    upiAddress: string;
  };
  onPaymentDetailsChange: (details: any) => void;
  onContinue: () => void;
  onSwitchToManual: () => void;
}

const UPIPaymentForm: React.FC<UPIPaymentFormProps> = ({
  voiceMode,
  isListening,
  isProcessing,
  paymentDetails,
  onPaymentDetailsChange,
  onContinue,
  onSwitchToManual
}) => {
  return (
    <Card className="mb-6 shadow-lg border-gray-200 bg-gradient-to-br from-green-50 to-emerald-50">
      <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-6 w-6" />
          UPI Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {voiceMode ? (
          <div className="space-y-4">
            <VoiceStatusIndicator 
              isListening={isListening} 
              isProcessing={isProcessing} 
              currentStep={4}
            />
            
            {paymentDetails.upiAddress && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <Label className="text-sm text-green-600">UPI Address:</Label>
                <p className="font-medium font-mono mt-1 text-green-800">{paymentDetails.upiAddress}</p>
              </div>
            )}

            <Button
              onClick={onSwitchToManual}
              variant="outline"
              className="w-full hover:bg-green-50 border-green-200"
            >
              Switch to Manual Typing
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="upiAddress" className="text-gray-700 font-medium">UPI Address / UPI ID</Label>
              <Input
                id="upiAddress"
                value={paymentDetails.upiAddress}
                onChange={(e) => onPaymentDetailsChange({...paymentDetails, upiAddress: e.target.value})}
                placeholder="yourname@upi"
                className="mt-1 border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
            
            {paymentDetails.upiAddress && (
              <Button 
                onClick={onContinue}
                className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors"
              >
                Continue to OTP Verification
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UPIPaymentForm;
