
import React from 'react';
import { CartItem } from '@/types/product';
import ProductOverview from './ProductOverview';
import AddressStep from './AddressStep';
import PaymentMethodStep from './PaymentMethodStep';
import PaymentDetailsStep from './PaymentDetailsStep';
import OTPVerificationStep from './OTPVerificationStep';
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
  onCancel: () => void;
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
  onOfferApplied,
  onCancel
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

      {/* Step 3: Offers Section */}
      {currentStep === 3 && (
        <OffersSection
          total={subtotal}
          onOfferApplied={onOfferApplied}
          voiceMode={voiceMode}
          isListening={isListening}
          onContinue={onNextStep}
        />
      )}

      {/* Step 4: Payment Method */}
      {currentStep === 4 && (
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

      {/* Step 5: Payment Details */}
      {currentStep === 5 && (paymentMethod === 'UPI' || paymentMethod === 'Card') && (
        <PaymentDetailsStep
          paymentMethod={paymentMethod}
          voiceMode={voiceMode}
          isListening={isListening}
          isProcessing={isProcessing}
          paymentDetails={paymentDetails}
          onPaymentDetailsChange={onPaymentDetailsChange}
          onContinue={onNextStep}
          onSwitchToManual={onSwitchToManual}
          onCancel={onCancel}
        />
      )}

      {/* Step 5: Direct completion for COD */}
      {currentStep === 5 && paymentMethod === 'Cash on Delivery' && (
        <div className="space-y-4">
          <div className="p-6 bg-green-50 rounded-lg border border-green-200 text-center">
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              Cash on Delivery Selected
            </h3>
            <p className="text-green-700 mb-4">
              Your order will be delivered to your address. Pay cash when you receive your items.
            </p>
            <button
              onClick={onCompleteOrder}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold"
            >
              Confirm Order
            </button>
          </div>
        </div>
      )}

      {/* Step 6: OTP Verification (only for UPI and Card) */}
      {currentStep === 6 && (paymentMethod === 'UPI' || paymentMethod === 'Card') && (
        <OTPVerificationStep
          voiceMode={voiceMode}
          isListening={isListening}
          isProcessing={isProcessing}
          otp={otp}
          paymentMethod={paymentMethod}
          onOtpChange={onOtpChange}
          onCompleteOrder={onCompleteOrder}
          onSwitchToManual={onSwitchToManual}
          onCancel={onCancel}
        />
      )}
    </div>
  );
};

export default CheckoutSteps;
