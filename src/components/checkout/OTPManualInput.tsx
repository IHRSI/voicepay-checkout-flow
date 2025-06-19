
import React from 'react';
import { Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/LanguageContext';

interface OTPManualInputProps {
  otp: string;
  paymentMethod: string;
  onOtpChange: (otp: string) => void;
}

const OTPManualInput: React.FC<OTPManualInputProps> = ({
  otp,
  paymentMethod,
  onOtpChange
}) => {
  const { language } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 text-blue-600 mb-2">
          <Shield className="h-5 w-5" />
          <span className="font-medium">
            {language === 'hi' ? 'सुरक्षा सत्यापन' : 'Security Verification'}
          </span>
        </div>
        <p className="text-sm text-blue-700">
          {language === 'hi' 
            ? `कृपया ${paymentMethod} भुगतान के लिए आपके पंजीकृत मोबाइल नंबर पर भेजा गया ओटीपी डालें।`
            : `Please enter the OTP sent to your registered mobile number for ${paymentMethod} payment.`
          }
        </p>
      </div>
      
      <div>
        <Label htmlFor="otp" className="text-gray-700 font-medium">
          {language === 'hi' ? 'ओटीपी डालें' : 'Enter OTP'}
        </Label>
        <Input
          id="otp"
          value={otp}
          onChange={(e) => onOtpChange(e.target.value)}
          placeholder={language === 'hi' ? '6-अंकीय ओटीपी' : '6-digit OTP'}
          maxLength={6}
          className="mt-1 border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-center text-lg font-mono tracking-wider"
        />
      </div>
    </div>
  );
};

export default OTPManualInput;
