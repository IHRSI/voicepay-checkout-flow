
import { VoiceCommandHandlerProps } from '@/types/voiceCommand';

export const handleContinueCommands = ({
  transcript,
  currentStep,
  selectedAddressIndex,
  paymentMethod,
  setCurrentStep
}: Pick<VoiceCommandHandlerProps, 'transcript' | 'currentStep' | 'selectedAddressIndex' | 'paymentMethod' | 'setCurrentStep'>) => {
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
    return true;
  }
  return false;
};

export const handleAddressSelection = ({
  transcript,
  setSelectedAddressIndex,
  setCurrentStep
}: Pick<VoiceCommandHandlerProps, 'transcript' | 'setSelectedAddressIndex' | 'setCurrentStep'>) => {
  if (transcript.includes('address 1') || transcript.includes('पता 1') || transcript.includes('पहला') || transcript.includes('first') || transcript.includes('1')) {
    setSelectedAddressIndex(0);
    setTimeout(() => setCurrentStep(3), 1000);
    return true;
  } else if (transcript.includes('address 2') || transcript.includes('पता 2') || transcript.includes('दूसरा') || transcript.includes('second') || transcript.includes('2')) {
    setSelectedAddressIndex(1);
    setTimeout(() => setCurrentStep(3), 1000);
    return true;
  } else if (transcript.includes('address 3') || transcript.includes('पता 3') || transcript.includes('तीसरा') || transcript.includes('third') || transcript.includes('3')) {
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
  if (transcript.includes('offer 1') || transcript.includes('ऑफर 1') || transcript.includes('पहला') || transcript.includes('first') || transcript.includes('1')) {
    setTimeout(() => setCurrentStep(4), 1000);
    return true;
  } else if (transcript.includes('offer 2') || transcript.includes('ऑफर 2') || transcript.includes('दूसरा') || transcript.includes('second') || transcript.includes('2')) {
    setTimeout(() => setCurrentStep(4), 1000);
    return true;
  } else if (transcript.includes('skip') || transcript.includes('छोड़') || transcript.includes('no offer') || transcript.includes('कोई ऑफर नहीं')) {
    setTimeout(() => setCurrentStep(4), 1000);
    return true;
  }
  return false;
};
