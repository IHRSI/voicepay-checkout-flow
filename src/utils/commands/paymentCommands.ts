
import { VoiceCommandHandlerProps } from '@/types/voiceCommand';

export const handlePaymentMethodSelection = ({
  transcript,
  setPaymentMethod,
  setCurrentStep
}: Pick<VoiceCommandHandlerProps, 'transcript' | 'setPaymentMethod' | 'setCurrentStep'>) => {
  if (transcript.includes('upi') || transcript.includes('यूपीआई')) {
    setPaymentMethod('UPI');
    setTimeout(() => setCurrentStep(5), 1000);
    return true;
  } else if (transcript.includes('card') || transcript.includes('कार्ड')) {
    setPaymentMethod('Card');
    setTimeout(() => setCurrentStep(5), 1000);
    return true;
  } else if (transcript.includes('cash') || transcript.includes('cod') || transcript.includes('कैश') || transcript.includes('डिलीवरी पर भुगतान')) {
    setPaymentMethod('Cash on Delivery');
    setTimeout(() => setCurrentStep(5), 1000);
    return true;
  }
  return false;
};

export const handlePaymentDetails = ({
  transcript,
  paymentMethod,
  paymentDetails,
  setPaymentDetails,
  setCurrentStep
}: Pick<VoiceCommandHandlerProps, 'transcript' | 'paymentMethod' | 'paymentDetails' | 'setPaymentDetails' | 'setCurrentStep'>) => {
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
      return true;
    }
  } 
  
  else if (paymentMethod === 'Card') {
    const numbers = transcript.match(/\d+/g);
    
    // Sequential card details collection
    if (!paymentDetails.cardHolderName && !transcript.match(/\d/)) {
      const nameWords = transcript.replace(/card holder|name|नाम|कार्ड धारक/gi, '').trim();
      if (nameWords.length > 2) {
        setPaymentDetails(prev => ({ ...prev, cardHolderName: nameWords }));
        return true;
      }
    }
    
    else if (numbers && !paymentDetails.cardNumber) {
      const cardNumber = numbers.join('').replace(/\s/g, '');
      if (cardNumber.length === 16) {
        setPaymentDetails(prev => ({ ...prev, cardNumber: cardNumber }));
        return true;
      }
    }
    
    else if (numbers && paymentDetails.cardNumber && !paymentDetails.cvv) {
      const cvv = numbers.join('');
      if (cvv.length === 3 || cvv.length === 4) {
        setPaymentDetails(prev => ({ ...prev, cvv: cvv }));
        setTimeout(() => setCurrentStep(6), 1000);
        return true;
      }
    }
  }
  
  else if (paymentMethod === 'Cash on Delivery') {
    if (transcript.includes('confirm') || transcript.includes('पुष्टि') || transcript.includes('complete') || transcript.includes('पूरा')) {
      setTimeout(() => {
        const event = new CustomEvent('completeOrder');
        window.dispatchEvent(event);
      }, 500);
      return true;
    }
  }
  
  return false;
};

export const handleOTPVerification = ({
  transcript,
  setOtp
}: Pick<VoiceCommandHandlerProps, 'transcript' | 'setOtp'>) => {
  const numbers = transcript.match(/\d+/g);
  if (numbers) {
    const otpValue = numbers.join('');
    if (otpValue.length >= 4 && otpValue.length <= 6) {
      setOtp(otpValue);
      return true;
    }
  }
  
  // Order confirmation
  if (transcript.includes('confirm') || transcript.includes('पुष्टि') || transcript.includes('complete') || transcript.includes('पूरा')) {
    setTimeout(() => {
      const event = new CustomEvent('completeOrder');
      window.dispatchEvent(event);
    }, 500);
    return true;
  }
  
  return false;
};
