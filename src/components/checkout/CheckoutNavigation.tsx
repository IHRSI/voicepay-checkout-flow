
import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';

interface CheckoutNavigationProps {
  currentStep: number;
  onPrevStep: () => void;
  onNextStep: () => void;
}

const CheckoutNavigation: React.FC<CheckoutNavigationProps> = ({
  currentStep,
  onPrevStep,
  onNextStep
}) => {
  const { language } = useLanguage();

  return (
    <div className="flex justify-between pt-6">
      {currentStep > 1 && (
        <Button
          onClick={onPrevStep}
          variant="outline"
          className="px-8"
        >
          {language === 'hi' ? 'वापस' : 'Back'}
        </Button>
      )}
      
      {currentStep === 1 && (
        <Button
          onClick={onNextStep}
          className="ml-auto bg-orange-500 hover:bg-orange-600 px-8"
        >
          {language === 'hi' ? 'पता चुनें' : 'Choose Address'}
        </Button>
      )}
    </div>
  );
};

export default CheckoutNavigation;
