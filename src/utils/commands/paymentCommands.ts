
import { VoiceCommandHandlerProps } from '@/types/voiceCommand';

export const handlePaymentMethodSelection = ({
  transcript,
  setPaymentMethod,
  setCurrentStep
}: Pick<VoiceCommandHandlerProps, 'transcript' | 'setPaymentMethod' | 'setCurrentStep'>) => {
  const cleanTranscript = transcript.toLowerCase().trim();
  console.log('Processing payment method selection:', cleanTranscript);
  
  if (cleanTranscript.includes('upi') || cleanTranscript.includes('यूपीआई')) {
    console.log('Selecting UPI payment method');
    setPaymentMethod('UPI');
    setTimeout(() => setCurrentStep(5), 800);
    return true;
  } else if (cleanTranscript.includes('card') || cleanTranscript.includes('कार्ड')) {
    console.log('Selecting Card payment method');
    setPaymentMethod('Card');
    setTimeout(() => setCurrentStep(5), 800);
    return true;
  } else if (cleanTranscript.includes('cash') || cleanTranscript.includes('cod') || 
             cleanTranscript.includes('कैश') || cleanTranscript.includes('डिलीवरी पर भुगतान') ||
             cleanTranscript.includes('cash on delivery')) {
    console.log('Selecting Cash on Delivery');
    setPaymentMethod('Cash on Delivery');
    setTimeout(() => setCurrentStep(5), 800);
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
  const cleanTranscript = transcript.toLowerCase().trim();
  console.log('Processing payment details:', cleanTranscript, 'for method:', paymentMethod);
  
  if (paymentMethod === 'UPI') {
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
      console.log('UPI address captured:', upiMatch[0]);
      setPaymentDetails(prev => ({ ...prev, upiAddress: upiMatch[0] }));
      setTimeout(() => setCurrentStep(6), 800);
      return true;
    }
  } 
  
  else if (paymentMethod === 'Card') {
    const numbers = transcript.match(/\d+/g);
    
    if (!paymentDetails.cardHolderName && !transcript.match(/\d/)) {
      const nameWords = transcript.replace(/card holder|name|नाम|कार्ड धारक/gi, '').trim();
      if (nameWords.length > 2) {
        console.log('Card holder name captured');
        setPaymentDetails(prev => ({ ...prev, cardHolderName: nameWords }));
        return true;
      }
    }
    
    else if (numbers && !paymentDetails.cardNumber) {
      const cardNumber = numbers.join('').replace(/\s/g, '');
      if (cardNumber.length >= 12 && cardNumber.length <= 19) {
        console.log('Card number captured');
        setPaymentDetails(prev => ({ ...prev, cardNumber: cardNumber }));
        return true;
      }
    }
    
    else if (numbers && paymentDetails.cardNumber && !paymentDetails.cvv) {
      const cvv = numbers.join('');
      if (cvv.length === 3 || cvv.length === 4) {
        console.log('CVV captured, moving to OTP');
        setPaymentDetails(prev => ({ ...prev, cvv: cvv }));
        setTimeout(() => setCurrentStep(6), 800);
        return true;
      }
    }
  }
  
  else if (paymentMethod === 'Cash on Delivery') {
    if (cleanTranscript.includes('confirm') || cleanTranscript.includes('पुष्टि') || 
        cleanTranscript.includes('complete') || cleanTranscript.includes('पूरा')) {
      console.log('Confirming COD order');
      const event = new CustomEvent('completeOrder');
      window.dispatchEvent(event);
      return true;
    }
  }
  
  return false;
};

export const handleOTPVerification = ({
  transcript,
  setOtp
}: Pick<VoiceCommandHandlerProps, 'transcript' | 'setOtp'>) => {
  const cleanTranscript = transcript.toLowerCase().trim();
  console.log('Processing OTP verification:', cleanTranscript);
  
  const numbers = transcript.match(/\d+/g);
  if (numbers) {
    const otpValue = numbers.join('');
    if (otpValue.length >= 4 && otpValue.length <= 6) {
      console.log('OTP captured:', otpValue);
      setOtp(otpValue);
      return true;
    }
  }
  
  if (cleanTranscript.includes('confirm') || cleanTranscript.includes('पुष्टि') || 
      cleanTranscript.includes('complete') || cleanTranscript.includes('पूरा')) {
    console.log('Confirming order with OTP');
    const event = new CustomEvent('completeOrder');
    window.dispatchEvent(event);
    return true;
  }
  
  return false;
};
