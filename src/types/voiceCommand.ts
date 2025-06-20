
export interface PaymentDetails {
  upiAddress: string;
  cardHolderName: string;
  cardNumber: string;
  cvv: string;
}

export interface VoiceCommandHandlerProps {
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
