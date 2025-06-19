
import React from 'react';
import { Shield } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface OTPSecurityInfoProps {
  paymentMethod: string;
}

const OTPSecurityInfo: React.FC<OTPSecurityInfoProps> = ({ paymentMethod }) => {
  const { language } = useLanguage();

  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <h3 className="font-semibold text-blue-800 mb-2">
        {language === 'hi' ? '🔐 सुरक्षा सत्यापन' : '🔐 Security Verification'}
      </h3>
      <p className="text-sm text-blue-700 mb-3">
        {language === 'hi' 
          ? `${paymentMethod} भुगतान के लिए आपके पंजीकृत मोबाइल नंबर पर ओटीपी भेजा गया है।`
          : `An OTP has been sent to your registered mobile number for ${paymentMethod} payment.`
        }
      </p>
    </div>
  );
};

export default OTPSecurityInfo;
