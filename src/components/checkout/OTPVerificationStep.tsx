
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, Mic } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface OTPVerificationStepProps {
  voiceMode: boolean;
  isListening: boolean;
  isProcessing: boolean;
  otp: string;
  paymentMethod: string;
  onOtpChange: (otp: string) => void;
  onCompleteOrder: () => void;
  onSwitchToManual: () => void;
  onCancel: () => void;
}

const OTPVerificationStep: React.FC<OTPVerificationStepProps> = ({
  voiceMode,
  isListening,
  isProcessing,
  otp,
  paymentMethod,
  onOtpChange,
  onCompleteOrder,
  onSwitchToManual,
  onCancel
}) => {
  const { language } = useLanguage();
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
        ? 'अपना ओटीपी नंबर बोलें। आप छह अंकों का ओटीपी एक साथ बोल सकते हैं या एक-एक करके। रद्द करने के लिए "कैंसल" कहें।'
        : 'Please speak your OTP number. You can say all six digits together or one by one. Say "cancel" to cancel the transaction.';
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
        console.log('OTP transcript:', transcript);
        
        if (transcript.includes('cancel') || transcript.includes('रद्द') || transcript.includes('कैंसल')) {
          speak(language === 'hi' ? 'लेनदेन रद्द की जा रही है।' : 'Transaction being cancelled.');
          setTimeout(onCancel, 1000);
          return;
        }
        
        // Enhanced number extraction for both languages
        let otpValue = '';
        
        // Handle Hindi numbers
        const hindiNumbers: { [key: string]: string } = {
          'शून्य': '0', 'एक': '1', 'दो': '2', 'तीन': '3', 'चार': '4',
          'पांच': '5', 'छह': '6', 'सात': '7', 'आठ': '8', 'नौ': '9'
        };
        
        // Handle English numbers
        const englishNumbers: { [key: string]: string } = {
          'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
          'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9'
        };
        
        // First try direct digit extraction
        const directNumbers = transcript.match(/\d+/g);
        if (directNumbers) {
          otpValue = directNumbers.join('');
        } else {
          // Try word to number conversion
          const words = transcript.split(' ');
          for (const word of words) {
            if (hindiNumbers[word]) {
              otpValue += hindiNumbers[word];
            } else if (englishNumbers[word]) {
              otpValue += englishNumbers[word];
            }
          }
        }
        
        if (otpValue.length >= 4 && otpValue.length <= 6) {
          onOtpChange(otpValue);
          speak(language === 'hi' ? `ओटीपी ${otpValue} सेव किया गया।` : `OTP ${otpValue} saved.`);
        } else {
          speak(language === 'hi' ? 'कृपया छह अंकों का ओटीपी बोलें।' : 'Please speak six digit OTP.');
        }
        
        setTimeout(() => {
          if (recognition) {
            recognition.start();
          }
        }, 2000);
      };

      recognition.onerror = (event: any) => {
        console.error('OTP recognition error:', event.error);
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
  }, [voiceMode, language, onOtpChange, onCancel]);

  return (
    <Card className="shadow-lg border-gray-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          {language === 'hi' ? 'ओटीपी सत्यापन' : 'OTP Verification'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {voiceMode ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Mic className={`h-5 w-5 ${isListening ? 'text-red-500 animate-pulse' : 'text-blue-500'}`} />
              <span className="text-sm font-medium text-blue-700">
                {language === 'hi' ? 'वॉयस से ओटीपी बोलें' : 'Speak your OTP'}
              </span>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">
                {language === 'hi' ? '🔐 सुरक्षा सत्यापन' : '🔐 Security Verification'}
              </h3>
              <p className="text-sm text-blue-700 mb-3">
                {language === 'hi' 
                  ? `${paymentMethod} भुगतान के लिए आपके पंजीकृत मोबाइल नंबर पर ओटीपी भेजा गया है।`
                  : `An OTP has been sent to your registered mobile number for ${paymentMethod} payment.`
                }
              </p>
              
              {otp && (
                <div className="p-3 bg-white rounded border">
                  <Label className="text-sm text-purple-600">
                    {language === 'hi' ? 'कैप्चर किया गया ओटीपी:' : 'Captured OTP:'}
                  </Label>
                  <p className="font-bold font-mono text-2xl text-purple-800 tracking-wider">
                    {otp.split('').join(' ')}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={onSwitchToManual}
                variant="outline"
                className="flex-1 hover:bg-purple-50 border-purple-200"
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

            {otp && otp.length >= 4 && (
              <Button 
                onClick={onCompleteOrder}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                {language === 'hi' ? 'भुगतान पूरा करें' : 'Complete Payment'}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Shield className="h-5 w-5" />
                <span className="font-medium">
                  {language === 'hi' ? 'सुरक्षा सत्यापन' : 'Security Verification'}
                </span>
              </div>
              <p className="text-sm text-blue-700">
                {language === 'hi' 
                  ? `कृपया ${paymentMethod} भुगतान के लिए आपके पंजीकृत मोबाइल नंबर पर भेजा गया ओटीपी डालें।`
                  : `Please enter the OTP sent to your registered mobile number for ${paymentMethod} payment.`
                }
              </p>
            </div>
            
            <div>
              <Label htmlFor="otp" className="text-gray-700 font-medium">
                {language === 'hi' ? 'ओटीपी डालें' : 'Enter OTP'}
              </Label>
              <Input
                id="otp"
                value={otp}
                onChange={(e) => onOtpChange(e.target.value)}
                placeholder={language === 'hi' ? '6-अंकीय ओटीपी' : '6-digit OTP'}
                maxLength={6}
                className="mt-1 border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-center text-lg font-mono tracking-wider"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={onCancel}
                variant="outline"
                className="flex-1 hover:bg-red-50 border-red-200 text-red-600"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </Button>
              {otp && otp.length >= 4 && (
                <Button 
                  onClick={onCompleteOrder}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  {language === 'hi' ? 'भुगतान पूरा करें' : 'Complete Payment'}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OTPVerificationStep;
