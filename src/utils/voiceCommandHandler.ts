
import { VoiceCommandHandlerProps } from '@/types/voiceCommand';
import { handleNavigationCommands } from '@/utils/commands/navigationCommands';
import { handleContinueCommands, handleAddressSelection, handleOfferSelection } from '@/utils/commands/checkoutCommands';
import { handlePaymentMethodSelection, handlePaymentDetails, handleOTPInput } from '@/utils/commands/paymentCommands';

export const handleVoiceCommand = (props: VoiceCommandHandlerProps) => {
  const { transcript, currentStep } = props;
  
  console.log('Voice command handler received:', transcript, 'Step:', currentStep);

  // Check global navigation commands first
  if (handleNavigationCommands(transcript)) {
    return;
  }

  // Handle step-specific commands
  switch (currentStep) {
    case 1:
      // Product overview step - continue to address selection
      handleContinueCommands(props);
      break;
      
    case 2:
      // Address selection step
      if (!handleAddressSelection(props)) {
        handleContinueCommands(props);
      }
      break;
      
    case 3:
      // Offers step
      if (!handleOfferSelection(props)) {
        handleContinueCommands(props);
      }
      break;
      
    case 4:
      // Payment method selection
      if (!handlePaymentMethodSelection(props)) {
        handleContinueCommands(props);
      }
      break;
      
    case 5:
      // Payment details or Cash on Delivery confirmation
      if (props.paymentMethod === 'Cash on Delivery') {
        handleContinueCommands(props);
      } else {
        if (!handlePaymentDetails(props)) {
          handleContinueCommands(props);
        }
      }
      break;
      
    case 6:
      // OTP verification
      if (!handleOTPInput(props)) {
        handleContinueCommands(props);
      }
      break;
      
    default:
      console.log('Unknown step:', currentStep);
  }
};
