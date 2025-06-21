
import { VoiceCommandHandlerProps } from '@/types/voiceCommand';

export const handleContinueCommands = ({
  transcript,
  currentStep,
  selectedAddressIndex,
  paymentMethod,
  setCurrentStep
}: Pick<VoiceCommandHandlerProps, 'transcript' | 'currentStep' | 'selectedAddressIndex' | 'paymentMethod' | 'setCurrentStep'>) => {
  const cleanTranscript = transcript.toLowerCase().trim();
  console.log('Checking continue command:', cleanTranscript, 'Step:', currentStep);
  
  // Enhanced continue/next commands
  if (cleanTranscript.includes('continue') || cleanTranscript.includes('next') || 
      cleanTranscript.includes('आगे') || cleanTranscript.includes('जारी') || 
      cleanTranscript.includes('अगला') || cleanTranscript === 'continue' || 
      cleanTranscript === 'next') {
    
    console.log('Continue command detected for step:', currentStep);
    
    if (currentStep === 1) {
      console.log('Moving to step 2');
      setCurrentStep(2);
    } else if (currentStep === 2 && selectedAddressIndex >= 0) {
      console.log('Moving to step 3');
      setCurrentStep(3);
    } else if (currentStep === 3) {
      console.log('Moving to step 4');
      setCurrentStep(4);
    } else if (currentStep === 4 && paymentMethod) {
      console.log('Moving to step 5');
      setCurrentStep(5);
    } else if (currentStep === 5 && paymentMethod === 'Cash on Delivery') {
      console.log('Completing COD order');
      const event = new CustomEvent('completeOrder');
      window.dispatchEvent(event);
    } else if (currentStep === 5 && (paymentMethod === 'UPI' || paymentMethod === 'Card')) {
      console.log('Moving to OTP step');
      setCurrentStep(6);
    }
    return true;
  }
  return false;
};

export const handleAddressSelection = ({
  transcript,
  setSelectedAddressIndex,
  setCurrentStep
}: Pick<VoiceCommandHandlerProps, 'transcript' | 'setSelectedAddressIndex' | 'setCurrentStep'>) => {
  const cleanTranscript = transcript.toLowerCase().trim();
  console.log('Checking address selection:', cleanTranscript);
  
  if (cleanTranscript.includes('address 1') || cleanTranscript.includes('पता 1') || 
      cleanTranscript.includes('पहला') || cleanTranscript.includes('first') || 
      cleanTranscript === '1' || cleanTranscript === 'one') {
    console.log('Selecting address 1');
    setSelectedAddressIndex(0);
    setTimeout(() => setCurrentStep(3), 500);
    return true;
  } else if (cleanTranscript.includes('address 2') || cleanTranscript.includes('पता 2') || 
             cleanTranscript.includes('दूसरा') || cleanTranscript.includes('second') || 
             cleanTranscript === '2' || cleanTranscript === 'two') {
    console.log('Selecting address 2');
    setSelectedAddressIndex(1);
    setTimeout(() => setCurrentStep(3), 500);
    return true;
  } else if (cleanTranscript.includes('address 3') || cleanTranscript.includes('पता 3') || 
             cleanTranscript.includes('तीसरा') || cleanTranscript.includes('third') || 
             cleanTranscript === '3' || cleanTranscript === 'three') {
    console.log('Selecting address 3');
    setSelectedAddressIndex(2);
    setTimeout(() => setCurrentStep(3), 500);
    return true;
  }
  return false;
};

export const handleOfferSelection = ({
  transcript,
  setCurrentStep
}: Pick<VoiceCommandHandlerProps, 'transcript' | 'setCurrentStep'>) => {
  const cleanTranscript = transcript.toLowerCase().trim();
  console.log('Checking offer selection:', cleanTranscript);
  
  if (cleanTranscript.includes('offer 1') || cleanTranscript.includes('ऑफर 1') || 
      cleanTranscript.includes('पहला') || cleanTranscript.includes('first') || 
      cleanTranscript === '1') {
    console.log('Selecting offer 1');
    setTimeout(() => setCurrentStep(4), 500);
    return true;
  } else if (cleanTranscript.includes('offer 2') || cleanTranscript.includes('ऑफर 2') || 
             cleanTranscript.includes('दूसरा') || cleanTranscript.includes('second') || 
             cleanTranscript === '2') {
    console.log('Selecting offer 2');
    setTimeout(() => setCurrentStep(4), 500);
    return true;
  } else if (cleanTranscript.includes('skip') || cleanTranscript.includes('छोड़') || 
             cleanTranscript.includes('no offer') || cleanTranscript.includes('कोई ऑफर नहीं')) {
    console.log('Skipping offers');
    setTimeout(() => setCurrentStep(4), 500);
    return true;
  }
  return false;
};
