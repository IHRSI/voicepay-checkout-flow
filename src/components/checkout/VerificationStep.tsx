
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle } from 'lucide-react';
import VoiceStatusIndicator from './VoiceStatusIndicator';

interface VerificationStepProps {
  paymentMethod: string;
  otp: string;
  voiceConfirmed: boolean;
  voiceMode: boolean;
  isListening: boolean;
  isProcessing: boolean;
  onOtpChange: (otp: string) => void;
  onVoiceConfirm: () => void;
  onCompleteOrder: () => void;
}

const VerificationStep: React.FC<VerificationStepProps> = ({
  paymentMethod,
  otp,
  voiceConfirmed,
  voiceMode,
  isListening,
  isProcessing,
  onOtpChange,
  onVoiceConfirm,
  onCompleteOrder
}) => {
  const isUPI = paymentMethod === 'UPI';

  return (
    <Card className="mb-6 shadow-lg border-gray-200">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          {isUPI ? 'OTP Verification' : 'Voice Verification'}
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
            {isUPI && otp && (
              <div className="p-4 bg-gray-50 rounded-lg border">
                <Label className="text-sm text-gray-600">Captured OTP:</Label>
                <p className="font-medium font-mono mt-1 text-gray-800">{otp}</p>
              </div>
            )}
            {voiceConfirmed && (
              <div className="flex items-center gap-2 text-green-600 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Voice verification successful!</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {isUPI ? (
              <div>
                <Label htmlFor="otp" className="text-gray-700 font-medium">Enter OTP</Label>
                <Input
                  id="otp"
                  value={otp}
                  onChange={(e) => onOtpChange(e.target.value)}
                  placeholder="Enter your OTP"
                  className="mt-1 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            ) : (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 mb-3">
                  Click the button below to complete voice verification
                </p>
                <Button
                  onClick={onVoiceConfirm}
                  className="bg-green-500 hover:bg-green-600 text-white transition-colors"
                >
                  Complete Voice Verification
                </Button>
              </div>
            )}
            
            {((isUPI && otp) || (!isUPI && voiceConfirmed)) && (
              <Button 
                onClick={onCompleteOrder}
                className="w-full bg-green-500 hover:bg-green-600 text-white transition-colors"
              >
                Complete Order
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VerificationStep;
