
import { VoiceCommandHandlerProps } from '@/types/voiceCommand';

export const handleContinueCommands = ({
  transcript,
  currentStep,
  selectedAddressIndex,
  paymentMethod,
  setCurrentStep
}: Pick<VoiceCommandHandlerProps, 'transcript' | 'currentStep' | 'selectedAddressIndex' | 'paymentMethod' | 'setCurrentStep'>) => {
  const cleanTranscript = transcript.toLowerCase().trim();
  console.log('Processing continue command:', cleanTranscript, 'for step:', currentStep);
  
  // Continue/next commands - more flexible matching
  if (cleanTranscript.includes('continue') || cleanTranscript.includes('next') || 
      cleanTranscript.includes('proceed') || cleanTranscript.includes('go') ||
      cleanTranscript.includes('आगे') || cleanTranscript.includes('जारी') || 
      cleanTranscript.includes('अगला') || cleanTranscript === 'ok' || cleanTranscript === 'okay') {
    
    console.log('Continue command detected, current step:', currentStep);
    
    if (currentStep === 1) {
      console.log('Moving from step 1 to step 2');
      setCurrentStep(2);
      return true;
    } else if (currentStep === 2 && selectedAddressIndex >= 0) {
      console.log('Moving from step 2 to step 3');
      setCurrentStep(3);
      return true;
    } else if (currentStep === 3) {
      console.log('Moving from step 3 to step 4');
      setCurrentStep(4);
      return true;
    } else if (currentStep === 4 && paymentMethod) {
      console.log('Moving from step 4 to step 5');
      setCurrentStep(5);
      return true;
    } else if (currentStep === 5 && paymentMethod === 'Cash on Delivery') {
      console.log('Completing COD order');
      const event = new CustomEvent('completeOrder');
      window.dispatchEvent(event);
      return true;
    } else if (currentStep === 5 && (paymentMethod === 'UPI' || paymentMethod === 'Card')) {
      console.log('Moving to OTP step');
      setCurrentStep(6);
      return true;
    }
  }
  return false;
};

export const handleAddressSelection = ({
  transcript,
  setSelectedAddressIndex,
  setCurrentStep
}: Pick<VoiceCommandHandlerProps, 'transcript' | 'setSelectedAddressIndex' | 'setCurrentStep'>) => {
  const cleanTranscript = transcript.toLowerCase().trim();
  console.log('Processing address selection:', cleanTranscript);
  
  // Address 1 selection - case insensitive and more flexible
  if (cleanTranscript.includes('address 1') || cleanTranscript.includes('address1') ||
      cleanTranscript.includes('पता 1') || cleanTranscript.includes('पता1') ||
      cleanTranscript.includes('first') || cleanTranscript.includes('पहला') || 
      cleanTranscript === '1' || cleanTranscript === 'one' || cleanTranscript.includes('first address')) {
    console.log('Selecting address 1');
    setSelectedAddressIndex(0);
    setTimeout(() => setCurrentStep(3), 1000);
    return true;
  } 
  // Address 2 selection
  else if (cleanTranscript.includes('address 2') || cleanTranscript.includes('address2') ||
           cleanTranscript.includes('पता 2') || cleanTranscript.includes('पता2') ||
           cleanTranscript.includes('second') || cleanTranscript.includes('दूसरा') || 
           cleanTranscript === '2' || cleanTranscript === 'two' || cleanTranscript.includes('second address')) {
    console.log('Selecting address 2');
    setSelectedAddressIndex(1);
    setTimeout(() => setCurrentStep(3), 1000);
    return true;
  } 
  // Address 3 selection
  else if (cleanTranscript.includes('address 3') || cleanTranscript.includes('address3') ||
           cleanTranscript.includes('पता 3') || cleanTranscript.includes('पता3') ||
           cleanTranscript.includes('third') || cleanTranscript.includes('तीसरा') || 
           cleanTranscript === '3' || cleanTranscript === 'three' || cleanTranscript.includes('third address')) {
    console.log('Selecting address 3');
    setSelectedAddressIndex(2);
    setTimeout(() => setCurrentStep(3), 1000);
    return true;
  }
  return false;
};

export const handleOfferSelection = ({
  transcript,
  setCurrentStep
}: Pick<VoiceCommandHandlerProps, 'transcript' | 'setCurrentStep'>) => {
  const cleanTranscript = transcript.toLowerCase().trim();
  console.log('Processing offer selection:', cleanTranscript);
  
  if (cleanTranscript.includes('offer 1') || cleanTranscript.includes('offer1') ||
      cleanTranscript.includes('ऑफर 1') || cleanTranscript.includes('ऑफर1') ||
      cleanTranscript.includes('first') || cleanTranscript.includes('पहला') ||
      cleanTranscript === '1' || cleanTranscript.includes('voice')) {
    console.log('Selecting offer 1');
    setTimeout(() => setCurrentStep(4), 1000);
    return true;
  } else if (cleanTranscript.includes('offer 2') || cleanTranscript.includes('offer2') ||
             cleanTranscript.includes('ऑफर 2') || cleanTranscript.includes('ऑफर2') ||
             cleanTranscript.includes('second') || cleanTranscript.includes('दूसरा') ||
             cleanTranscript === '2' || cleanTranscript.includes('upi')) {
    console.log('Selecting offer 2');
    setTimeout(() => setCurrentStep(4), 1000);
    return true;
  } else if (cleanTranscript.includes('skip') || cleanTranscript.includes('छोड़') || 
             cleanTranscript.includes('no offer') || cleanTranscript.includes('कोई ऑफर नहीं') ||
             cleanTranscript.includes('continue') || cleanTranscript.includes('next')) {
    console.log('Skipping offers');
    setTimeout(() => setCurrentStep(4), 1000);
    return true;
  }
  return false;
};
