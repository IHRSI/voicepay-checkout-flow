
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import VoiceStatusIndicator from './VoiceStatusIndicator';

interface CardPaymentFormProps {
  voiceMode: boolean;
  isListening: boolean;
  isProcessing: boolean;
  paymentDetails: {
    cardHolderName: string;
    cardNumber: string;
    cvv: string;
  };
  onPaymentDetailsChange: (details: any) => void;
  onContinue: () => void;
  onSwitchToManual: () => void;
}

const CardPaymentForm: React.FC<CardPaymentFormProps> = ({
  voiceMode,
  isListening,
  isProcessing,
  paymentDetails,
  onPaymentDetailsChange,
  onContinue,
  onSwitchToManual
}) => {
  const isFormComplete = paymentDetails.cardHolderName && paymentDetails.cardNumber && paymentDetails.cvv;

  return (
    <Card className="mb-6 shadow-lg border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-6 w-6" />
          Card Payment Details
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
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-3">💳 Card Details</h3>
              
              {paymentDetails.cardHolderName && (
                <div className="mb-3 p-3 bg-white rounded border">
                  <Label className="text-sm text-blue-600">Card Holder Name:</Label>
                  <p className="font-medium text-blue-800">{paymentDetails.cardHolderName}</p>
                </div>
              )}
              
              {paymentDetails.cardNumber && (
                <div className="mb-3 p-3 bg-white rounded border">
                  <Label className="text-sm text-blue-600">Card Number:</Label>
                  <p className="font-medium font-mono text-blue-800">
                    **** **** **** {paymentDetails.cardNumber.slice(-4)}
                  </p>
                </div>
              )}
              
              {paymentDetails.cvv && (
                <div className="mb-3 p-3 bg-white rounded border">
                  <Label className="text-sm text-blue-600">CVV:</Label>
                  <p className="font-medium font-mono text-blue-800">***</p>
                </div>
              )}
            </div>

            <Button
              onClick={onSwitchToManual}
              variant="outline"
              className="w-full hover:bg-blue-50 border-blue-200"
            >
              Switch to Manual Typing
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardHolderName" className="text-gray-700 font-medium">Card Holder Name</Label>
              <Input
                id="cardHolderName"
                value={paymentDetails.cardHolderName}
                onChange={(e) => onPaymentDetailsChange({...paymentDetails, cardHolderName: e.target.value})}
                placeholder="Full name as on card"
                className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="cardNumber" className="text-gray-700 font-medium">Card Number</Label>
              <Input
                id="cardNumber"
                value={paymentDetails.cardNumber}
                onChange={(e) => onPaymentDetailsChange({...paymentDetails, cardNumber: e.target.value})}
                placeholder="1234 5678 9012 3456"
                className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="cvv" className="text-gray-700 font-medium">CVV</Label>
              <Input
                id="cvv"
                value={paymentDetails.cvv}
                onChange={(e) => onPaymentDetailsChange({...paymentDetails, cvv: e.target.value})}
                placeholder="123"
                maxLength={4}
                className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            {isFormComplete && (
              <Button 
                onClick={onContinue}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
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

export default CardPaymentForm;
