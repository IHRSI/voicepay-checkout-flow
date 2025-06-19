
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface OTPActionButtonsProps {
  voiceMode: boolean;
  otp: string;
  onSwitchToManual?: () => void;
  onCancel: () => void;
  onCompleteOrder: () => void;
}

const OTPActionButtons: React.FC<OTPActionButtonsProps> = ({
  voiceMode,
  otp,
  onSwitchToManual,
  onCancel,
  onCompleteOrder
}) => {
  const { language } = useLanguage();

  return (
    <div className="space-y-2">
      {voiceMode && onSwitchToManual && (
        <div className="flex gap-2">
          <Button
            onClick={onSwitchToManual}
            variant="outline"
            className="flex-1 hover:bg-purple-50 border-purple-200"
          >
            {language === 'hi' ? 'मैनुअल टाइपिंग' : 'Manual Typing'}
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1 hover:bg-red-50 border-red-200 text-red-600"
          >
            {language === 'hi' ? 'रद्द करें' : 'Cancel'}
          </Button>
        </div>
      )}

      {!voiceMode && (
        <div className="flex gap-2">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1 hover:bg-red-50 border-red-200 text-red-600"
          >
            {language === 'hi' ? 'रद्द करें' : 'Cancel'}
          </Button>
          {otp && otp.length >= 4 && (
            <Button 
              onClick={onCompleteOrder}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              {language === 'hi' ? 'भुगतान पूरा करें' : 'Complete Payment'}
            </Button>
          )}
        </div>
      )}

      {voiceMode && otp && otp.length >= 4 && (
        <Button 
          onClick={onCompleteOrder}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
        >
          <CheckCircle className="h-5 w-5 mr-2" />
          {language === 'hi' ? 'भुगतान पूरा करें' : 'Complete Payment'}
        </Button>
      )}
    </div>
  );
};

export default OTPActionButtons;
