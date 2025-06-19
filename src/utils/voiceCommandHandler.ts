
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
  selectedAddressIndex: number;
  setSelectedAddressIndex: (index: number) => void;
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
  speak,
  selectedAddressIndex,
  setSelectedAddressIndex
}: VoiceCommandHandlerProps) => {
  const isHindi = language === 'hi';
  
  // Global navigation commands
  if (transcript.includes('home') || transcript.includes('होम')) {
    speak(isHindi ? 'होम पेज पर जा रहे हैं।' : 'Going to home page.');
    setTimeout(() => window.location.href = '/', 1000);
    return;
  }
  
  if (transcript.includes('cart') || transcript.includes('कार्ट')) {
    speak(isHindi ? 'कार्ट पेज पर जा रहे हैं।' : 'Going to cart page.');
    setTimeout(() => window.location.href = '/cart', 1000);
    return;
  }

  if (transcript.includes('about') || transcript.includes('हमारे बारे')) {
    speak(isHindi ? 'अबाउट पेज पर जा रहे हैं।' : 'Going to about page.');
    setTimeout(() => window.location.href = '/about', 1000);
    return;
  }

  // Global cancellation command
  if (transcript.includes('cancel purchase') || transcript.includes('लेनदेन रद्द') || transcript.includes('खरीदारी रद्द') || transcript.includes('कैंसल')) {
    speak(isHindi ? 'खरीदारी रद्द की जा रही है। कार्ट पेज पर जा रहे हैं।' : 'Purchase being cancelled. Going to cart page.');
    setTimeout(() => window.location.href = '/cart', 1000);
    return;
  }

  // Continue command
  if (transcript.includes('continue') || transcript.includes('आगे') || transcript.includes('जारी')) {
    if (currentStep === 2 && selectedAddressIndex >= 0) {
      speak(isHindi ? 'अगले चरण पर जा रहे हैं।' : 'Moving to next step.');
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
      speak(isHindi ? 'भुगतान विधि चुनें।' : 'Choose payment method.');
    }
    return;
  }

  // Address selection (Step 2)
  if (currentStep === 2) {
    if (transcript.includes('address 1') || transcript.includes('पता 1') || transcript.includes('पहला')) {
      setSelectedAddressIndex(0);
      speak(isHindi ? 'पहला पता चुना गया। आगे बढ़ने के लिए continue कहें।' : 'First address selected. Say continue to proceed.');
    } else if (transcript.includes('address 2') || transcript.includes('पता 2') || transcript.includes('दूसरा')) {
      setSelectedAddressIndex(1);
      speak(isHindi ? 'दूसरा पता चुना गया। आगे बढ़ने के लिए continue कहें।' : 'Second address selected. Say continue to proceed.');
    } else if (transcript.includes('address 3') || transcript.includes('पता 3') || transcript.includes('तीसरा')) {
      setSelectedAddressIndex(2);
      speak(isHindi ? 'तीसरा पता चुना गया। आगे बढ़ने के लिए continue कहें।' : 'Third address selected. Say continue to proceed.');
    }
  }

  // Offers selection (Step 3)
  else if (currentStep === 3) {
    if (transcript.includes('offer 1') || transcript.includes('ऑफर 1') || transcript.includes('पहला ऑफर')) {
      speak(isHindi ? 'पहला ऑफर लागू किया गया। 10% छूट मिली।' : 'First offer applied. 10% discount received.');
      setCurrentStep(4);
    } else if (transcript.includes('offer 2') || transcript.includes('ऑफर 2') || transcript.includes('दूसरा ऑफर')) {
      speak(isHindi ? 'दूसरा ऑफर लागू किया गया। 15% छूट मिली।' : 'Second offer applied. 15% discount received.');
      setCurrentStep(4);
    } else if (transcript.includes('offer 3') || transcript.includes('ऑफर 3') || transcript.includes('तीसरा ऑफर')) {
      speak(isHindi ? 'तीसरा ऑफर लागू किया गया। ₹50 छूट मिली।' : 'Third offer applied. ₹50 discount received.');
      setCurrentStep(4);
    } else if (transcript.includes('offer 4') || transcript.includes('ऑफर 4') || transcript.includes('चौथा ऑफर')) {
      speak(isHindi ? 'चौथा ऑफर लागू किया गया। फ्री डिलीवरी मिली।' : 'Fourth offer applied. Free delivery received.');
      setCurrentStep(4);
    } else if (transcript.includes('skip') || transcript.includes('छोड़ें')) {
      speak(isHindi ? 'ऑफर छोड़ा गया। भुगतान विधि पर जा रहे हैं।' : 'Offers skipped. Moving to payment method.');
      setCurrentStep(4);
    }
  }

  // Payment method selection (Step 4)
  else if (currentStep === 4) {
    if (transcript.includes('upi') || transcript.includes('यूपीआई')) {
      setPaymentMethod('UPI');
      speak(isHindi ? 'UPI चुना गया। अब अपना UPI पता बोलें।' : 'UPI selected. Now speak your UPI address.');
      setCurrentStep(5);
    } else if (transcript.includes('card') || transcript.includes('कार्ड')) {
      setPaymentMethod('Card');
      speak(isHindi ? 'कार्ड चुना गया। अब अपने कार्ड की जानकारी बोलें।' : 'Card selected. Now speak your card details.');
      setCurrentStep(5);
    } else if (transcript.includes('cash') || transcript.includes('cod') || transcript.includes('कैश')) {
      setPaymentMethod('Cash on Delivery');
      speak(isHindi ? 'कैश ऑन डिलीवरी चुना गया। ऑर्डर पूरा करने के लिए confirm कहें।' : 'Cash on Delivery selected. Say confirm to complete order.');
      setCurrentStep(5);
    }
  }
  
  // Payment details (Step 5)
  else if (currentStep === 5) {
    if (paymentMethod === 'UPI' && !paymentDetails.upiAddress) {
      // Enhanced UPI address extraction
      const upiPatterns = [
        /[\w\.-]+@[\w\.-]+/,
        /\d{10}@[\w\.-]+/,
        /[\w]+@(paytm|phonepe|googlepay|bhim|upi)/i
      ];
      
      let upiMatch = null;
      for (const pattern of upiPatterns) {
        upiMatch = transcript.match(pattern);
        if (upiMatch) break;
      }
      
      if (upiMatch) {
        setPaymentDetails(prev => ({ ...prev, upiAddress: upiMatch[0] }));
        speak(isHindi ? 'UPI पता सेव किया गया। OTP के लिए अगले चरण पर जा रहे हैं।' : 'UPI address saved. Moving to OTP verification.');
        setTimeout(() => setCurrentStep(6), 1000);
      } else {
        speak(isHindi ? 'कृपया अपना UPI पता फिर से स्पष्ट रूप से बोलें।' : 'Please speak your UPI address again clearly.');
      }
    } else if (paymentMethod === 'Card') {
      // Enhanced card details handling
      const numbers = transcript.match(/\d+/g);
      if (numbers && numbers.length > 0) {
        const allNumbers = numbers.join('');
        
        if (allNumbers.length === 16 && !paymentDetails.cardNumber) {
          setPaymentDetails(prev => ({ ...prev, cardNumber: allNumbers }));
          speak(isHindi ? 'कार्ड नंबर सेव किया गया। अब CVV बोलें।' : 'Card number saved. Now speak your CVV.');
        } else if (allNumbers.length === 3 && paymentDetails.cardNumber && !paymentDetails.cvv) {
          setPaymentDetails(prev => ({ ...prev, cvv: allNumbers }));
          speak(isHindi ? 'CVV सेव किया गया। OTP के लिए अगले चरण पर जा रहे हैं।' : 'CVV saved. Moving to OTP verification.');
          setTimeout(() => setCurrentStep(6), 1000);
        }
      }
      
      // Handle cardholder name
      if (!paymentDetails.cardHolderName && !transcript.match(/\d/)) {
        const nameWords = transcript.replace(/card holder|name|नाम|कार्ड धारक/gi, '').trim();
        if (nameWords.length > 2) {
          setPaymentDetails(prev => ({ ...prev, cardHolderName: nameWords }));
          speak(isHindi ? 'कार्डधारक का नाम सेव किया गया।' : 'Cardholder name saved.');
        }
      }
    }
  }
  
  // OTP input (Step 6)
  else if (currentStep === 6) {
    // Enhanced OTP extraction for both languages
    const numbers = transcript.match(/\d+/g);
    if (numbers) {
      const otpValue = numbers.join('');
      if (otpValue.length >= 4 && otpValue.length <= 6) {
        setOtp(otpValue);
        speak(isHindi ? `OTP ${otpValue} सेव किया गया। ऑर्डर पूरा करने के लिए confirm कहें।` : `OTP ${otpValue} saved. Say confirm to complete order.`);
      }
    }
    
    // Handle word-to-number conversion for Hindi
    if (isHindi) {
      const hindiNumbers: { [key: string]: string } = {
        'शून्य': '0', 'एक': '1', 'दो': '2', 'तीन': '3', 'चार': '4',
        'पांच': '5', 'छह': '6', 'सात': '7', 'आठ': '8', 'नौ': '9'
      };
      
      let otpFromWords = '';
      const words = transcript.split(' ');
      for (const word of words) {
        if (hindiNumbers[word.trim()]) {
          otpFromWords += hindiNumbers[word.trim()];
        }
      }
      
      if (otpFromWords.length >= 4 && otpFromWords.length <= 6) {
        setOtp(otpFromWords);
        speak(`OTP ${otpFromWords} सेव किया गया। ऑर्डर पूरा करने के लिए confirm कहें।`);
      }
    }
  }
};
