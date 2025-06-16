
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Shield, CheckCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useVoice } from '@/hooks/useVoice';
import { CheckoutData } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import VoiceButton from '@/components/VoiceButton';
import { useToast } from '@/hooks/use-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    address: '',
    paymentMethod: '',
    otp: '',
    voiceConfirmed: false
  });
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  // Voice functionality
  const { isListening, speak, listen } = useVoice({
    onResult: (transcript) => handleVoiceInput(transcript),
    onError: (error) => {
      toast({
        title: "Voice Error",
        description: error,
        variant: "destructive",
      });
    }
  });

  const handleVoiceInput = async (transcript: string) => {
    const lowerTranscript = transcript.toLowerCase().trim();
    
    if (awaitingConfirmation) {
      if (lowerTranscript.includes('yes') || lowerTranscript.includes('yeah') || lowerTranscript.includes('confirm')) {
        await handleConfirmation(true);
      } else if (lowerTranscript.includes('no') || lowerTranscript.includes('nope')) {
        await handleConfirmation(false);
      } else {
        await speak("Please say yes to confirm or no to try again.");
      }
      return;
    }

    switch (currentStep) {
      case 1:
        setCheckoutData(prev => ({ ...prev, address: transcript }));
        await speak(`I heard: ${transcript}. Is this address correct? Say yes to confirm or no to try again.`);
        setAwaitingConfirmation(true);
        break;
      
      case 2:
        let paymentMethod: 'UPI' | 'Card' | 'Cash on Delivery' | '' = '';
        if (lowerTranscript.includes('upi')) {
          paymentMethod = 'UPI';
        } else if (lowerTranscript.includes('card')) {
          paymentMethod = 'Card';
        } else if (lowerTranscript.includes('cash')) {
          paymentMethod = 'Cash on Delivery';
        }
        
        if (paymentMethod) {
          setCheckoutData(prev => ({ ...prev, paymentMethod }));
          await speak(`You selected ${paymentMethod}. Is this correct? Say yes to confirm or no to try again.`);
          setAwaitingConfirmation(true);
        } else {
          await speak("Please say UPI, Card, or Cash on Delivery.");
        }
        break;
      
      case 3:
        if (checkoutData.paymentMethod === 'UPI') {
          // Extract numbers from transcript for OTP
          const otp = transcript.replace(/\D/g, '');
          if (otp.length >= 4) {
            setCheckoutData(prev => ({ ...prev, otp }));
            await speak(`You said OTP ${otp}. Should I proceed? Say yes to confirm or no to try again.`);
            setAwaitingConfirmation(true);
          } else {
            await speak("Please say your OTP clearly. I need at least 4 digits.");
          }
        } else {
          // Voice verification for final confirmation
          if (lowerTranscript.includes('confirm voicepay') || lowerTranscript.includes('confirm voice pay')) {
            setCheckoutData(prev => ({ ...prev, voiceConfirmed: true }));
            await speak("Voice verification successful. Proceeding with payment.");
            setTimeout(() => handlePaymentSuccess(), 2000);
          } else {
            await speak("Please say 'Confirm VoicePay' for voice verification.");
          }
        }
        break;
    }
  };

  const handleConfirmation = async (confirmed: boolean) => {
    setAwaitingConfirmation(false);
    
    if (confirmed) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
        await speakStepInstructions(currentStep + 1);
      } else {
        if (checkoutData.paymentMethod === 'UPI') {
          await speak("Please say 'Confirm VoicePay' to complete the voice verification.");
        } else {
          handlePaymentSuccess();
        }
      }
    } else {
      await speakStepInstructions(currentStep);
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
          await speak("Please tell me your OTP for UPI payment.");
        } else {
          await speak("For voice verification, please say 'Confirm VoicePay' to complete your order.");
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

  const progressValue = (currentStep / 3) * 100;

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Voice Checkout</h1>
          <Progress value={progressValue} className="h-3" />
          <p className="text-sm text-gray-600 mt-2">Step {currentStep} of 3</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Steps */}
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
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      🎙️ Use voice input for hands-free checkout or type manually
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <VoiceButton
                      isListening={isListening}
                      onClick={() => {
                        if (!isListening) {
                          speakStepInstructions(1);
                          setTimeout(() => listen(), 1000);
                        }
                      }}
                      className="flex-shrink-0"
                    />
                    <div className="flex-1">
                      <Label htmlFor="address">Delivery Address</Label>
                      <Input
                        id="address"
                        value={checkoutData.address}
                        onChange={(e) => setCheckoutData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Enter your complete delivery address"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  {checkoutData.address && (
                    <Button 
                      onClick={() => setCurrentStep(2)}
                      className="w-full bg-orange-500 hover:bg-orange-600"
                    >
                      Continue to Payment Method
                    </Button>
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
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      🎙️ Say "UPI", "Card", or "Cash on Delivery"
                    </p>
                  </div>
                  
                  <VoiceButton
                    isListening={isListening}
                    onClick={() => {
                      if (!isListening) {
                        speakStepInstructions(2);
                        setTimeout(() => listen(), 1000);
                      }
                    }}
                  />
                  
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
                  </div>
                  
                  {checkoutData.paymentMethod && (
                    <Button 
                      onClick={() => setCurrentStep(3)}
                      className="w-full bg-orange-500 hover:bg-orange-600"
                    >
                      {checkoutData.paymentMethod === 'UPI' ? 'Continue to OTP' : 'Continue to Verification'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 3: OTP/Verification */}
            {currentStep === 3 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-orange-500" />
                    {checkoutData.paymentMethod === 'UPI' ? 'OTP Verification' : 'Voice Verification'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {checkoutData.paymentMethod === 'UPI' ? (
                    <>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-800">
                          🎙️ Say your OTP numbers clearly
                        </p>
                      </div>
                      
                      <div className="flex gap-3">
                        <VoiceButton
                          isListening={isListening}
                          onClick={() => {
                            if (!isListening) {
                              speakStepInstructions(3);
                              setTimeout(() => listen(), 1000);
                            }
                          }}
                          className="flex-shrink-0"
                        />
                        <div className="flex-1">
                          <Label htmlFor="otp">Enter OTP</Label>
                          <Input
                            id="otp"
                            value={checkoutData.otp}
                            onChange={(e) => setCheckoutData(prev => ({ ...prev, otp: e.target.value }))}
                            placeholder="Enter your OTP"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-800">
                          🎙️ Say "Confirm VoicePay" for voice verification
                        </p>
                      </div>
                      
                      <VoiceButton
                        isListening={isListening}
                        onClick={() => {
                          if (!isListening) {
                            speakStepInstructions(3);
                            setTimeout(() => listen(), 1000);
                          }
                        }}
                      />
                      
                      {checkoutData.voiceConfirmed && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          Voice verification successful!
                        </div>
                      )}
                    </>
                  )}
                  
                  {((checkoutData.paymentMethod === 'UPI' && checkoutData.otp) || 
                    (checkoutData.paymentMethod !== 'UPI')) && (
                    <Button 
                      onClick={handlePaymentSuccess}
                      className="w-full bg-green-500 hover:bg-green-600"
                    >
                      Complete Order
                    </Button>
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
                
                {/* Progress Indicators */}
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
