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
    setTimeout(() => window.location.href = '/', 500);
    return;
  }
  
  if (transcript.includes('cart') || transcript.includes('कार्ट')) {
    setTimeout(() => window.location.href = '/cart', 500);
    return;
  }

  // Global cancellation command
  if (transcript.includes('cancel') || transcript.includes('रद्द') || transcript.includes('कैंसल')) {
    setTimeout(() => window.location.href = '/cart', 500);
    return;
  }

  // Continue/Next commands - Auto proceed to next step
  if (transcript.includes('continue') || transcript.includes('next') || transcript.includes('आगे') || transcript.includes('जारी') || transcript.includes('अगला')) {
    if (currentStep === 1) {
      setTimeout(() => setCurrentStep(2), 500);
    } else if (currentStep === 2 && selectedAddressIndex >= 0) {
      setTimeout(() => setCurrentStep(3), 500);
    } else if (currentStep === 3) {
      setTimeout(() => setCurrentStep(4), 500);
    } else if (currentStep === 4 && paymentMethod) {
      setTimeout(() => setCurrentStep(5), 500);
    } else if (currentStep === 5 && paymentMethod === 'Cash on Delivery') {
      setTimeout(() => {
        const event = new CustomEvent('completeOrder');
        window.dispatchEvent(event);
      }, 500);
    } else if (currentStep === 5 && (paymentMethod === 'UPI' || paymentMethod === 'Card')) {
      setTimeout(() => setCurrentStep(6), 500);
    }
    return;
  }

  // Step-specific commands
  switch (currentStep) {
    case 2: // Address selection
      if (transcript.includes('address 1') || transcript.includes('पता 1') || transcript.includes('पहला') || transcript.includes('first') || transcript.includes('1')) {
        setSelectedAddressIndex(0);
        setTimeout(() => setCurrentStep(3), 1000);
      } else if (transcript.includes('address 2') || transcript.includes('पता 2') || transcript.includes('दूसरा') || transcript.includes('second') || transcript.includes('2')) {
        setSelectedAddressIndex(1);
        setTimeout(() => setCurrentStep(3), 1000);
      } else if (transcript.includes('address 3') || transcript.includes('पता 3') || transcript.includes('तीसरा') || transcript.includes('third') || transcript.includes('3')) {
        setSelectedAddressIndex(2);
        setTimeout(() => setCurrentStep(3), 1000);
      }
      break;

    case 3: // Offers selection
      if (transcript.includes('offer 1') || transcript.includes('ऑफर 1') || transcript.includes('पहला') || transcript.includes('first') || transcript.includes('1')) {
        setTimeout(() => setCurrentStep(4), 1000);
      } else if (transcript.includes('offer 2') || transcript.includes('ऑफर 2') || transcript.includes('दूसरा') || transcript.includes('second') || transcript.includes('2')) {
        setTimeout(() => setCurrentStep(4), 1000);
      } else if (transcript.includes('skip') || transcript.includes('छोड़') || transcript.includes('no offer') || transcript.includes('कोई ऑफर नहीं')) {
        setTimeout(() => setCurrentStep(4), 1000);
      }
      break;

    case 4: // Payment method selection
      if (transcript.includes('upi') || transcript.includes('यूपीआई')) {
        setPaymentMethod('UPI');
        setTimeout(() => setCurrentStep(5), 1000);
      } else if (transcript.includes('card') || transcript.includes('कार्ड')) {
        setPaymentMethod('Card');
        setTimeout(() => setCurrentStep(5), 1000);
      } else if (transcript.includes('cash') || transcript.includes('cod') || transcript.includes('कैश') || transcript.includes('डिलीवरी पर भुगतान')) {
        setPaymentMethod('Cash on Delivery');
        setTimeout(() => setCurrentStep(5), 1000);
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
          setTimeout(() => setCurrentStep(6), 1000);
        }
      } 
      
      else if (paymentMethod === 'Card') {
        const numbers = transcript.match(/\d+/g);
        
        // Sequential card details collection
        if (!paymentDetails.cardHolderName && !transcript.match(/\d/)) {
          const nameWords = transcript.replace(/card holder|name|नाम|कार्ड धारक/gi, '').trim();
          if (nameWords.length > 2) {
            setPaymentDetails(prev => ({ ...prev, cardHolderName: nameWords }));
          }
        }
        
        else if (numbers && !paymentDetails.cardNumber) {
          const cardNumber = numbers.join('').replace(/\s/g, '');
          if (cardNumber.length === 16) {
            setPaymentDetails(prev => ({ ...prev, cardNumber: cardNumber }));
          }
        }
        
        else if (numbers && paymentDetails.cardNumber && !paymentDetails.cvv) {
          const cvv = numbers.join('');
          if (cvv.length === 3 || cvv.length === 4) {
            setPaymentDetails(prev => ({ ...prev, cvv: cvv }));
            setTimeout(() => setCurrentStep(6), 1000);
          }
        }
      }
      
      else if (paymentMethod === 'Cash on Delivery') {
        if (transcript.includes('confirm') || transcript.includes('पुष्टि') || transcript.includes('complete') || transcript.includes('पूरा')) {
          setTimeout(() => {
            const event = new CustomEvent('completeOrder');
            window.dispatchEvent(event);
          }, 500);
        }
      }
      break;
  
    case 6: // OTP verification
      const numbers = transcript.match(/\d+/g);
      if (numbers) {
        const otpValue = numbers.join('');
        if (otpValue.length >= 4 && otpValue.length <= 6) {
          setOtp(otpValue);
        }
      }
      
      // Order confirmation
      if (transcript.includes('confirm') || transcript.includes('पुष्टि') || transcript.includes('complete') || transcript.includes('पूरा')) {
        setTimeout(() => {
          const event = new CustomEvent('completeOrder');
          window.dispatchEvent(event);
        }, 500);
      }
      break;
  }
};
