
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, CreditCard, Smartphone } from 'lucide-react';
import VoiceStatusIndicator from './VoiceStatusIndicator';

interface VerificationStepProps {
  paymentMethod: string;
  otp: string;
  voiceConfirmed: boolean;
  voiceMode: boolean;
  isListening: boolean;
  isProcessing: boolean;
  paymentDetails: {
    upiAddress: string;
    cardHolderName: string;
    cardNumber: string;
    cvv: string;
  };
  onPaymentDetailsChange: (details: any) => void;
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
  paymentDetails,
  onPaymentDetailsChange,
  onOtpChange,
  onVoiceConfirm,
  onCompleteOrder
}) => {
  const isUPI = paymentMethod === 'UPI';
  const isCard = paymentMethod === 'Card';
  const isCOD = paymentMethod === 'Cash on Delivery';

  const getStepTitle = () => {
    if (isCOD) return 'Order Confirmation';
    if (isUPI) return 'UPI Payment Details';
    if (isCard) return 'Card Payment Details';
    return 'Payment Verification';
  };

  const getStepIcon = () => {
    if (isCOD) return <CheckCircle className="h-6 w-6" />;
    if (isUPI) return <Smartphone className="h-6 w-6" />;
    if (isCard) return <CreditCard className="h-6 w-6" />;
    return <Shield className="h-6 w-6" />;
  };

  return (
    <Card className="mb-6 shadow-lg border-gray-200">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <CardTitle className="flex items-center gap-2">
          {getStepIcon()}
          {getStepTitle()}
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
            
            {/* Display captured payment details */}
            {isUPI && paymentDetails.upiAddress && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Label className="text-sm text-blue-600">UPI Address:</Label>
                <p className="font-medium font-mono mt-1 text-blue-800">{paymentDetails.upiAddress}</p>
              </div>
            )}
            
            {isCard && (
              <div className="space-y-3">
                {paymentDetails.cardHolderName && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Label className="text-sm text-blue-600">Card Holder Name:</Label>
                    <p className="font-medium mt-1 text-blue-800">{paymentDetails.cardHolderName}</p>
                  </div>
                )}
                {paymentDetails.cardNumber && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Label className="text-sm text-blue-600">Card Number:</Label>
                    <p className="font-medium font-mono mt-1 text-blue-800">**** **** **** {paymentDetails.cardNumber.slice(-4)}</p>
                  </div>
                )}
                {paymentDetails.cvv && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Label className="text-sm text-blue-600">CVV:</Label>
                    <p className="font-medium font-mono mt-1 text-blue-800">***</p>
                  </div>
                )}
              </div>
            )}

            {otp && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <Label className="text-sm text-green-600">Captured OTP:</Label>
                <p className="font-medium font-mono mt-1 text-green-800">{otp}</p>
              </div>
            )}

            {isCOD && (
              <div className="flex items-center gap-2 text-green-600 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Cash on Delivery confirmed!</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {isUPI && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="upiAddress" className="text-gray-700 font-medium">UPI Address / UPI ID</Label>
                  <Input
                    id="upiAddress"
                    value={paymentDetails.upiAddress}
                    onChange={(e) => onPaymentDetailsChange({...paymentDetails, upiAddress: e.target.value})}
                    placeholder="yourname@upi"
                    className="mt-1 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
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
              </div>
            )}

            {isCard && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardHolderName" className="text-gray-700 font-medium">Card Holder Name</Label>
                  <Input
                    id="cardHolderName"
                    value={paymentDetails.cardHolderName}
                    onChange={(e) => onPaymentDetailsChange({...paymentDetails, cardHolderName: e.target.value})}
                    placeholder="Full name as on card"
                    className="mt-1 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <Label htmlFor="cardNumber" className="text-gray-700 font-medium">Card Number</Label>
                  <Input
                    id="cardNumber"
                    value={paymentDetails.cardNumber}
                    onChange={(e) => onPaymentDetailsChange({...paymentDetails, cardNumber: e.target.value})}
                    placeholder="1234 5678 9012 3456"
                    className="mt-1 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <Label htmlFor="cvv" className="text-gray-700 font-medium">CVV</Label>
                  <Input
                    id="cvv"
                    value={paymentDetails.cvv}
                    onChange={(e) => onPaymentDetailsChange({...paymentDetails, cvv: e.target.value})}
                    placeholder="123"
                    className="mt-1 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <Label htmlFor="cardOtp" className="text-gray-700 font-medium">Enter OTP</Label>
                  <Input
                    id="cardOtp"
                    value={otp}
                    onChange={(e) => onOtpChange(e.target.value)}
                    placeholder="Enter your OTP"
                    className="mt-1 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
              </div>
            )}

            {isCOD && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-600 mb-3">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Cash on Delivery Selected</span>
                </div>
                <p className="text-sm text-green-700">
                  Your order will be delivered to your address. Pay cash when you receive your items.
                </p>
              </div>
            )}
            
            {((isUPI && paymentDetails.upiAddress && otp) || 
              (isCard && paymentDetails.cardHolderName && paymentDetails.cardNumber && paymentDetails.cvv && otp) || 
              isCOD) && (
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
