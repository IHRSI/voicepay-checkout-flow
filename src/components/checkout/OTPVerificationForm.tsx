
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle } from 'lucide-react';
import VoiceStatusIndicator from './VoiceStatusIndicator';

interface OTPVerificationFormProps {
  voiceMode: boolean;
  isListening: boolean;
  isProcessing: boolean;
  otp: string;
  paymentMethod: string;
  onOtpChange: (otp: string) => void;
  onCompleteOrder: () => void;
  onSwitchToManual: () => void;
}

const OTPVerificationForm: React.FC<OTPVerificationFormProps> = ({
  voiceMode,
  isListening,
  isProcessing,
  otp,
  paymentMethod,
  onOtpChange,
  onCompleteOrder,
  onSwitchToManual
}) => {
  return (
    <Card className="mb-6 shadow-lg border-gray-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          OTP Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {voiceMode ? (
          <div className="space-y-4">
            <VoiceStatusIndicator 
              isListening={isListening} 
              isProcessing={isProcessing} 
              currentStep={5}
            />
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">🔐 Security Verification</h3>
              <p className="text-sm text-blue-700 mb-3">
                An OTP has been sent to your registered mobile number for {paymentMethod} payment.
              </p>
              
              {otp && (
                <div className="p-3 bg-white rounded border">
                  <Label className="text-sm text-purple-600">Captured OTP:</Label>
                  <p className="font-bold font-mono text-2xl text-purple-800 tracking-wider">
                    {otp.split('').join(' ')}
                  </p>
                </div>
              )}
            </div>

            <Button
              onClick={onSwitchToManual}
              variant="outline"
              className="w-full hover:bg-purple-50 border-purple-200"
            >
              Switch to Manual Typing
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Shield className="h-5 w-5" />
                <span className="font-medium">Security Verification</span>
              </div>
              <p className="text-sm text-blue-700">
                Please enter the OTP sent to your registered mobile number for {paymentMethod} payment.
              </p>
            </div>
            
            <div>
              <Label htmlFor="otp" className="text-gray-700 font-medium">Enter OTP</Label>
              <Input
                id="otp"
                value={otp}
                onChange={(e) => onOtpChange(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="mt-1 border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-center text-lg font-mono tracking-wider"
              />
            </div>
            
            {otp && otp.length >= 4 && (
              <Button 
                onClick={onCompleteOrder}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white transition-colors"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Complete Payment
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OTPVerificationForm;
