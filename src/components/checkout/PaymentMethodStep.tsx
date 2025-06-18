
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CreditCard } from 'lucide-react';
import VoiceStatusIndicator from './VoiceStatusIndicator';

interface PaymentMethodStepProps {
  paymentMethod: string;
  voiceMode: boolean;
  isListening: boolean;
  isProcessing: boolean;
  onPaymentMethodChange: (method: string) => void;
  onContinue: () => void;
  onSwitchToManual?: () => void;
}

const PaymentMethodStep: React.FC<PaymentMethodStepProps> = ({
  paymentMethod,
  voiceMode,
  isListening,
  isProcessing,
  onPaymentMethodChange,
  onContinue,
  onSwitchToManual
}) => {
  const paymentMethods = ['UPI', 'Card', 'Cash on Delivery'];

  return (
    <Card className="mb-6 shadow-lg border-gray-200">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-6 w-6" />
          Payment Method
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {voiceMode ? (
          <div className="space-y-4">
            <VoiceStatusIndicator 
              isListening={isListening} 
              isProcessing={isProcessing} 
              currentStep={3}
            />
            {paymentMethod && (
              <div className="p-4 bg-gray-50 rounded-lg border">
                <Label className="text-sm text-gray-600">Selected Method:</Label>
                <p className="font-medium mt-1 text-gray-800">{paymentMethod}</p>
              </div>
            )}
            {onSwitchToManual && (
              <Button
                onClick={onSwitchToManual}
                variant="outline"
                className="w-full hover:bg-orange-50 border-orange-200"
              >
                Switch to Manual Mode
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {paymentMethods.map((method) => (
              <Button
                key={method}
                variant={paymentMethod === method ? 'default' : 'outline'}
                onClick={() => onPaymentMethodChange(method)}
                className={`justify-start p-4 h-auto transition-all ${
                  paymentMethod === method 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md' 
                    : 'hover:bg-orange-50 border-gray-300 hover:border-orange-300'
                }`}
              >
                {method}
              </Button>
            ))}
            {paymentMethod && (
              <Button 
                onClick={onContinue}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white transition-colors mt-4"
              >
                Continue to Verification
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentMethodStep;
