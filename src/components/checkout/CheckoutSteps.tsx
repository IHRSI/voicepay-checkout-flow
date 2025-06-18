
import React from 'react';
import { CartItem } from '@/types/product';
import ProductOverview from './ProductOverview';
import AddressStep from './AddressStep';
import PaymentMethodStep from './PaymentMethodStep';
import VerificationStep from './VerificationStep';
import OffersSection from './OffersSection';

interface CheckoutStepsProps {
  currentStep: number;
  cartItems: CartItem[];
  getTotalPrice: () => number;
  voiceMode: boolean;
  isListening: boolean;
  isProcessing: boolean;
  selectedAddressIndex: number;
  paymentMethod: string;
  paymentDetails: {
    upiAddress: string;
    cardHolderName: string;
    cardNumber: string;
    cvv: string;
  };
  otp: string;
  subtotal: number;
  onSwitchToManual: () => void;
  onNextStep: () => void;
  onAddressSelect: (index: number) => void;
  onPaymentMethodChange: (method: string) => void;
  onPaymentDetailsChange: (details: any) => void;
  onOtpChange: (otp: string) => void;
  onCompleteOrder: () => void;
  onOfferApplied: (discount: number, code: string) => void;
}

const CheckoutSteps: React.FC<CheckoutStepsProps> = ({
  currentStep,
  cartItems,
  getTotalPrice,
  voiceMode,
  isListening,
  isProcessing,
  selectedAddressIndex,
  paymentMethod,
  paymentDetails,
  otp,
  subtotal,
  onSwitchToManual,
  onNextStep,
  onAddressSelect,
  onPaymentMethodChange,
  onPaymentDetailsChange,
  onOtpChange,
  onCompleteOrder,
  onOfferApplied
}) => {
  return (
    <div className="lg:col-span-3 space-y-6">
      {/* Step 1: Product Overview */}
      {currentStep === 1 && (
        <ProductOverview
          cartItems={cartItems}
          getTotalPrice={getTotalPrice}
          voiceMode={voiceMode}
          isListening={isListening}
          isProcessing={isProcessing}
          onSwitchToManual={onSwitchToManual}
          onContinue={onNextStep}
        />
      )}

      {/* Offers Section - Show after step 1 */}
      {currentStep > 1 && (
        <OffersSection
          total={subtotal}
          onOfferApplied={onOfferApplied}
          voiceMode={voiceMode}
          isListening={isListening}
        />
      )}

      {/* Step 2: Address */}
      {currentStep === 2 && (
        <AddressStep
          address=""
          voiceMode={voiceMode}
          isListening={isListening}
          isProcessing={isProcessing}
          selectedAddressIndex={selectedAddressIndex}
          onAddressChange={() => {}}
          onAddressSelect={onAddressSelect}
          onContinue={onNextStep}
          onSwitchToManual={onSwitchToManual}
        />
      )}

      {/* Step 3: Payment Method */}
      {currentStep === 3 && (
        <PaymentMethodStep
          paymentMethod={paymentMethod}
          voiceMode={voiceMode}
          isListening={isListening}
          isProcessing={isProcessing}
          onPaymentMethodChange={onPaymentMethodChange}
          onContinue={onNextStep}
          onSwitchToManual={onSwitchToManual}
        />
      )}

      {/* Step 4 & 5: Payment Details & Verification */}
      {(currentStep === 4 || currentStep === 5) && (
        <VerificationStep
          paymentMethod={paymentMethod}
          otp={otp}
          voiceConfirmed={false}
          voiceMode={voiceMode}
          isListening={isListening}
          isProcessing={isProcessing}
          paymentDetails={paymentDetails}
          onPaymentDetailsChange={onPaymentDetailsChange}
          onOtpChange={onOtpChange}
          onVoiceConfirm={() => {}}
          onCompleteOrder={onCompleteOrder}
        />
      )}
    </div>
  );
};

export default CheckoutSteps;
