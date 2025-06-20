
import { VoiceCommandHandlerProps } from '@/types/voiceCommand';

export const handlePaymentMethodSelection = ({
  transcript,
  setPaymentMethod,
  setCurrentStep
}: Pick<VoiceCommandHandlerProps, 'transcript' | 'setPaymentMethod' | 'setCurrentStep'>) => {
  const cleanTranscript = transcript.toLowerCase().trim();
  console.log('Checking payment method:', cleanTranscript);
  
  if (cleanTranscript.includes('upi') || cleanTranscript.includes('यूपीआई') || 
      cleanTranscript === 'upi') {
    console.log('Selecting UPI');
    setPaymentMethod('UPI');
    setTimeout(() => setCurrentStep(5), 1000);
    return true;
  } else if (cleanTranscript.includes('card') || cleanTranscript.includes('कार्ड') || 
             cleanTranscript === 'card') {
    console.log('Selecting Card');
    setPaymentMethod('Card');
    setTimeout(() => setCurrentStep(5), 1000);
    return true;
  } else if (cleanTranscript.includes('cash') || cleanTranscript.includes('cod') || 
             cleanTranscript.includes('कैश') || cleanTranscript.includes('डिलीवरी पर भुगतान') ||
             cleanTranscript.includes('cash on delivery')) {
    console.log('Selecting Cash on Delivery');
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
  const cleanTranscript = transcript.toLowerCase().trim();
  console.log('Processing payment details:', cleanTranscript, 'Method:', paymentMethod);
  
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
      console.log('UPI address found:', upiMatch[0]);
      setPaymentDetails(prev => ({ ...prev, upiAddress: upiMatch[0] }));
      setTimeout(() => setCurrentStep(6), 1000);
      return true;
    }
  } 
  
  else if (paymentMethod === 'Card') {
    const numbers = transcript.match(/\d+/g);
    console.log('Card processing, numbers found:', numbers);
    
    // Sequential card details collection
    if (!paymentDetails.cardHolderName && !transcript.match(/\d/)) {
      const nameWords = transcript.replace(/card holder|name|नाम|कार्ड धारक/gi, '').trim();
      if (nameWords.length > 2) {
        console.log('Card holder name:', nameWords);
        setPaymentDetails(prev => ({ ...prev, cardHolderName: nameWords }));
        return true;
      }
    }
    
    else if (numbers && !paymentDetails.cardNumber) {
      const cardNumber = numbers.join('').replace(/\s/g, '');
      if (cardNumber.length >= 12 && cardNumber.length <= 19) {
        console.log('Card number saved');
        setPaymentDetails(prev => ({ ...prev, cardNumber: cardNumber }));
        return true;
      }
    }
    
    else if (numbers && paymentDetails.cardNumber && !paymentDetails.cvv) {
      const cvv = numbers.join('');
      if (cvv.length === 3 || cvv.length === 4) {
        console.log('CVV saved, moving to OTP');
        setPaymentDetails(prev => ({ ...prev, cvv: cvv }));
        setTimeout(() => setCurrentStep(6), 1000);
        return true;
      }
    }
  }
  
  else if (paymentMethod === 'Cash on Delivery') {
    if (cleanTranscript.includes('confirm') || cleanTranscript.includes('पुष्टि') || 
        cleanTranscript.includes('complete') || cleanTranscript.includes('पूरा') ||
        cleanTranscript === 'confirm') {
      console.log('Confirming COD order');
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
  const cleanTranscript = transcript.toLowerCase().trim();
  console.log('Processing OTP:', cleanTranscript);
  
  const numbers = transcript.match(/\d+/g);
  if (numbers) {
    const otpValue = numbers.join('');
    if (otpValue.length >= 4 && otpValue.length <= 6) {
      console.log('OTP captured:', otpValue);
      setOtp(otpValue);
      return true;
    }
  }
  
  // Order confirmation
  if (cleanTranscript.includes('confirm') || cleanTranscript.includes('पुष्टि') || 
      cleanTranscript.includes('complete') || cleanTranscript.includes('पूरा') ||
      cleanTranscript === 'confirm') {
    console.log('Confirming order with OTP');
    setTimeout(() => {
      const event = new CustomEvent('completeOrder');
      window.dispatchEvent(event);
    }, 500);
    return true;
  }
  
  return false;
};
