
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Percent, CreditCard, Smartphone, CheckCircle, Mic, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface OffersSectionProps {
  total: number;
  onOfferApplied: (discount: number, offerCode: string) => void;
  voiceMode: boolean;
  isListening: boolean;
  onContinue: () => void;
}

const offers = [
  {
    id: 'VOICE20',
    title: 'Voice Checkout Bonus',
    titleHi: 'वॉयस चेकआउट बोनस',
    description: 'Extra 20% off for using voice checkout',
    descriptionHi: 'वॉयस चेकआउट के लिए अतिरिक्त 20% छूट',
    discount: 20,
    icon: <Mic className="h-5 w-5" />,
    bgColor: 'from-purple-500 to-pink-500',
    textColor: 'text-purple-800',
    bgLight: 'bg-purple-50',
    voiceCommand: ['voice', 'bonus', 'वॉयस', 'बोनस']
  },
  {
    id: 'UPI15',
    title: 'UPI Super Saver',
    titleHi: 'UPI सुपर सेवर',
    description: 'Get 15% cashback on UPI payments',
    descriptionHi: 'UPI भुगतान पर 15% कैशबैक पाएं',
    discount: 15,
    icon: <Smartphone className="h-5 w-5" />,
    bgColor: 'from-green-500 to-emerald-500',
    textColor: 'text-green-800',
    bgLight: 'bg-green-50',
    voiceCommand: ['upi', 'saver', 'यूपीआई', 'सेवर']
  },
  {
    id: 'CARD10',
    title: 'Card Payment Offer',
    titleHi: 'कार्ड पेमेंट ऑफर',
    description: '10% instant discount on card payments',
    descriptionHi: 'कार्ड भुगतान पर 10% तुरंत छूट',
    discount: 10,
    icon: <CreditCard className="h-5 w-5" />,
    bgColor: 'from-blue-500 to-cyan-500',
    textColor: 'text-blue-800',
    bgLight: 'bg-blue-50',
    voiceCommand: ['card', 'payment', 'कार्ड', 'पेमेंट']
  },
  {
    id: 'FIRST5',
    title: 'First Order Special',
    titleHi: 'पहला ऑर्डर स्पेशल',
    description: '5% off on your first voice order',
    descriptionHi: 'आपके पहले वॉयस ऑर्डर पर 5% छूट',
    discount: 5,
    icon: <Gift className="h-5 w-5" />,
    bgColor: 'from-orange-500 to-red-500',
    textColor: 'text-orange-800',
    bgLight: 'bg-orange-50',
    voiceCommand: ['first', 'special', 'पहला', 'स्पेशल']
  }
];

