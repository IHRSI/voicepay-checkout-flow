
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { handleVoiceCommand } from '@/utils/voiceCommandHandler';
import CheckoutHeader from '@/components/checkout/CheckoutHeader';
import CheckoutSteps from '@/components/checkout/CheckoutSteps';
import CheckoutNavigation from '@/components/checkout/CheckoutNavigation';
import OrderSummary from '@/components/checkout/OrderSummary';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { language } = useLanguage();
  
  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [voiceMode, setVoiceMode] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form data
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(-1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({
    upiAddress: '',
    cardHolderName: '',
    cardNumber: '',
    cvv: ''
  });
  const [otp, setOtp] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [appliedOfferCode, setAppliedOfferCode] = useState('');

  // Calculate final total
  const subtotal = getTotalPrice() * 80;
  const finalTotal = subtotal - appliedDiscount;

  // Voice command handler
  const onVoiceCommand = useCallback((transcript: string) => {
    setIsProcessing(true);
    
    setTimeout(() => {
      handleVoiceCommand({
        transcript,
        currentStep,
        paymentMethod,
        paymentDetails,
        language,
        setPaymentMethod,
        setPaymentDetails,
        setOtp,
        setCurrentStep,
        speak
      });
      setIsProcessing(false);
    }, 1000);
  }, [currentStep, paymentMethod, paymentDetails, language]);

  // Voice recognition hook
  const { isListening, speak } = useVoiceRecognition({
    voiceMode,
    currentStep,
    onVoiceCommand
  });

  // Step navigation
  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // Complete order
  const completeOrder = () => {
    const orderData = {
      items: cartItems,
      total: finalTotal / 80,
      orderData: {
        address: selectedAddressIndex >= 0 ? `Address ${selectedAddressIndex + 1}` : '',
        paymentMethod: paymentMethod,
      },
      isCOD: paymentMethod === 'Cash on Delivery',
      appliedOffer: appliedOfferCode,
      discount: appliedDiscount
    };

    clearCart();
    navigate('/success', { state: orderData });
  };

  // Redirect if cart is empty
  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <CheckoutHeader
          voiceMode={voiceMode}
          isListening={isListening}
          onToggleVoiceMode={() => setVoiceMode(!voiceMode)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <CheckoutSteps
            currentStep={currentStep}
            cartItems={cartItems}
            getTotalPrice={getTotalPrice}
            voiceMode={voiceMode}
            isListening={isListening}
            isProcessing={isProcessing}
            selectedAddressIndex={selectedAddressIndex}
            paymentMethod={paymentMethod}
            paymentDetails={paymentDetails}
            otp={otp}
            subtotal={subtotal}
            onSwitchToManual={() => setVoiceMode(false)}
            onNextStep={nextStep}
            onAddressSelect={setSelectedAddressIndex}
            onPaymentMethodChange={setPaymentMethod}
            onPaymentDetailsChange={setPaymentDetails}
            onOtpChange={setOtp}
            onCompleteOrder={completeOrder}
            onOfferApplied={(discount, code) => {
              setAppliedDiscount(discount);
              setAppliedOfferCode(code);
            }}
          />

          <CheckoutNavigation
            currentStep={currentStep}
            onPrevStep={prevStep}
            onNextStep={nextStep}
          />

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <OrderSummary
              cartItems={cartItems}
              getTotalPrice={() => finalTotal / 80}
              currentStep={currentStep}
            />
            
            {appliedDiscount > 0 && (
              <Card className="mt-4 bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-green-800 mb-2">
                    {language === 'hi' ? 'लागू ऑफर' : 'Applied Offer'}
                  </h3>
                  <p className="text-sm text-green-700">
                    {appliedOfferCode}: -₹{appliedDiscount.toFixed(0)}
                  </p>
                  <p className="font-bold text-green-800 mt-2">
                    {language === 'hi' ? 'अंतिम राशि' : 'Final Amount'}: ₹{finalTotal.toFixed(0)}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
