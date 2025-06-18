
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
import CardPaymentForm from '@/components/checkout/CardPaymentForm';
import UPIPaymentForm from '@/components/checkout/UPIPaymentForm';
import OTPVerificationForm from '@/components/checkout/OTPVerificationForm';

const savedAddresses = [
  "123 MG Road, Connaught Place, New Delhi, Delhi 110001",
  "45 Brigade Road, Bangalore, Karnataka 560025", 
  "78 Marine Drive, Mumbai, Maharashtra 400002"
];

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [voiceMode, setVoiceMode] = useState(true);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(-1);
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
  const [confirmationType, setConfirmationType] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const { isListening, speak } = useVoice({
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

  // Stop all speech synthesis when component unmounts or step changes
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentStep]);

  // Enhanced speak function with faster rate
  const speakFast = async (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        console.log('Speech synthesis not supported');
        resolve();
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 2.2; // Faster speech
      utterance.pitch = 1.1;
      utterance.volume = 1;
      utterance.lang = 'en-IN';
      
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    });
  };

  // Voice introduction for checkout page
  useEffect(() => {
    const speakIntro = async () => {
      if ('speechSynthesis' in window && voiceMode && cartItems.length > 0) {
        // Cancel any existing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance("Welcome to VoicePay checkout. India's most accessible payment experience. I will guide you through simple steps using your voice. Let's complete your order together!");
        utterance.lang = 'en-IN';
        utterance.rate = 2.2;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
      }
    };

    const timer = setTimeout(speakIntro, 500);
    return () => clearTimeout(timer);
  }, [voiceMode, cartItems.length]);

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
    
    await speakFast(`Namaste! Let me tell you about your order. You have ${cartItems.length} items. ${productSummary}. Your total amount is ${getTotalPrice().toFixed(2)} dollars. Are you ready to proceed? Say yes to continue.`);
    
    setTimeout(() => {
      setIsProcessing(true);
      startListening();
    }, 800);
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        console.log('Voice recognition started');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('Voice input received:', transcript);
        handleVoiceInput(transcript);
      };

      recognition.onend = () => {
        setIsProcessing(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsProcessing(false);
      };

      recognition.start();
    }
  };

  const handleVoiceInput = async (transcript: string) => {
    const lowerTranscript = transcript.toLowerCase().trim();
    console.log('Processing voice input:', transcript, 'Step:', currentStep, 'Awaiting:', awaitingConfirmation);
    
    if (awaitingConfirmation) {
      await handleConfirmation(lowerTranscript);
      return;
    }

    switch (currentStep) {
      case 1:
        await handleReadyConfirmation(lowerTranscript);
        break;
      case 2:
        await handleAddressSelection(lowerTranscript);
        break;
      case 3:
        await handlePaymentMethodInput(lowerTranscript);
        break;
      case 4:
        await handlePaymentDetailsInput(lowerTranscript, transcript);
        break;
      case 5:
        await handleOTPInput(transcript);
        break;
    }
  };

  const handleReadyConfirmation = async (lowerTranscript: string) => {
    if (lowerTranscript.includes('yes') || lowerTranscript.includes('ready') || lowerTranscript.includes('proceed')) {
      setCurrentStep(2);
      await speakFast("Excellent! Step 2: I have 3 saved addresses for you. Say 'address 1', 'address 2', or 'address 3' to select. Address 1: MG Road New Delhi. Address 2: Brigade Road Bangalore. Address 3: Marine Drive Mumbai.");
      setTimeout(() => {
        setIsProcessing(true);
        startListening();
      }, 600);
    } else {
      await speakFast("Take your time. Say 'yes' or 'ready' when you want to proceed with the checkout.");
      setTimeout(() => {
        setIsProcessing(true);
        startListening();
      }, 500);
    }
  };

  const handleAddressSelection = async (lowerTranscript: string) => {
    let addressIndex = -1;
    
    if (lowerTranscript.includes('address 1') || lowerTranscript.includes('first') || lowerTranscript.includes('one')) {
      addressIndex = 0;
    } else if (lowerTranscript.includes('address 2') || lowerTranscript.includes('second') || lowerTranscript.includes('two')) {
      addressIndex = 1;
    } else if (lowerTranscript.includes('address 3') || lowerTranscript.includes('third') || lowerTranscript.includes('three')) {
      addressIndex = 2;
    }
    
    if (addressIndex >= 0) {
      setSelectedAddressIndex(addressIndex);
      setCheckoutData(prev => ({ ...prev, address: savedAddresses[addressIndex] }));
      
      await speakFast(`You selected ${savedAddresses[addressIndex]}. Is this correct? Say yes to confirm.`);
      setAwaitingConfirmation(true);
      setConfirmationType('address');
      
      setTimeout(() => {
        setIsProcessing(true);
        startListening();
      }, 400);
    } else {
      await speakFast("Please say 'address 1', 'address 2', or 'address 3' to select your delivery address.");
      setTimeout(() => {
        setIsProcessing(true);
        startListening();
      }, 500);
    }
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
      setCheckoutData(prev => ({ ...prev, paymentMethod }));
      
      await speakFast(`You selected ${paymentMethod}. Is this correct? Say yes to confirm.`);
      setAwaitingConfirmation(true);
      setConfirmationType('paymentMethod');
      
      setTimeout(() => {
        setIsProcessing(true);
        startListening();
      }, 400);
    } else {
      await speakFast("Please say UPI, Card, or Cash on Delivery clearly.");
      setTimeout(() => {
        setIsProcessing(true);
        startListening();
      }, 500);
    }
  };

  const handlePaymentDetailsInput = async (lowerTranscript: string, transcript: string) => {
    if (checkoutData.paymentMethod === 'Cash on Delivery') {
      await speakFast("Perfect! Your order has been placed successfully with cash on delivery. Payment completed! Thank you for shopping with VoicePay!");
      setTimeout(() => handlePaymentSuccess(), 2000);
      return;
    }

    if (checkoutData.paymentMethod === 'UPI') {
      setPaymentDetails(prev => ({ ...prev, upiAddress: transcript }));
      await speakFast(`UPI address captured as: ${transcript}. Is this correct? Say yes to confirm.`);
      setAwaitingConfirmation(true);
      setConfirmationType('upiAddress');
      
      setTimeout(() => {
        setIsProcessing(true);
        startListening();
      }, 400);
    } else if (checkoutData.paymentMethod === 'Card') {
      if (!paymentDetails.cardHolderName) {
        setPaymentDetails(prev => ({ ...prev, cardHolderName: transcript }));
        await speakFast(`Card holder name: ${transcript}. Is this correct? Say yes to confirm.`);
        setAwaitingConfirmation(true);
        setConfirmationType('cardHolderName');
        
        setTimeout(() => {
          setIsProcessing(true);
          startListening();
        }, 400);
      } else if (!paymentDetails.cardNumber) {
        const cardNumber = transcript.replace(/\D/g, '');
        if (cardNumber.length >= 16) {
          setPaymentDetails(prev => ({ ...prev, cardNumber }));
          await speakFast(`Card number captured. Is this correct? Say yes to continue.`);
          setAwaitingConfirmation(true);
          setConfirmationType('cardNumber');
          
          setTimeout(() => {
            setIsProcessing(true);
            startListening();
          }, 400);
        } else {
          await speakFast("Please say your complete 16-digit card number clearly.");
          setTimeout(() => {
            setIsProcessing(true);
            startListening();
          }, 500);
        }
      } else if (!paymentDetails.cvv) {
        const cvv = transcript.replace(/\D/g, '');
        if (cvv.length >= 3) {
          setPaymentDetails(prev => ({ ...prev, cvv }));
          await speakFast(`CVV captured. Is this correct? Say yes to continue.`);
          setAwaitingConfirmation(true);
          setConfirmationType('cvv');
          
          setTimeout(() => {
            setIsProcessing(true);
            startListening();
          }, 400);
        } else {
          await speakFast("Please say your 3 or 4 digit CVV clearly.");
          setTimeout(() => {
            setIsProcessing(true);
            startListening();
          }, 500);
        }
      }
    }
  };

  const handleOTPInput = async (transcript: string) => {
    const otp = transcript.replace(/\D/g, '');
    if (otp.length >= 4) {
      setCheckoutData(prev => ({ ...prev, otp }));
      await speakFast(`OTP ${otp.split('').join(' ')} captured. Is this correct? Say yes to complete payment.`);
      setAwaitingConfirmation(true);
      setConfirmationType('finalOtp');
      
      setTimeout(() => {
        setIsProcessing(true);
        startListening();
      }, 400);
    } else {
      await speakFast("Please say your OTP clearly. I need at least 4 digits.");
      setTimeout(() => {
        setIsProcessing(true);
        startListening();
      }, 500);
    }
  };

  const handleConfirmation = async (lowerTranscript: string) => {
    const isYes = lowerTranscript.includes('yes') || lowerTranscript.includes('correct') || lowerTranscript.includes('confirm');
    const isNo = lowerTranscript.includes('no') || lowerTranscript.includes('wrong');
    
    setAwaitingConfirmation(false);
    
    if (isYes) {
      switch (confirmationType) {
        case 'address':
          setCurrentStep(3);
          await speakFast("Great! Step 3: Please tell me your payment method. Say UPI, Card, or Cash on Delivery.");
          setTimeout(() => {
            setIsProcessing(true);
            startListening();
          }, 600);
          break;
          
        case 'paymentMethod':
          if (checkoutData.paymentMethod === 'Cash on Delivery') {
            await speakFast("Perfect! Your order has been placed successfully with cash on delivery. Payment completed! Thank you for shopping with VoicePay!");
            setTimeout(() => handlePaymentSuccess(), 2000);
            return;
          }
          setCurrentStep(4);
          if (checkoutData.paymentMethod === 'UPI') {
            await speakFast("Step 4: Please tell me your UPI address or UPI ID for payment.");
          } else if (checkoutData.paymentMethod === 'Card') {
            await speakFast("Step 4: Please tell me the card holder's full name.");
          }
          setTimeout(() => {
            setIsProcessing(true);
            startListening();
          }, 600);
          break;
          
        case 'upiAddress':
          setCurrentStep(5);
          await speakFast("Perfect! Now please tell me the OTP sent to your mobile for UPI verification.");
          setTimeout(() => {
            setIsProcessing(true);
            startListening();
          }, 600);
          break;
          
        case 'cardHolderName':
          await speakFast("Perfect! Now please tell me your 16-digit card number.");
          setTimeout(() => {
            setIsProcessing(true);
            startListening();
          }, 600);
          break;
          
        case 'cardNumber':
          await speakFast("Great! Now please tell me the CVV from the back of your card.");
          setTimeout(() => {
            setIsProcessing(true);
            startListening();
          }, 600);
          break;
          
        case 'cvv':
          setCurrentStep(5);
          await speakFast("Excellent! Now please tell me the OTP sent to your registered mobile number.");
          setTimeout(() => {
            setIsProcessing(true);
            startListening();
          }, 600);
          break;
          
        case 'finalOtp':
          await speakFast("Payment successful! Thank you for shopping with VoicePay. Your order has been placed successfully!");
          setTimeout(() => handlePaymentSuccess(), 2000);
          break;
      }
    } else if (isNo) {
      await speakFast("No problem, let's try again.");
      
      // Reset the specific field
      switch (confirmationType) {
        case 'address':
          setSelectedAddressIndex(-1);
          setCheckoutData(prev => ({ ...prev, address: '' }));
          break;
        case 'paymentMethod':
          setCheckoutData(prev => ({ ...prev, paymentMethod: '' }));
          break;
        case 'upiAddress':
          setPaymentDetails(prev => ({ ...prev, upiAddress: '' }));
          break;
        case 'cardHolderName':
          setPaymentDetails(prev => ({ ...prev, cardHolderName: '' }));
          break;
        case 'cardNumber':
          setPaymentDetails(prev => ({ ...prev, cardNumber: '' }));
          break;
        case 'cvv':
          setPaymentDetails(prev => ({ ...prev, cvv: '' }));
          break;
        case 'finalOtp':
          setCheckoutData(prev => ({ ...prev, otp: '' }));
          break;
      }
      
      await speakStepInstructions(currentStep);
      setTimeout(() => {
        setIsProcessing(true);
        startListening();
      }, 400);
    } else {
      await speakFast("Please say yes to confirm or no to try again.");
      setAwaitingConfirmation(true);
      setTimeout(() => {
        setIsProcessing(true);
        startListening();
      }, 400);
    }
    
    setConfirmationType('');
  };

  const speakStepInstructions = async (step: number) => {
    switch (step) {
      case 1:
        await speakFast("Say 'yes' or 'ready' to proceed with checkout.");
        break;
      case 2:
        await speakFast("Please say 'address 1', 'address 2', or 'address 3' to select your delivery address.");
        break;
      case 3:
        await speakFast("Please say your payment method: UPI, Card, or Cash on Delivery.");
        break;
      case 4:
        if (checkoutData.paymentMethod === 'UPI') {
          if (!paymentDetails.upiAddress) {
            await speakFast("Please tell me your UPI address or UPI ID.");
          }
        } else if (checkoutData.paymentMethod === 'Card') {
          if (!paymentDetails.cardHolderName) {
            await speakFast("Please tell me the card holder's full name.");
          } else if (!paymentDetails.cardNumber) {
            await speakFast("Please tell me your 16-digit card number.");
          } else if (!paymentDetails.cvv) {
            await speakFast("Please tell me the CVV from the back of your card.");
          }
        }
        break;
      case 5:
        await speakFast("Please tell me the OTP sent to your registered mobile number.");
        break;
    }
  };

  const handlePaymentSuccess = () => {
    // Cancel any ongoing speech before navigating
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
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
    // Cancel speech when switching to manual mode
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setVoiceMode(false);
    speakFast("Switched to manual mode. You can now click to select options.");
  };

  const handleAddressSelect = (index: number) => {
    setSelectedAddressIndex(index);
    setCheckoutData(prev => ({ ...prev, address: savedAddresses[index] }));
  };

  const progressValue = (currentStep / 5) * 100;

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
          <p className="text-sm text-gray-600 mt-2 text-center">Step {currentStep} of 5</p>
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
                selectedAddressIndex={selectedAddressIndex}
                onAddressChange={(address) => setCheckoutData(prev => ({ ...prev, address }))}
                onAddressSelect={handleAddressSelect}
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
                onContinue={() => {
                  if (checkoutData.paymentMethod === 'Cash on Delivery') {
                    handlePaymentSuccess();
                  } else {
                    setCurrentStep(4);
                  }
                }}
              />
            )}

            {/* Step 4: Payment Details */}
            {currentStep === 4 && checkoutData.paymentMethod === 'Card' && (
              <CardPaymentForm
                voiceMode={voiceMode}
                isListening={isListening}
                isProcessing={isProcessing}
                paymentDetails={paymentDetails}
                onPaymentDetailsChange={setPaymentDetails}
                onContinue={() => setCurrentStep(5)}
                onSwitchToManual={switchToManualMode}
              />
            )}

            {currentStep === 4 && checkoutData.paymentMethod === 'UPI' && (
              <UPIPaymentForm
                voiceMode={voiceMode}
                isListening={isListening}
                isProcessing={isProcessing}
                paymentDetails={paymentDetails}
                onPaymentDetailsChange={setPaymentDetails}
                onContinue={() => setCurrentStep(5)}
                onSwitchToManual={switchToManualMode}
              />
            )}

            {/* Step 5: OTP Verification (skip for COD) */}
            {currentStep === 5 && checkoutData.paymentMethod !== 'Cash on Delivery' && (
              <OTPVerificationForm
                voiceMode={voiceMode}
                isListening={isListening}
                isProcessing={isProcessing}
                otp={checkoutData.otp}
                paymentMethod={checkoutData.paymentMethod}
                onOtpChange={(otp) => setCheckoutData(prev => ({ ...prev, otp }))}
                onCompleteOrder={handlePaymentSuccess}
                onSwitchToManual={switchToManualMode}
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
