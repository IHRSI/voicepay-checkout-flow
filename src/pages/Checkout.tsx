
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useVoice } from '@/hooks/useVoice';
import { CheckoutData } from '@/types/product';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import OrderSummary from '@/components/checkout/OrderSummary';
import ProductOverview from '@/components/checkout/ProductOverview';
import AddressStep from '@/components/checkout/AddressStep';
import PaymentMethodStep from '@/components/checkout/PaymentMethodStep';
import VerificationStep from '@/components/checkout/VerificationStep';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [voiceMode, setVoiceMode] = useState(true);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    address: '',
    paymentMethod: '',
    otp: '',
    voiceConfirmed: false
  });
  const [paymentDetails, setPaymentDetails] = useState({
    upiAddress: '',
    cardHolderName: '',
    cardNumber: '',
    cvv: ''
  });
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [pendingAddress, setPendingAddress] = useState('');
  const [pendingPaymentMethod, setPendingPaymentMethod] = useState('');

  const { isListening, speak, listen } = useVoice({
    onResult: (transcript) => handleVoiceInput(transcript),
    onError: (error) => {
      toast({
        title: "Voice Error",
        description: error,
        variant: "destructive",
      });
      setIsProcessing(false);
    },
    onEnd: () => {
      setIsProcessing(false);
    }
  });

  // Voice introduction for checkout page
  useEffect(() => {
    const speakIntro = async () => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance("Welcome to VoicePay checkout. India's most accessible payment experience. I will guide you through four simple steps using your voice. Let's complete your order together!");
        utterance.lang = 'en-IN';
        utterance.rate = 0.8;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
      }
    };

    const timer = setTimeout(speakIntro, 500);
    return () => clearTimeout(timer);
  }, []);

  // Auto-start voice checkout when component mounts
  useEffect(() => {
    if (!hasStarted && voiceMode && cartItems.length > 0) {
      setHasStarted(true);
      setTimeout(() => startVoiceCheckout(), 2000);
    }
  }, [hasStarted, voiceMode, cartItems.length]);

  const startVoiceCheckout = async () => {
    const productSummary = cartItems.map((item, index) => 
      `${index + 1}. ${item.title}, quantity ${item.quantity}, price ${(item.price * item.quantity).toFixed(2)} dollars`
    ).join('. ');
    
    await speak(`Namaste! Let me tell you about your order. You have ${cartItems.length} items. ${productSummary}. Your total amount is ${getTotalPrice().toFixed(2)} dollars. Now I'll guide you through our simple 4-step checkout process. Are you ready to proceed? Say yes to continue.`);
    
    setTimeout(() => {
      setIsProcessing(true);
      listen();
    }, 3000);
  };

  const handleVoiceInput = async (transcript: string) => {
    const lowerTranscript = transcript.toLowerCase().trim();
    console.log('Voice input received:', transcript, 'Current step:', currentStep);
    
    // Handle special commands
    if (lowerTranscript.includes('repeat') || lowerTranscript.includes('say again')) {
      await speakStepInstructions(currentStep);
      setTimeout(() => {
        setIsProcessing(true);
        listen();
      }, 1000);
      return;
    }
    
    if (lowerTranscript.includes('help')) {
      await speak("You can say 'repeat' to hear instructions again, 'manual mode' to switch to typing, or simply follow the prompts for each step.");
      setTimeout(() => {
        setIsProcessing(true);
        listen();
      }, 1000);
      return;
    }
    
    if (lowerTranscript.includes('manual mode')) {
      setVoiceMode(false);
      await speak("Switching to manual mode. You can now type your information.");
      return;
    }

    if (awaitingConfirmation) {
      await handleConfirmation(lowerTranscript);
      return;
    }

    switch (currentStep) {
      case 1:
        await handleReadyConfirmation(lowerTranscript);
        break;
      case 2:
        await handleAddressInput(transcript);
        break;
      case 3:
        await handlePaymentMethodInput(lowerTranscript);
        break;
      case 4:
        await handlePaymentDetailsInput(lowerTranscript, transcript);
        break;
    }
  };

  const handleReadyConfirmation = async (lowerTranscript: string) => {
    if (lowerTranscript.includes('yes') || lowerTranscript.includes('ready') || lowerTranscript.includes('proceed')) {
      setCurrentStep(2);
      await speak("Excellent! Step 2: Please tell me your complete delivery address including street, city, and postal code.");
      setTimeout(() => {
        setIsProcessing(true);
        listen();
      }, 2000);
    } else {
      await speak("Take your time. Say 'yes' or 'ready' when you want to proceed with the checkout.");
      setTimeout(() => {
        setIsProcessing(true);
        listen();
      }, 1000);
    }
  };

  const handleAddressInput = async (transcript: string) => {
    setPendingAddress(transcript);
    setCheckoutData(prev => ({ ...prev, address: transcript }));
    await speak(`I heard your address as: ${transcript}. Is this correct? Say yes to confirm or no to try again.`);
    setAwaitingConfirmation(true);
    setTimeout(() => {
      setIsProcessing(true);
      listen();
    }, 1000);
  };

  const handlePaymentMethodInput = async (lowerTranscript: string) => {
    let paymentMethod: 'UPI' | 'Card' | 'Cash on Delivery' | '' = '';
    
    if (lowerTranscript.includes('upi') || lowerTranscript.includes('u p i')) {
      paymentMethod = 'UPI';
    } else if (lowerTranscript.includes('card') || lowerTranscript.includes('credit') || lowerTranscript.includes('debit')) {
      paymentMethod = 'Card';
    } else if (lowerTranscript.includes('cash') || lowerTranscript.includes('cod') || lowerTranscript.includes('delivery')) {
      paymentMethod = 'Cash on Delivery';
    }
    
    if (paymentMethod) {
      setPendingPaymentMethod(paymentMethod);
      setCheckoutData(prev => ({ ...prev, paymentMethod }));
      await speak(`You selected ${paymentMethod}. Is this correct? Say yes to confirm or no to try again.`);
      setAwaitingConfirmation(true);
      setTimeout(() => {
        setIsProcessing(true);
        listen();
      }, 1000);
    } else {
      await speak("I didn't understand. Please say UPI, Card, or Cash on Delivery clearly.");
      setTimeout(() => {
        setIsProcessing(true);
        listen();
      }, 1000);
    }
  };

  const handlePaymentDetailsInput = async (lowerTranscript: string, transcript: string) => {
    if (checkoutData.paymentMethod === 'Cash on Delivery') {
      await speak("Perfect! Your order will be delivered with cash on delivery option. Payment successful! Thank you for shopping with us. Your products will be delivered to your doorstep in 3-5 business days. Continue shopping with VoicePay!");
      setTimeout(() => handlePaymentSuccess(), 2000);
      return;
    }

    if (checkoutData.paymentMethod === 'UPI') {
      if (!paymentDetails.upiAddress) {
        setPaymentDetails(prev => ({ ...prev, upiAddress: transcript }));
        await speak(`I captured your UPI address as: ${transcript}. Is this correct? Say yes to confirm or no to try again.`);
        setAwaitingConfirmation(true);
        setTimeout(() => {
          setIsProcessing(true);
          listen();
        }, 1000);
      } else if (!checkoutData.otp) {
        const otp = transcript.replace(/\D/g, '');
        if (otp.length >= 4) {
          setCheckoutData(prev => ({ ...prev, otp }));
          await speak(`You said OTP ${otp.split('').join(' ')}. Is this correct? Say yes to confirm.`);
          setAwaitingConfirmation(true);
          setTimeout(() => {
            setIsProcessing(true);
            listen();
          }, 1000);
        } else {
          await speak("Please say your OTP clearly. I need at least 4 digits.");
          setTimeout(() => {
            setIsProcessing(true);
            listen();
          }, 1000);
        }
      }
    } else if (checkoutData.paymentMethod === 'Card') {
      if (!paymentDetails.cardHolderName) {
        setPaymentDetails(prev => ({ ...prev, cardHolderName: transcript }));
        await speak(`Card holder name: ${transcript}. Is this correct? Say yes to confirm or no to try again.`);
        setAwaitingConfirmation(true);
        setTimeout(() => {
          setIsProcessing(true);
          listen();
        }, 1000);
      } else if (!paymentDetails.cardNumber) {
        const cardNumber = transcript.replace(/\D/g, '');
        if (cardNumber.length >= 16) {
          setPaymentDetails(prev => ({ ...prev, cardNumber }));
          await speak(`Card number captured. Now please tell me the CVV.`);
          setTimeout(() => {
            setIsProcessing(true);
            listen();
          }, 1000);
        } else {
          await speak("Please say your complete 16-digit card number clearly.");
          setTimeout(() => {
            setIsProcessing(true);
            listen();
          }, 1000);
        }
      } else if (!paymentDetails.cvv) {
        const cvv = transcript.replace(/\D/g, '');
        if (cvv.length >= 3) {
          setPaymentDetails(prev => ({ ...prev, cvv }));
          await speak(`CVV captured. Now please tell me the OTP sent to your registered mobile number.`);
          setTimeout(() => {
            setIsProcessing(true);
            listen();
          }, 1000);
        } else {
          await speak("Please say your 3 or 4 digit CVV clearly.");
          setTimeout(() => {
            setIsProcessing(true);
            listen();
          }, 1000);
        }
      } else if (!checkoutData.otp) {
        const otp = transcript.replace(/\D/g, '');
        if (otp.length >= 4) {
          setCheckoutData(prev => ({ ...prev, otp }));
          await speak(`OTP ${otp.split('').join(' ')} captured. Is this correct? Say yes to proceed with payment.`);
          setAwaitingConfirmation(true);
          setTimeout(() => {
            setIsProcessing(true);
            listen();
          }, 1000);
        } else {
          await speak("Please say your OTP clearly. I need at least 4 digits.");
          setTimeout(() => {
            setIsProcessing(true);
            listen();
          }, 1000);
        }
      }
    }
  };

  const handleConfirmation = async (lowerTranscript: string) => {
    setAwaitingConfirmation(false);
    
    if (lowerTranscript.includes('yes') || lowerTranscript.includes('yeah') || lowerTranscript.includes('correct') || lowerTranscript.includes('confirm')) {
      if (currentStep === 2 && pendingAddress) {
        // Address confirmed, move to payment method
        setCurrentStep(3);
        await speak("Great! Step 3: Please tell me your payment method. Say UPI, Card, or Cash on Delivery.");
        setTimeout(() => {
          setIsProcessing(true);
          listen();
        }, 2000);
      } else if (currentStep === 3 && pendingPaymentMethod) {
        // Payment method confirmed, move to details
        setCurrentStep(4);
        if (checkoutData.paymentMethod === 'UPI') {
          await speak("Step 4: Final step! Please tell me your UPI address or UPI ID for payment.");
        } else if (checkoutData.paymentMethod === 'Card') {
          await speak("Step 4: Final step! Please tell me the card holder's full name.");
        } else {
          await speak("Step 4: Final step! Your order will be delivered with cash on delivery option. Processing your order now...");
          setTimeout(() => handlePaymentSuccess(), 2000);
          return;
        }
        setTimeout(() => {
          setIsProcessing(true);
          listen();
        }, 2000);
      } else if (currentStep === 4) {
        // Handle payment details confirmation
        if (checkoutData.paymentMethod === 'UPI' && !checkoutData.otp) {
          await speak("Perfect! Now please tell me the OTP sent to your mobile for UPI verification.");
          setTimeout(() => {
            setIsProcessing(true);
            listen();
          }, 1000);
        } else if (checkoutData.paymentMethod === 'Card' && !paymentDetails.cardNumber) {
          await speak("Perfect! Now please tell me your 16-digit card number.");
          setTimeout(() => {
            setIsProcessing(true);
            listen();
          }, 1000);
        } else if (checkoutData.paymentMethod === 'Card' && !paymentDetails.cvv) {
          await speak("Great! Now please tell me the CVV from the back of your card.");
          setTimeout(() => {
            setIsProcessing(true);
            listen();
          }, 1000);
        } else if (checkoutData.paymentMethod === 'Card' && !checkoutData.otp) {
          await speak("Excellent! Now please tell me the OTP sent to your registered mobile number.");
          setTimeout(() => {
            setIsProcessing(true);
            listen();
          }, 1000);
        } else if (checkoutData.otp) {
          // Final OTP confirmation
          await speak("Payment successful! Thank you for shopping with us. Your products will be delivered to your doorstep in 3-5 business days. Continue shopping with VoicePay!");
          setTimeout(() => handlePaymentSuccess(), 2000);
        }
      }
    } else if (lowerTranscript.includes('no') || lowerTranscript.includes('nope') || lowerTranscript.includes('wrong')) {
      await speak("No problem, let's try again.");
      if (currentStep === 2) {
        setPendingAddress('');
        setCheckoutData(prev => ({ ...prev, address: '' }));
      } else if (currentStep === 3) {
        setPendingPaymentMethod('');
        setCheckoutData(prev => ({ ...prev, paymentMethod: '' }));
      }
      await speakStepInstructions(currentStep);
      setTimeout(() => {
        setIsProcessing(true);
        listen();
      }, 1000);
    } else {
      await speak("Please say yes to confirm or no to try again.");
      setTimeout(() => {
        setIsProcessing(true);
        listen();
      }, 1000);
    }
  };

  const speakStepInstructions = async (step: number) => {
    switch (step) {
      case 1:
        await speak("Say 'yes' or 'ready' to proceed with checkout.");
        break;
      case 2:
        await speak("Please speak your complete delivery address including street, city, and postal code.");
        break;
      case 3:
        await speak("Please say your payment method: UPI, Card, or Cash on Delivery.");
        break;
      case 4:
        if (checkoutData.paymentMethod === 'UPI') {
          if (!paymentDetails.upiAddress) {
            await speak("Please tell me your UPI address or UPI ID.");
          } else {
            await speak("Please tell me the OTP sent to your mobile for UPI verification.");
          }
        } else if (checkoutData.paymentMethod === 'Card') {
          if (!paymentDetails.cardHolderName) {
            await speak("Please tell me the card holder's full name.");
          } else if (!paymentDetails.cardNumber) {
            await speak("Please tell me your 16-digit card number.");
          } else if (!paymentDetails.cvv) {
            await speak("Please tell me the CVV from the back of your card.");
          } else {
            await speak("Please tell me the OTP sent to your registered mobile number.");
          }
        } else {
          await speak("Your order will be delivered with cash on delivery option.");
        }
        break;
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    navigate('/success', { 
      state: { 
        orderData: { ...checkoutData, ...paymentDetails },
        total: getTotalPrice(),
        items: cartItems
      }
    });
  };

  const switchToManualMode = () => {
    setVoiceMode(false);
    speak("Switched to manual mode. You can now type your information.");
  };

  const progressValue = (currentStep / 4) * 100;

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
            {voiceMode ? '🎙️ Voice Checkout' : 'Checkout'}
          </h1>
          <Progress value={progressValue} className="h-3 bg-gray-200" />
          <p className="text-sm text-gray-600 mt-2 text-center">Step {currentStep} of 4</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Product Overview */}
            {currentStep === 1 && (
              <ProductOverview
                cartItems={cartItems}
                getTotalPrice={getTotalPrice}
                voiceMode={voiceMode}
                isListening={isListening}
                isProcessing={isProcessing}
                onSwitchToManual={switchToManualMode}
                onContinue={() => setCurrentStep(2)}
              />
            )}

            {/* Step 2: Address */}
            {currentStep === 2 && (
              <AddressStep
                address={checkoutData.address}
                voiceMode={voiceMode}
                isListening={isListening}
                isProcessing={isProcessing}
                onAddressChange={(address) => setCheckoutData(prev => ({ ...prev, address }))}
                onContinue={() => setCurrentStep(3)}
                onSwitchToManual={switchToManualMode}
              />
            )}

            {/* Step 3: Payment Method */}
            {currentStep === 3 && (
              <PaymentMethodStep
                paymentMethod={checkoutData.paymentMethod}
                voiceMode={voiceMode}
                isListening={isListening}
                isProcessing={isProcessing}
                onPaymentMethodChange={(method) => setCheckoutData(prev => ({ ...prev, paymentMethod: method as any }))}
                onContinue={() => setCurrentStep(4)}
              />
            )}

            {/* Step 4: Payment Details & Verification */}
            {currentStep === 4 && (
              <VerificationStep
                paymentMethod={checkoutData.paymentMethod}
                otp={checkoutData.otp}
                voiceConfirmed={checkoutData.voiceConfirmed}
                voiceMode={voiceMode}
                isListening={isListening}
                isProcessing={isProcessing}
                paymentDetails={paymentDetails}
                onPaymentDetailsChange={setPaymentDetails}
                onOtpChange={(otp) => setCheckoutData(prev => ({ ...prev, otp }))}
                onVoiceConfirm={() => setCheckoutData(prev => ({ ...prev, voiceConfirmed: true }))}
                onCompleteOrder={handlePaymentSuccess}
              />
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              cartItems={cartItems}
              getTotalPrice={getTotalPrice}
              currentStep={currentStep}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