const OffersSection: React.FC<OffersSectionProps> = ({ 
  total, 
  onOfferApplied, 
  voiceMode, 
  isListening,
  onContinue
}) => {
  const { language } = useLanguage();
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const [appliedOffer, setAppliedOffer] = useState<string | null>(null);
  const [voiceRecognition, setVoiceRecognition] = useState<any>(null);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (!voiceMode) return;

    const timer = setTimeout(() => {
      const instructionText = language === 'hi' 
        ? 'यहाँ विशेष ऑफर हैं। ऑफर 1 वॉयस चेकआउट बोनस, ऑफर 2 UPI सुपर सेवर, ऑफर 3 कार्ड पेमेंट ऑफर, ऑफर 4 पहला ऑर्डर स्पेशल। कोई भी ऑफर चुनने के लिए "ऑफर 1", "ऑफर 2", "ऑफर 3", या "ऑफर 4" कहें। बिना ऑफर के आगे बढ़ने के लिए "continue" कहें।'
        : 'Here are special offers. Offer 1 Voice Checkout Bonus, Offer 2 UPI Super Saver, Offer 3 Card Payment Offer, Offer 4 First Order Special. Say "offer 1", "offer 2", "offer 3", or "offer 4" to choose. Say "continue" to proceed without offers.';
      speak(instructionText);
    }, 500);

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        console.log('Offers transcript:', transcript);
        
        if (transcript.includes('continue') || transcript.includes('आगे') || transcript.includes('जारी')) {
          speak(language === 'hi' ? 'भुगतान विधि पर जा रहे हैं।' : 'Proceeding to payment method.');
          setTimeout(onContinue, 1000);
          return;
        }
        
        // Check for offer selection
        if (transcript.includes('offer 1') || transcript.includes('ऑफर 1') || transcript.includes('1')) {
          handleOfferSelect('VOICE20');
        } else if (transcript.includes('offer 2') || transcript.includes('ऑफर 2') || transcript.includes('2')) {
          handleOfferSelect('UPI15');
        } else if (transcript.includes('offer 3') || transcript.includes('ऑफर 3') || transcript.includes('3')) {
          handleOfferSelect('CARD10');
        } else if (transcript.includes('offer 4') || transcript.includes('ऑफर 4') || transcript.includes('4')) {
          handleOfferSelect('FIRST5');
        } else {
          speak(language === 'hi' ? 'कृपया ऑफर 1, 2, 3, या 4 कहें, या continue कहें।' : 'Please say offer 1, 2, 3, or 4, or say continue.');
        }
        
        setTimeout(() => {
          if (recognition) {
            recognition.start();
          }
        }, 2000);
      };

      recognition.onerror = (event: any) => {
        console.error('Offers recognition error:', event.error);
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
  }, [voiceMode, language, onContinue]);

  const handleOfferSelect = (offerId: string) => {
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return;

    setSelectedOffer(offerId);
    setAppliedOffer(offerId);
    
    const discount = (total * offer.discount) / 100;
    onOfferApplied(discount, offerId);

    const confirmationText = language === 'hi' 
      ? `${offer.titleHi} लागू किया गया! आपको ₹${discount.toFixed(0)} की छूट मिली। भुगतान विधि पर जाने के लिए continue कहें।`
      : `${offer.title} applied! You saved ₹${discount.toFixed(0)}. Say continue to proceed to payment method.`;
    
    speak(confirmationText);
  };

  return (
    <Card className="mb-6 shadow-lg border-gray-200 bg-gradient-to-br from-amber-50 to-orange-50">
      <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Percent className="h-6 w-6" />
          {language === 'hi' ? 'विशेष ऑफर्स' : 'Special Offers'}
        </CardTitle>
        <p className="text-sm text-amber-100">
          {language === 'hi' 
            ? 'बचत के लिए किसी भी ऑफर को चुनें या आगे बढ़ें' 
            : 'Choose any offer to save money or continue'
          }
        </p>
      </CardHeader>
      <CardContent className="p-6">
        {voiceMode && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Mic className={`h-4 w-4 ${isListening ? 'animate-pulse text-red-500' : ''}`} />
              <span className="font-medium text-sm">
                {language === 'hi' ? 'वॉयस निर्देश' : 'Voice Instructions'}
              </span>
            </div>
            <p className="text-xs text-blue-700">
              {language === 'hi' 
                ? 'ऑफर चुनने के लिए "ऑफर 1", "ऑफर 2", "ऑफर 3", या "ऑफर 4" कहें। आगे बढ़ने के लिए "continue" कहें।'
                : 'Say "offer 1", "offer 2", "offer 3", or "offer 4" to select. Say "continue" to proceed.'
              }
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {offers.map((offer, index) => (
            <div
              key={offer.id}
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                selectedOffer === offer.id
                  ? 'border-orange-500 bg-orange-50 shadow-lg transform scale-105'
                  : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
              }`}
              onClick={() => handleOfferSelect(offer.id)}
            >
              <div className="absolute -top-2 -left-2 bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
              
              <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r ${offer.bgColor} flex items-center justify-center text-white`}>
                {offer.icon}
              </div>
              
              {appliedOffer === offer.id && (
                <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1">
                  <CheckCircle className="h-4 w-4" />
                </div>
              )}

              <div className="mb-3 mt-4">
                <h3 className="font-bold text-gray-800 mb-1">
                  {language === 'hi' ? offer.titleHi : offer.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {language === 'hi' ? offer.descriptionHi : offer.description}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <Badge className={`${offer.bgLight} ${offer.textColor} border-0`}>
                  {offer.discount}% {language === 'hi' ? 'छूट' : 'OFF'}
                </Badge>
                <span className="text-lg font-bold text-green-600">
                  ₹{((total * offer.discount) / 100).toFixed(0)} {language === 'hi' ? 'बचत' : 'saved'}
                </span>
              </div>

              {selectedOffer === offer.id && (
                <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 font-medium">
                    {language === 'hi' ? '✓ ऑफर लागू किया गया!' : '✓ Offer Applied!'}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            onClick={onContinue}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3"
          >
            {language === 'hi' ? 'भुगतान विधि पर जाएं' : 'Continue to Payment Method'}
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>

        {!appliedOffer && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-600 text-sm">
              {language === 'hi' 
                ? 'कोई ऑफर नहीं चुना गया। ऊपर से कोई भी ऑफर चुनें या आगे बढ़ें।'
                : 'No offer selected. Choose any offer above to save money or continue.'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OffersSection;
