
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Shield, CheckCircle, Mic, MicOff, Volume2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useVoice } from '@/hooks/useVoice';
import { CheckoutData } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

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
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Voice functionality
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

  // Auto-start voice checkout when component mounts
  useEffect(() => {
    if (!hasStarted && voiceMode && cartItems.length > 0) {
      setHasStarted(true);
      startVoiceCheckout();
    }
  }, [hasStarted, voiceMode, cartItems.length]);

  const startVoiceCheckout = async () => {
    await speak("Welcome to VoicePay checkout! I'll guide you through three simple steps. First, please tell me your complete delivery address including street, city, and postal code.");
    setTimeout(() => {
      setIsProcessing(true);
      listen();
    }, 2000);
  };

  const handleVoiceInput = async (transcript: string) => {
    const lowerTranscript = transcript.toLowerCase().trim();
    console.log('Voice input received:', transcript);
    
    // Handle special commands
    if (lowerTranscript.includes('repeat') || lowerTranscript.includes('say again')) {
      await speakStepInstructions(currentStep);
      setTimeout(() => listen(), 1000);
      return;
    }
    
    if (lowerTranscript.includes('help')) {
      await speak("You can say 'repeat' to hear instructions again, 'manual mode' to switch to typing, or simply follow the prompts for each step.");
      setTimeout(() => listen(), 1000);
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
        await handleAddressInput(transcript);
        break;
      case 2:
        await handlePaymentMethodInput(lowerTranscript);
        break;
      case 3:
        await handleVerificationInput(lowerTranscript, transcript);
        break;
    }
  };

  const handleAddressInput = async (transcript: string) => {
    setCheckoutData(prev => ({ ...prev, address: transcript }));
    await speak(`I heard your address as: ${transcript}. Is this correct? Say yes to confirm or no to try again.`);
    setAwaitingConfirmation(true);
    setTimeout(() => listen(), 1000);
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
      await speak(`You selected ${paymentMethod}. Is this correct? Say yes to confirm or no to try again.`);
      setAwaitingConfirmation(true);
      setTimeout(() => listen(), 1000);
    } else {
      await speak("I didn't understand. Please say UPI, Card, or Cash on Delivery clearly.");
      setTimeout(() => listen(), 1000);
    }
  };

  const handleVerificationInput = async (lowerTranscript: string, transcript: string) => {
    if (checkoutData.paymentMethod === 'UPI') {
      const otp = transcript.replace(/\D/g, '');
      if (otp.length >= 4) {
        setCheckoutData(prev => ({ ...prev, otp }));
        await speak(`You said OTP ${otp.split('').join(' ')}. Is this correct? Say yes to proceed or no to try again.`);
        setAwaitingConfirmation(true);
        setTimeout(() => listen(), 1000);
      } else {
        await speak("Please say your OTP clearly. I need at least 4 digits.");
        setTimeout(() => listen(), 1000);
      }
    } else {
      if (lowerTranscript.includes('confirm voicepay') || lowerTranscript.includes('confirm voice pay')) {
        setCheckoutData(prev => ({ ...prev, voiceConfirmed: true }));
        await speak("Voice verification successful! Processing your payment now.");
        setTimeout(() => handlePaymentSuccess(), 2000);
      } else {
        await speak("For security, please say exactly 'Confirm VoicePay' to complete your order.");
        setTimeout(() => listen(), 1000);
      }
    }
  };

  const handleConfirmation = async (lowerTranscript: string) => {
    setAwaitingConfirmation(false);
    
    if (lowerTranscript.includes('yes') || lowerTranscript.includes('yeah') || lowerTranscript.includes('correct') || lowerTranscript.includes('confirm')) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
        await progressToNextStep(currentStep + 1);
      } else {
        if (checkoutData.paymentMethod === 'UPI') {
          await speak("Perfect! Processing your UPI payment now.");
          setTimeout(() => handlePaymentSuccess(), 2000);
        } else {
          await speak("Excellent! Your order is being processed.");
          setTimeout(() => handlePaymentSuccess(), 2000);
        }
      }
    } else if (lowerTranscript.includes('no') || lowerTranscript.includes('nope') || lowerTranscript.includes('wrong')) {
      await speak("No problem, let's try again.");
      await speakStepInstructions(currentStep);
      setTimeout(() => listen(), 1000);
    } else {
      await speak("Please say yes to confirm or no to try again.");
      setTimeout(() => listen(), 1000);
    }
  };

  const progressToNextStep = async (step: number) => {
    switch (step) {
      case 2:
        await speak("Great! Now for step 2: Please tell me your payment method. Say UPI, Card, or Cash on Delivery.");
        setTimeout(() => listen(), 2000);
        break;
      case 3:
        if (checkoutData.paymentMethod === 'UPI') {
          await speak("Final step! Please tell me your UPI OTP for payment verification.");
        } else {
          await speak("Final step! For voice verification, please say exactly 'Confirm VoicePay' to complete your order.");
        }
        setTimeout(() => listen(), 2000);
        break;
    }
  };

  const speakStepInstructions = async (step: number) => {
    switch (step) {
      case 1:
        await speak("Please speak your complete delivery address including street, city, and postal code.");
        break;
      case 2:
        await speak("Please say your payment method: UPI, Card, or Cash on Delivery.");
        break;
      case 3:
        if (checkoutData.paymentMethod === 'UPI') {
          await speak("Please tell me your OTP for UPI payment verification.");
        } else {
          await speak("For voice verification security, please say exactly 'Confirm VoicePay'.");
        }
        break;
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    navigate('/success', { 
      state: { 
        orderData: checkoutData,
        total: getTotalPrice(),
        items: cartItems
      }
    });
  };

  const switchToManualMode = () => {
    setVoiceMode(false);
    speak("Switched to manual mode. You can now type your information.");
  };

  const progressValue = (currentStep / 3) * 100;

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {voiceMode ? '🎙️ Voice Checkout' : 'Manual Checkout'}
          </h1>
          <Progress value={progressValue} className="h-3" />
          <p className="text-sm text-gray-600 mt-2">Step {currentStep} of 3</p>
          
          {voiceMode && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <div className="flex items-center gap-2 mb-2">
                {isListening ? (
                  <>
                    <MicOff className="h-5 w-5 text-red-500 animate-pulse" />
                    <span className="text-blue-800 font-medium">Listening...</span>
                  </>
                ) : isProcessing ? (
                  <>
                    <Volume2 className="h-5 w-5 text-orange-500" />
                    <span className="text-blue-800 font-medium">Speaking...</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5 text-blue-500" />
                    <span className="text-blue-800 font-medium">Voice Mode Active</span>
                  </>
                )}
              </div>
              <p className="text-sm text-blue-700">
                Say "repeat" to hear instructions again, "help" for commands, or "manual mode" to switch to typing.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Step 1: Delivery Address */}
            {currentStep === 1 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-6 w-6 text-orange-500" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {voiceMode ? (
                    <div className="space-y-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-green-800 font-medium">🎙️ Voice input active</p>
                        <p className="text-sm text-green-700 mt-1">
                          Speak your complete delivery address now
                        </p>
                      </div>
                      {checkoutData.address && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <Label className="text-sm text-gray-600">Captured Address:</Label>
                          <p className="font-medium">{checkoutData.address}</p>
                        </div>
                      )}
                      <Button
                        onClick={switchToManualMode}
                        variant="outline"
                        className="w-full"
                      >
                        Switch to Manual Typing
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Label htmlFor="address">Delivery Address</Label>
                      <Input
                        id="address"
                        value={checkoutData.address}
                        onChange={(e) => setCheckoutData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Enter your complete delivery address"
                      />
                      {checkoutData.address && (
                        <Button 
                          onClick={() => setCurrentStep(2)}
                          className="w-full bg-orange-500 hover:bg-orange-600"
                        >
                          Continue to Payment Method
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-6 w-6 text-orange-500" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {voiceMode ? (
                    <div className="space-y-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-green-800 font-medium">🎙️ Voice input active</p>
                        <p className="text-sm text-green-700 mt-1">
                          Say "UPI", "Card", or "Cash on Delivery"
                        </p>
                      </div>
                      {checkoutData.paymentMethod && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <Label className="text-sm text-gray-600">Selected Method:</Label>
                          <p className="font-medium">{checkoutData.paymentMethod}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {['UPI', 'Card', 'Cash on Delivery'].map((method) => (
                        <Button
                          key={method}
                          variant={checkoutData.paymentMethod === method ? 'default' : 'outline'}
                          onClick={() => setCheckoutData(prev => ({ ...prev, paymentMethod: method as any }))}
                          className={`justify-start p-4 h-auto ${
                            checkoutData.paymentMethod === method 
                              ? 'bg-orange-500 hover:bg-orange-600' 
                              : 'hover:bg-orange-50'
                          }`}
                        >
                          {method}
                        </Button>
                      ))}
                      {checkoutData.paymentMethod && (
                        <Button 
                          onClick={() => setCurrentStep(3)}
                          className="w-full bg-orange-500 hover:bg-orange-600"
                        >
                          Continue to Verification
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 3: Verification */}
            {currentStep === 3 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-orange-500" />
                    {checkoutData.paymentMethod === 'UPI' ? 'OTP Verification' : 'Voice Verification'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {voiceMode ? (
                    <div className="space-y-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-green-800 font-medium">🎙️ Voice input active</p>
                        <p className="text-sm text-green-700 mt-1">
                          {checkoutData.paymentMethod === 'UPI' 
                            ? 'Speak your OTP numbers clearly'
                            : 'Say "Confirm VoicePay" for verification'
                          }
                        </p>
                      </div>
                      {checkoutData.paymentMethod === 'UPI' && checkoutData.otp && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <Label className="text-sm text-gray-600">Captured OTP:</Label>
                          <p className="font-medium font-mono">{checkoutData.otp}</p>
                        </div>
                      )}
                      {checkoutData.voiceConfirmed && (
                        <div className="flex items-center gap-2 text-green-600 p-4 bg-green-50 rounded-lg">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">Voice verification successful!</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {checkoutData.paymentMethod === 'UPI' ? (
                        <div>
                          <Label htmlFor="otp">Enter OTP</Label>
                          <Input
                            id="otp"
                            value={checkoutData.otp}
                            onChange={(e) => setCheckoutData(prev => ({ ...prev, otp: e.target.value }))}
                            placeholder="Enter your OTP"
                            className="mt-1"
                          />
                        </div>
                      ) : (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            Click the button below to complete voice verification
                          </p>
                          <Button
                            onClick={() => setCheckoutData(prev => ({ ...prev, voiceConfirmed: true }))}
                            className="mt-3 bg-green-500 hover:bg-green-600"
                          >
                            Complete Voice Verification
                          </Button>
                        </div>
                      )}
                      
                      {((checkoutData.paymentMethod === 'UPI' && checkoutData.otp) || 
                        (checkoutData.paymentMethod !== 'UPI' && checkoutData.voiceConfirmed)) && (
                        <Button 
                          onClick={handlePaymentSuccess}
                          className="w-full bg-green-500 hover:bg-green-600"
                        >
                          Complete Order
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.title} x {item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <hr />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-orange-600">${getTotalPrice().toFixed(2)}</span>
                </div>
                
                <div className="space-y-2 pt-4">
                  <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Address {currentStep > 1 ? '✓' : ''}</span>
                  </div>
                  <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Payment Method {currentStep > 2 ? '✓' : ''}</span>
                  </div>
                  <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Verification</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
