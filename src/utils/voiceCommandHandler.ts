
interface PaymentDetails {
  upiAddress: string;
  cardHolderName: string;
  cardNumber: string;
  cvv: string;
}

interface VoiceCommandHandlerProps {
  transcript: string;
  currentStep: number;
  paymentMethod: string;
  paymentDetails: PaymentDetails;
  language: string;
  setPaymentMethod: (method: string) => void;
  setPaymentDetails: (details: PaymentDetails | ((prev: PaymentDetails) => PaymentDetails)) => void;
  setOtp: (otp: string) => void;
  setCurrentStep: (step: number) => void;
  speak: (text: string) => void;
}

export const handleVoiceCommand = ({
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
}: VoiceCommandHandlerProps) => {
  // Global cancellation command
  if (transcript.includes('cancel purchase') || transcript.includes('लेनदेन रद्द') || transcript.includes('खरीदारी रद्द')) {
    speak(language === 'hi' ? 'खरीदारी रद्द की जा रही है।' : 'Purchase being cancelled.');
    return;
  }

  // Payment method selection (Step 4)
  if (currentStep === 4) {
    if (transcript.includes('upi') || transcript.includes('यूपीआई')) {
      setPaymentMethod('UPI');
      speak(language === 'hi' ? 'UPI चुना गया। अब अपना UPI address बोलें।' : 'UPI selected. Now speak your UPI address.');
      setCurrentStep(5);
    } else if (transcript.includes('card') || transcript.includes('कार्ड')) {
      setPaymentMethod('Card');
      speak(language === 'hi' ? 'कार्ड चुना गया। अब अपने कार्ड की जानकारी बोलें।' : 'Card selected. Now speak your card details.');
      setCurrentStep(5);
    } else if (transcript.includes('cash') || transcript.includes('cod') || transcript.includes('कैश')) {
      setPaymentMethod('Cash on Delivery');
      speak(language === 'hi' ? 'कैश ऑन डिलीवरी चुना गया।' : 'Cash on Delivery selected.');
      setCurrentStep(5);
    }
  }
  
  // Payment details (Step 5)
  else if (currentStep === 5) {
    if (paymentMethod === 'UPI' && !paymentDetails.upiAddress) {
      // Extract UPI address from speech
      const upiMatch = transcript.match(/[\w\.-]+@[\w\.-]+/);
      if (upiMatch) {
        setPaymentDetails(prev => ({ ...prev, upiAddress: upiMatch[0] }));
        speak(language === 'hi' ? 'UPI address सेव किया गया। OTP के लिए अगले step पर जाएं।' : 'UPI address saved. Proceed to next step for OTP.');
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
          speak(language === 'hi' ? 'CVV सेव किया गया। OTP के लिए अगले step पर जाएं।' : 'CVV saved. Proceed to next step for OTP.');
        }
      }
      
      // Handle cardholder name
      if (!paymentDetails.cardHolderName && !transcript.match(/\d/)) {
        const name = transcript.replace(/card holder|name|नाम/gi, '').trim();
        if (name.length > 2) {
          setPaymentDetails(prev => ({ ...prev, cardHolderName: name }));
          speak(language === 'hi' ? 'कार्डधारक का नाम सेव किया गया।' : 'Cardholder name saved.');
        }
      }
    }
  }
  
  // OTP input (Step 6)
  else if (currentStep === 6) {
    if (transcript.match(/\d+/)) {
      const otpMatch = transcript.match(/\d+/g);
      if (otpMatch) {
        const otpValue = otpMatch.join('');
        if (otpValue.length >= 4 && otpValue.length <= 6) {
          setOtp(otpValue);
          speak(language === 'hi' ? 'OTP सेव किया गया।' : 'OTP saved.');
        }
      }
    }
  }
};
