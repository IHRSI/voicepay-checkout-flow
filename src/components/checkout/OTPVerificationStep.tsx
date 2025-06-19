
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useOTPVoiceRecognition } from '@/hooks/useOTPVoiceRecognition';
import OTPVoiceInstructions from './OTPVoiceInstructions';
import OTPSecurityInfo from './OTPSecurityInfo';
import OTPManualInput from './OTPManualInput';
import OTPActionButtons from './OTPActionButtons';

interface OTPVerificationStepProps {
  voiceMode: boolean;
  isListening: boolean;
  isProcessing: boolean;
  otp: string;
  paymentMethod: string;
  onOtpChange: (otp: string) => void;
  onCompleteOrder: () => void;
  onSwitchToManual: () => void;
  onCancel: () => void;
}

const OTPVerificationStep: React.FC<OTPVerificationStepProps> = ({
  voiceMode,
  isListening,
  isProcessing,
  otp,
  paymentMethod,
  onOtpChange,
  onCompleteOrder,
  onSwitchToManual,
  onCancel
}) => {
  const { language } = useLanguage();

  // Initialize voice recognition for OTP
  useOTPVoiceRecognition({
    voiceMode,
    onOtpChange,
    onCancel
  });

  return (
    <Card className="shadow-lg border-gray-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          {language === 'hi' ? 'ओटीपी सत्यापन' : 'OTP Verification'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <OTPSecurityInfo paymentMethod={paymentMethod} />
        
        {voiceMode ? (
          <OTPVoiceInstructions 
            isListening={isListening}
            otp={otp}
          />
        ) : (
          <OTPManualInput
            otp={otp}
            paymentMethod={paymentMethod}
            onOtpChange={onOtpChange}
          />
        )}

        <OTPActionButtons
          voiceMode={voiceMode}
          otp={otp}
          onSwitchToManual={voiceMode ? onSwitchToManual : undefined}
          onCancel={onCancel}
          onCompleteOrder={onCompleteOrder}
        />
      </CardContent>
    </Card>
  );
};

export default OTPVerificationStep;
