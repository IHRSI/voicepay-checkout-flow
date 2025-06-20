
import React, { useState, useCallback, useEffect } from 'react';
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

  // Voice command handler with enhanced processing
  const onVoiceCommand = useCallback((transcript: string) => {
    console.log('Checkout voice command received:', transcript);
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
        speak,
        selectedAddressIndex,
        setSelectedAddressIndex
      });
      setIsProcessing(false);
    }, 500);
  }, [currentStep, paymentMethod, paymentDetails, language, selectedAddressIndex]);

  // Single voice recognition instance
  const { isListening, speak } = useVoiceRecognition({
    voiceMode,
    currentStep,
    onVoiceCommand
  });

  // Initial checkout instructions
  useEffect(() => {
    if (!voiceMode) return;
    
    const timer = setTimeout(() => {
      const isHindi = language === 'hi';
      let instructionText = '';
      
      switch (currentStep) {
        case 1:
          instructionText = isHindi 
            ? 'चेकआउट प्रक्रिया शुरू हो रही है। आगे बढ़ने के लिए "continue" कहें।'
            : 'Checkout process starting. Say "continue" to proceed.';
          break;
        case 2:
          instructionText = isHindi 
            ? 'पता चुनें। "पता 1", "पता 2", या "पता 3" कहें।'
            : 'Select address. Say "address 1", "address 2", or "address 3".';
          break;
        case 3:
          instructionText = isHindi 
            ? 'ऑफर चुनें। "ऑफर 1", "ऑफर 2", "ऑफर 3", "ऑफर 4" कहें या "continue" कहें।'
            : 'Choose offer. Say "offer 1", "offer 2", "offer 3", "offer 4" or "continue".';
          break;
        case 4:
          instructionText = isHindi 
            ? 'भुगतान विधि चुनें। "UPI", "कार्ड", या "कैश ऑन डिलीवरी" कहें।'
            : 'Choose payment method. Say "UPI", "card", or "cash on delivery".';
          break;
        case 5:
          if (paymentMethod === 'UPI') {
            instructionText = isHindi 
              ? 'अपना UPI पता बोलें।'
              : 'Speak your UPI address.';
          } else if (paymentMethod === 'Card') {
            instructionText = isHindi 
              ? 'कार्ड होल्डर का नाम बोलें।'
              : 'Speak card holder name.';
          }
          break;
        case 6:
          instructionText = isHindi 
            ? 'अपना OTP बोलें।'
            : 'Speak your OTP.';
          break;
      }
      
      if (instructionText) {
        speak(instructionText);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentStep, voiceMode, language, paymentMethod, speak]);

  // Step navigation with proper flow
  const nextStep = () => {
    const isHindi = language === 'hi';
    
    if (currentStep === 2 && selectedAddressIndex < 0) {
      speak(isHindi ? 'कृपया पहले पता चुनें।' : 'Please select an address first.');
      return;
    }
    if (currentStep === 4 && !paymentMethod) {
      speak(isHindi ? 'कृपया भुगतान विधि चुनें।' : 'Please select a payment method.');
      return;
    }
    
    // Skip to step 5 for Cash on Delivery (no OTP needed)
    if (currentStep === 4 && paymentMethod === 'Cash on Delivery') {
      setCurrentStep(5);
    } else if (currentStep === 5 && (paymentMethod === 'UPI' || paymentMethod === 'Card')) {
      // Check if payment details are filled
      if (paymentMethod === 'UPI' && !paymentDetails.upiAddress) {
        speak(isHindi ? 'कृपया UPI पता डालें।' : 'Please enter UPI address.');
        return;
      }
      if (paymentMethod === 'Card' && (!paymentDetails.cardNumber || !paymentDetails.cvv)) {
        speak(isHindi ? 'कृपया कार्ड की जानकारी डालें।' : 'Please enter card details.');
        return;
      }
      setCurrentStep(6); // Go to OTP verification
    } else {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // Cancel transaction
  const cancelTransaction = () => {
    const isHindi = language === 'hi';
    speak(isHindi ? 'लेनदेन रद्द किया जा रहा है।' : 'Transaction being cancelled.');
    clearCart();
    setTimeout(() => navigate('/cart'), 1000);
  };

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

  // Listen for order completion event from voice commands
  useEffect(() => {
    const handleCompleteOrder = () => {
      completeOrder();
    };

    window.addEventListener('completeOrder', handleCompleteOrder);
    return () => window.removeEventListener('completeOrder', handleCompleteOrder);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <CheckoutHeader
          voiceMode={voiceMode}
          isListening={isListening}
          onToggleVoiceMode={() => setVoiceMode(!voiceMode)}
        />

        {/* Single Voice Status Display */}
        {voiceMode && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-400 shadow-sm text-center">
            <div className="flex items-center justify-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}></div>
              <span className="text-blue-800 font-medium text-lg">
                {language === 'hi' 
                  ? (isProcessing ? 'प्रोसेसिंग...' : (isListening ? 'सुन रहा है...' : 'वॉयस मोड सक्रिय'))
                  : (isProcessing ? 'Processing...' : (isListening ? 'Listening...' : 'Voice Mode Active'))
                }
              </span>
            </div>
            <p className="text-sm text-blue-700 mt-2">
              {language === 'hi'
                ? 'वॉयस कमांड के लिए स्पष्ट रूप से बोलें'
                : 'Speak clearly for voice commands'
              }
            </p>
          </div>
        )}

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
            onCancel={cancelTransaction}
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
