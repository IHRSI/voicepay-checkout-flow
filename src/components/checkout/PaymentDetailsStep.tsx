
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CreditCard, Smartphone, Mic } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface PaymentDetailsStepProps {
  paymentMethod: string;
  voiceMode: boolean;
  isListening: boolean;
  isProcessing: boolean;
  paymentDetails: {
    upiAddress: string;
    cardHolderName: string;
    cardNumber: string;
    cvv: string;
  };
  onPaymentDetailsChange: (details: any) => void;
  onContinue: () => void;
  onSwitchToManual: () => void;
  onCancel: () => void;
}

const PaymentDetailsStep: React.FC<PaymentDetailsStepProps> = ({
  paymentMethod,
  voiceMode,
  isListening,
  isProcessing,
  paymentDetails,
  onPaymentDetailsChange,
  onContinue,
  onSwitchToManual,
  onCancel
}) => {
  const { language } = useLanguage();
  const [voiceRecognition, setVoiceRecognition] = useState<any>(null);
  const [currentField, setCurrentField] = useState('');

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 1.2;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (!voiceMode) return;

    const timer = setTimeout(() => {
      if (paymentMethod === 'UPI') {
        const instructionText = language === 'hi' 
          ? 'अपना यूपीआई पता बोलें, जैसे yourname@paytm या yourname@phonepe'
          : 'Please speak your UPI address, like yourname@paytm or yourname@phonepe';
        speak(instructionText);
        setCurrentField('upi');
      } else if (paymentMethod === 'Card') {
        const instructionText = language === 'hi' 
          ? 'पहले अपना कार्ड होल्डर नाम बोलें'
          : 'Please speak your card holder name first';
        speak(instructionText);
        setCurrentField('cardHolder');
      }
    }, 500);

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        console.log('Payment details transcript:', transcript);
        
        if (transcript.includes('cancel') || transcript.includes('रद्द') || transcript.includes('कैंसल')) {
          speak(language === 'hi' ? 'पेमेंट रद्द की जा रही है।' : 'Payment being cancelled.');
          setTimeout(onCancel, 1000);
          return;
        }

        if (paymentMethod === 'UPI') {
          const upiMatch = transcript.match(/[\w\.-]+@[\w\.-]+/);
          if (upiMatch) {
            onPaymentDetailsChange({...paymentDetails, upiAddress: upiMatch[0]});
            speak(language === 'hi' ? 'यूपीआई पता सेव किया गया। अब कंटिन्यू करें।' : 'UPI address saved. Now continue.');
          } else {
            speak(language === 'hi' ? 'कृपया सही यूपीआई पता बोलें।' : 'Please speak a valid UPI address.');
          }
        } else if (paymentMethod === 'Card') {
          if (currentField === 'cardHolder' && !paymentDetails.cardHolderName) {
            onPaymentDetailsChange({...paymentDetails, cardHolderName: transcript});
            speak(language === 'hi' ? 'कार्ड होल्डर नाम सेव किया गया। अब कार्ड नंबर बोलें।' : 'Card holder name saved. Now speak card number.');
            setCurrentField('cardNumber');
          } else if (currentField === 'cardNumber' && !paymentDetails.cardNumber) {
            const numbers = transcript.match(/\d+/g);
            if (numbers) {
              const cardNumber = numbers.join('').replace(/\s/g, '');
              if (cardNumber.length === 16) {
                onPaymentDetailsChange({...paymentDetails, cardNumber});
                speak(language === 'hi' ? 'कार्ड नंबर सेव किया गया। अब सीवीवी बोलें।' : 'Card number saved. Now speak CVV.');
                setCurrentField('cvv');
              } else {
                speak(language === 'hi' ? 'कृपया 16 अंकों का कार्ड नंबर बोलें।' : 'Please speak 16 digit card number.');
              }
            }
          } else if (currentField === 'cvv' && !paymentDetails.cvv) {
            const numbers = transcript.match(/\d+/g);
            if (numbers) {
              const cvv = numbers.join('');
              if (cvv.length === 3 || cvv.length === 4) {
                onPaymentDetailsChange({...paymentDetails, cvv});
                speak(language === 'hi' ? 'सीवीवी सेव किया गया। अब कंटिन्यू करें।' : 'CVV saved. Now continue.');
              } else {
                speak(language === 'hi' ? 'कृपया 3 या 4 अंकों का सीवीवी बोलें।' : 'Please speak 3 or 4 digit CVV.');
              }
            }
          }
        }
        
        setTimeout(() => {
          if (recognition) {
            recognition.start();
          }
        }, 2000);
      };

      recognition.onerror = (event: any) => {
        console.error('Payment details recognition error:', event.error);
        if (event.error !== 'aborted') {
          setTimeout(() => {
            if (recognition) {
              recognition.start();
            }
          }, 1000);
        }
      };

      recognition.onend = () => {
        setTimeout(() => {
          if (recognition) {
            recognition.start();
          }
        }, 500);
      };

      setVoiceRecognition(recognition);
      setTimeout(() => recognition.start(), 2000);
    }

    return () => {
      clearTimeout(timer);
      if (voiceRecognition) {
        voiceRecognition.abort();
      }
      window.speechSynthesis.cancel();
    };
  }, [voiceMode, language, paymentMethod, paymentDetails, currentField, onPaymentDetailsChange, onCancel]);

  const isUPI = paymentMethod === 'UPI';
  const isCard = paymentMethod === 'Card';
  const isFormComplete = isUPI 
    ? paymentDetails.upiAddress 
    : (paymentDetails.cardHolderName && paymentDetails.cardNumber && paymentDetails.cvv);

  return (
    <Card className="shadow-lg border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <CardTitle className="flex items-center gap-2">
          {isUPI ? <Smartphone className="h-6 w-6" /> : <CreditCard className="h-6 w-6" />}
          {language === 'hi' 
            ? `${paymentMethod} विवरण` 
            : `${paymentMethod} Details`
          }
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {voiceMode ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Mic className={`h-5 w-5 ${isListening ? 'text-red-500 animate-pulse' : 'text-blue-500'}`} />
              <span className="text-sm font-medium text-blue-700">
                {language === 'hi' ? 'वॉयस से विवरण बोलें' : 'Speak your details'}
              </span>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-3">
                {language === 'hi' 
                  ? `💳 ${paymentMethod} विवरण` 
                  : `💳 ${paymentMethod} Details`
                }
              </h3>
              
              {isUPI && paymentDetails.upiAddress && (
                <div className="mb-3 p-3 bg-white rounded border">
                  <Label className="text-sm text-blue-600">
                    {language === 'hi' ? 'यूपीआई पता:' : 'UPI Address:'}
                  </Label>
                  <p className="font-medium text-blue-800">{paymentDetails.upiAddress}</p>
                </div>
              )}
              
              {isCard && (
                <>
                  {paymentDetails.cardHolderName && (
                    <div className="mb-3 p-3 bg-white rounded border">
                      <Label className="text-sm text-blue-600">
                        {language === 'hi' ? 'कार्ड होल्डर नाम:' : 'Card Holder Name:'}
                      </Label>
                      <p className="font-medium text-blue-800">{paymentDetails.cardHolderName}</p>
                    </div>
                  )}
                  
                  {paymentDetails.cardNumber && (
                    <div className="mb-3 p-3 bg-white rounded border">
                      <Label className="text-sm text-blue-600">
                        {language === 'hi' ? 'कार्ड नंबर:' : 'Card Number:'}
                      </Label>
                      <p className="font-medium font-mono text-blue-800">
                        **** **** **** {paymentDetails.cardNumber.slice(-4)}
                      </p>
                    </div>
                  )}
                  
                  {paymentDetails.cvv && (
                    <div className="mb-3 p-3 bg-white rounded border">
                      <Label className="text-sm text-blue-600">CVV:</Label>
                      <p className="font-medium font-mono text-blue-800">***</p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={onSwitchToManual}
                variant="outline"
                className="flex-1 hover:bg-blue-50 border-blue-200"
              >
                {language === 'hi' ? 'मैनुअल टाइपिंग' : 'Manual Typing'}
              </Button>
              <Button
                onClick={onCancel}
                variant="outline"
                className="flex-1 hover:bg-red-50 border-red-200 text-red-600"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </Button>
            </div>

            {isFormComplete && (
              <Button 
                onClick={onContinue}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {language === 'hi' ? 'ओटीपी सत्यापन पर जाएं' : 'Continue to OTP Verification'}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {isUPI ? (
              <div>
                <Label htmlFor="upiAddress" className="text-gray-700 font-medium">
                  {language === 'hi' ? 'यूपीआई पता / यूपीआई आईडी' : 'UPI Address / UPI ID'}
                </Label>
                <Input
                  id="upiAddress"
                  value={paymentDetails.upiAddress}
                  onChange={(e) => onPaymentDetailsChange({...paymentDetails, upiAddress: e.target.value})}
                  placeholder="yourname@upi"
                  className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="cardHolderName" className="text-gray-700 font-medium">
                    {language === 'hi' ? 'कार्ड होल्डर नाम' : 'Card Holder Name'}
                  </Label>
                  <Input
                    id="cardHolderName"
                    value={paymentDetails.cardHolderName}
                    onChange={(e) => onPaymentDetailsChange({...paymentDetails, cardHolderName: e.target.value})}
                    placeholder={language === 'hi' ? 'कार्ड पर लिखा नाम' : 'Full name as on card'}
                    className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="cardNumber" className="text-gray-700 font-medium">
                    {language === 'hi' ? 'कार्ड नंबर' : 'Card Number'}
                  </Label>
                  <Input
                    id="cardNumber"
                    value={paymentDetails.cardNumber}
                    onChange={(e) => onPaymentDetailsChange({...paymentDetails, cardNumber: e.target.value})}
                    placeholder="1234 5678 9012 3456"
                    className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="cvv" className="text-gray-700 font-medium">CVV</Label>
                  <Input
                    id="cvv"
                    value={paymentDetails.cvv}
                    onChange={(e) => onPaymentDetailsChange({...paymentDetails, cvv: e.target.value})}
                    placeholder="123"
                    maxLength={4}
                    className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
            
            <div className="flex gap-2">
              <Button
                onClick={onCancel}
                variant="outline"
                className="flex-1 hover:bg-red-50 border-red-200 text-red-600"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </Button>
              {isFormComplete && (
                <Button 
                  onClick={onContinue}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {language === 'hi' ? 'ओटीपी सत्यापन पर जाएं' : 'Continue to OTP Verification'}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentDetailsStep;
