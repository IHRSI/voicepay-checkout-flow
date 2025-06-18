
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Volume2 } from 'lucide-react';

// Import step components
import ProductOverview from '@/components/checkout/ProductOverview';
import AddressStep from '@/components/checkout/AddressStep';
import PaymentMethodStep from '@/components/checkout/PaymentMethodStep';
import VerificationStep from '@/components/checkout/VerificationStep';
import OrderSummary from '@/components/checkout/OrderSummary';
import OffersSection from '@/components/checkout/OffersSection';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { language, t } = useLanguage();
  
  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [voiceMode, setVoiceMode] = useState(true);
  const [isListening, setIsListening] = useState(false);
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

  // Voice recognition
  const [recognition, setRecognition] = useState<any>(null);

  // Calculate final total
  const subtotal = getTotalPrice() * 80;
  const finalTotal = subtotal - appliedDiscount;

  // Speech synthesis helper
  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 1.3;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  }, [language]);

  // Initialize voice recognition
  useEffect(() => {
    if (!voiceMode || currentStep === 1) return;

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
        console.log('Voice input:', transcript);
        handleVoiceCommand(transcript);
      };

      setRecognition(rec);
    }

    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, [voiceMode, currentStep, language]);

  // Handle voice commands
  const handleVoiceCommand = (transcript: string) => {
    setIsProcessing(true);
    
    setTimeout(() => {
      // Payment method selection (Step 3)
      if (currentStep === 3) {
        if (transcript.includes('upi') || transcript.includes('यूपीआई')) {
          setPaymentMethod('UPI');
          speak(language === 'hi' ? 'UPI चुना गया। अब अपना UPI address बोलें।' : 'UPI selected. Now speak your UPI address.');
          setCurrentStep(4);
        } else if (transcript.includes('card') || transcript.includes('कार्ड')) {
          setPaymentMethod('Card');
          speak(language === 'hi' ? 'कार्ड चुना गया। अब अपने कार्ड की जानकारी बोलें।' : 'Card selected. Now speak your card details.');
          setCurrentStep(4);
        } else if (transcript.includes('cash') || transcript.includes('cod') || transcript.includes('कैश')) {
          setPaymentMethod('Cash on Delivery');
          speak(language === 'hi' ? 'कैश ऑन डिलीवरी चुना गया।' : 'Cash on Delivery selected.');
          setCurrentStep(4);
        }
      }
      
      // Payment details (Step 4)
      else if (currentStep === 4) {
        if (paymentMethod === 'UPI' && !paymentDetails.upiAddress) {
          // Extract UPI address from speech
          const upiMatch = transcript.match(/[\w\.-]+@[\w\.-]+/);
          if (upiMatch) {
            setPaymentDetails(prev => ({ ...prev, upiAddress: upiMatch[0] }));
            speak(language === 'hi' ? 'UPI address सेव किया गया। अब OTP बोलें।' : 'UPI address saved. Now speak your OTP.');
          } else {
            speak(language === 'hi' ? 'कृपया अपना UPI address फिर से बोलें।' : 'Please speak your UPI address again.');
          }
        } else if (paymentMethod === 'Card') {
          // Handle card details voice input
          const numbers = transcript.match(/\d+/g);
          if (numbers && numbers.length > 0) {
            const allNumbers = numbers.join('');
            if (allNumbers.length === 16 && !paymentDetails.cardNumber) {
              setPaymentDetails(prev => ({ ...prev, cardNumber: allNumbers }));
              speak(language === 'hi' ? 'कार्ड नंबर सेव किया गया। अब CVV बोलें।' : 'Card number saved. Now speak your CVV.');
            } else if (allNumbers.length === 3 && !paymentDetails.cvv) {
              setPaymentDetails(prev => ({ ...prev, cvv: allNumbers }));
              speak(language === 'hi' ? 'CVV सेव किया गया। अब OTP बोलें।' : 'CVV saved. Now speak your OTP.');
            } else if (allNumbers.length >= 4 && allNumbers.length <= 6) {
              setOtp(allNumbers);
              speak(language === 'hi' ? 'OTP सेव किया गया।' : 'OTP saved.');
            }
          }
        } else if (transcript.match(/\d+/)) {
          // OTP input
          const otpMatch = transcript.match(/\d+/g);
          if (otpMatch) {
            const otpValue = otpMatch.join('');
            setOtp(otpValue);
            speak(language === 'hi' ? 'OTP सेव किया गया।' : 'OTP saved.');
          }
        }
      }
      
      setIsProcessing(false);
    }, 1000);
  };

  // Step navigation
  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // Complete order
  const completeOrder = () => {
    const orderData = {
      items: cartItems,
      total: finalTotal / 80, // Convert back for consistency
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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {language === 'hi' ? 'वॉयस चेकआउट' : 'Voice Checkout'}
          </h1>
          <p className="text-gray-600">
            {language === 'hi' 
              ? 'भारत की सबसे सुलभ चेकआउट प्रक्रिया' 
              : 'India\'s most accessible checkout experience'
            }
          </p>
          
          <div className="flex items-center justify-center gap-4 mt-4">
            <Button
              onClick={() => setVoiceMode(!voiceMode)}
              variant={voiceMode ? "default" : "outline"}
              className="flex items-center gap-2"
            >
              {voiceMode ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              {voiceMode 
                ? (language === 'hi' ? 'वॉयस मोड चालू' : 'Voice Mode ON')
                : (language === 'hi' ? 'वॉयस मोड बंद' : 'Voice Mode OFF')
              }
            </Button>
            
            {isListening && (
              <div className="flex items-center gap-2 text-red-600">
                <Volume2 className="h-5 w-5 animate-pulse" />
                <span className="text-sm font-medium">
                  {language === 'hi' ? 'सुन रहा है...' : 'Listening...'}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Step 1: Product Overview */}
            {currentStep === 1 && (
              <ProductOverview
                cartItems={cartItems}
                getTotalPrice={getTotalPrice}
                voiceMode={voiceMode}
                isListening={isListening}
                isProcessing={isProcessing}
                onSwitchToManual={() => setVoiceMode(false)}
                onContinue={nextStep}
              />
            )}

            {/* Offers Section - Show after step 1 */}
            {currentStep > 1 && (
              <OffersSection
                total={subtotal}
                onOfferApplied={(discount, code) => {
                  setAppliedDiscount(discount);
                  setAppliedOfferCode(code);
                }}
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
                onAddressSelect={setSelectedAddressIndex}
                onContinue={nextStep}
                onSwitchToManual={() => setVoiceMode(false)}
              />
            )}

            {/* Step 3: Payment Method */}
            {currentStep === 3 && (
              <PaymentMethodStep
                paymentMethod={paymentMethod}
                voiceMode={voiceMode}
                isListening={isListening}
                isProcessing={isProcessing}
                onPaymentMethodChange={setPaymentMethod}
                onContinue={nextStep}
                onSwitchToManual={() => setVoiceMode(false)}
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
                onPaymentDetailsChange={setPaymentDetails}
                onOtpChange={setOtp}
                onVoiceConfirm={() => {}}
                onCompleteOrder={completeOrder}
              />
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              {currentStep > 1 && (
                <Button
                  onClick={prevStep}
                  variant="outline"
                  className="px-8"
                >
                  {language === 'hi' ? 'वापस' : 'Back'}
                </Button>
              )}
              
              {currentStep === 1 && (
                <Button
                  onClick={nextStep}
                  className="ml-auto bg-orange-500 hover:bg-orange-600 px-8"
                >
                  {language === 'hi' ? 'पता चुनें' : 'Choose Address'}
                </Button>
              )}
            </div>
          </div>

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
