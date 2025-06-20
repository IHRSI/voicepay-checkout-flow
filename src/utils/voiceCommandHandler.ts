
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
  console.log(`Processing voice command: "${transcript}" at step ${currentStep}`);
  
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

  // Global cancellation command
  if (transcript.includes('cancel') || transcript.includes('रद्द') || transcript.includes('कैंसल')) {
    speak(isHindi ? 'खरीदारी रद्द की जा रही है।' : 'Purchase being cancelled.');
    setTimeout(() => window.location.href = '/cart', 1000);
    return;
  }

  // Continue/Next commands - Auto proceed to next step
  if (transcript.includes('continue') || transcript.includes('next') || transcript.includes('आगे') || transcript.includes('जारी') || transcript.includes('अगला')) {
    if (currentStep === 1) {
      speak(isHindi ? 'पता चुनने के लिए आगे बढ़ रहे हैं।' : 'Moving to address selection.');
      setTimeout(() => setCurrentStep(2), 1000);
    } else if (currentStep === 2 && selectedAddressIndex >= 0) {
      speak(isHindi ? 'ऑफर्स देखने के लिए अगले चरण पर जा रहे हैं।' : 'Moving to offers section.');
      setTimeout(() => setCurrentStep(3), 1000);
    } else if (currentStep === 3) {
      speak(isHindi ? 'भुगतान विधि चुनने के लिए आगे बढ़ रहे हैं।' : 'Moving to payment method selection.');
      setTimeout(() => setCurrentStep(4), 1000);
    } else if (currentStep === 4 && paymentMethod) {
      speak(isHindi ? 'भुगतान विवरण के लिए आगे बढ़ रहे हैं।' : 'Moving to payment details.');
      setTimeout(() => setCurrentStep(5), 1000);
    } else if (currentStep === 5 && paymentMethod === 'Cash on Delivery') {
      speak(isHindi ? 'ऑर्डर पूरा हो रहा है।' : 'Completing your order.');
      setTimeout(() => {
        const event = new CustomEvent('completeOrder');
        window.dispatchEvent(event);
      }, 1000);
    } else if (currentStep === 5 && (paymentMethod === 'UPI' || paymentMethod === 'Card')) {
      speak(isHindi ? 'OTP सत्यापन के लिए आगे बढ़ रहे हैं।' : 'Moving to OTP verification.');
      setTimeout(() => setCurrentStep(6), 1000);
    }
    return;
  }

  // Step-specific commands
  switch (currentStep) {
    case 2: // Address selection
      if (transcript.includes('address 1') || transcript.includes('पता 1') || transcript.includes('पहला') || transcript.includes('first') || transcript.includes('1')) {
        setSelectedAddressIndex(0);
        speak(isHindi ? 'पहला पता चुना गया। ऑफर्स के लिए आगे बढ़ रहे हैं।' : 'First address selected. Moving to offers.');
        setTimeout(() => setCurrentStep(3), 1500);
      } else if (transcript.includes('address 2') || transcript.includes('पता 2') || transcript.includes('दूसरा') || transcript.includes('second') || transcript.includes('2')) {
        setSelectedAddressIndex(1);
        speak(isHindi ? 'दूसरा पता चुना गया। ऑफर्स के लिए आगे बढ़ रहे हैं।' : 'Second address selected. Moving to offers.');
        setTimeout(() => setCurrentStep(3), 1500);
      } else if (transcript.includes('address 3') || transcript.includes('पता 3') || transcript.includes('तीसरा') || transcript.includes('third') || transcript.includes('3')) {
        setSelectedAddressIndex(2);
        speak(isHindi ? 'तीसरा पता चुना गया। ऑफर्स के लिए आगे बढ़ रहे हैं।' : 'Third address selected. Moving to offers.');
        setTimeout(() => setCurrentStep(3), 1500);
      }
      break;

    case 3: // Offers selection
      if (transcript.includes('offer 1') || transcript.includes('ऑफर 1') || transcript.includes('पहला') || transcript.includes('first') || transcript.includes('1')) {
        speak(isHindi ? 'पहला ऑफर लागू किया गया। भुगतान विधि पर जा रहे हैं।' : 'First offer applied. Moving to payment method.');
        setTimeout(() => setCurrentStep(4), 1500);
      } else if (transcript.includes('offer 2') || transcript.includes('ऑफर 2') || transcript.includes('दूसरा') || transcript.includes('second') || transcript.includes('2')) {
        speak(isHindi ? 'दूसरा ऑफर लागू किया गया। भुगतान विधि पर जा रहे हैं।' : 'Second offer applied. Moving to payment method.');
        setTimeout(() => setCurrentStep(4), 1500);
      } else if (transcript.includes('skip') || transcript.includes('छोड़') || transcript.includes('no offer') || transcript.includes('कोई ऑफर नहीं')) {
        speak(isHindi ? 'ऑफर छोड़ा गया। भुगतान विधि पर जा रहे हैं।' : 'Offers skipped. Moving to payment method.');
        setTimeout(() => setCurrentStep(4), 1500);
      }
      break;

    case 4: // Payment method selection
      if (transcript.includes('upi') || transcript.includes('यूपीआई')) {
        setPaymentMethod('UPI');
        speak(isHindi ? 'UPI चुना गया। अपना UPI पता बोलें।' : 'UPI selected. Please speak your UPI address.');
        setTimeout(() => setCurrentStep(5), 1500);
      } else if (transcript.includes('card') || transcript.includes('कार्ड')) {
        setPaymentMethod('Card');
        speak(isHindi ? 'कार्ड चुना गया। कार्डधारक का नाम बोलें।' : 'Card selected. Please speak cardholder name.');
        setTimeout(() => setCurrentStep(5), 1500);
      } else if (transcript.includes('cash') || transcript.includes('cod') || transcript.includes('कैश') || transcript.includes('डिलीवरी पर भुगतान')) {
        setPaymentMethod('Cash on Delivery');
        speak(isHindi ? 'कैश ऑन डिलीवरी चुना गया। ऑर्डर पूरा करने के लिए confirm कहें।' : 'Cash on Delivery selected. Say confirm to complete order.');
        setTimeout(() => setCurrentStep(5), 1500);
      }
      break;
      
    case 5: // Payment details
      if (paymentMethod === 'UPI') {
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
          setTimeout(() => setCurrentStep(6), 1500);
        } else {
          speak(isHindi ? 'UPI पता स्पष्ट नहीं मिला। कृपया फिर से बोलें।' : 'UPI address not clear. Please speak again.');
        }
      } 
      
      else if (paymentMethod === 'Card') {
        const numbers = transcript.match(/\d+/g);
        
        // Sequential card details collection
        if (!paymentDetails.cardHolderName && !transcript.match(/\d/)) {
          const nameWords = transcript.replace(/card holder|name|नाम|कार्ड धारक/gi, '').trim();
          if (nameWords.length > 2) {
            setPaymentDetails(prev => ({ ...prev, cardHolderName: nameWords }));
            speak(isHindi ? 'कार्डधारक का नाम सेव किया गया। अब कार्ड नंबर बोलें।' : 'Cardholder name saved. Now speak card number.');
          }
        }
        
        else if (numbers && !paymentDetails.cardNumber) {
          const cardNumber = numbers.join('').replace(/\s/g, '');
          if (cardNumber.length === 16) {
            setPaymentDetails(prev => ({ ...prev, cardNumber: cardNumber }));
            speak(isHindi ? 'कार्ड नंबर सेव किया गया। अब CVV बोलें।' : 'Card number saved. Now speak CVV.');
          }
        }
        
        else if (numbers && paymentDetails.cardNumber && !paymentDetails.cvv) {
          const cvv = numbers.join('');
          if (cvv.length === 3 || cvv.length === 4) {
            setPaymentDetails(prev => ({ ...prev, cvv: cvv }));
            speak(isHindi ? 'CVV सेव किया गया। OTP के लिए अगले चरण पर जा रहे हैं।' : 'CVV saved. Moving to OTP verification.');
            setTimeout(() => setCurrentStep(6), 1500);
          }
        }
      }
      
      else if (paymentMethod === 'Cash on Delivery') {
        if (transcript.includes('confirm') || transcript.includes('पुष्टि') || transcript.includes('complete') || transcript.includes('पूरा')) {
          speak(isHindi ? 'कैश ऑन डिलीवरी ऑर्डर पूरा हो रहा है। धन्यवाद!' : 'Cash on Delivery order completing. Thank you!');
          setTimeout(() => {
            const event = new CustomEvent('completeOrder');
            window.dispatchEvent(event);
          }, 1000);
        }
      }
      break;
  
    case 6: // OTP verification
      const numbers = transcript.match(/\d+/g);
      if (numbers) {
        const otpValue = numbers.join('');
        if (otpValue.length >= 4 && otpValue.length <= 6) {
          setOtp(otpValue);
          speak(isHindi ? `OTP ${otpValue} सेव किया गया। confirm कहकर ऑर्डर पूरा करें।` : `OTP ${otpValue} saved. Say confirm to complete order.`);
        }
      }
      
      // Order confirmation
      if (transcript.includes('confirm') || transcript.includes('पुष्टि') || transcript.includes('complete') || transcript.includes('पूरा')) {
        speak(isHindi ? 'ऑर्डर पूरा हो रहा है। धन्यवाद!' : 'Completing your order. Thank you!');
        setTimeout(() => {
          const event = new CustomEvent('completeOrder');
          window.dispatchEvent(event);
        }, 1000);
      }
      break;
  }
};
