
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import ProductCard from '@/components/ProductCard';
import { products } from '@/data/products';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Mic, MicOff } from 'lucide-react';
import { toast } from 'sonner';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';

const Home = () => {
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const { language } = useLanguage();
  const [voiceMode, setVoiceMode] = useState(true);

  const handleVoiceCommand = (transcript: string) => {
    const isHindi = language === 'hi';
    const cleanTranscript = transcript.toLowerCase().trim();
    console.log('Home voice command:', cleanTranscript);
    
    // Navigation commands
    if (cleanTranscript.includes('cart') || cleanTranscript.includes('कार्ट') || cleanTranscript === 'cart') {
      console.log('Going to cart');
      navigate('/cart');
      return;
    }
    
    if (cleanTranscript.includes('checkout') || cleanTranscript.includes('चेकआउट')) {
      if (cartItems.length > 0) {
        console.log('Going to checkout');
        navigate('/checkout');
      } else {
        speak(isHindi ? 'कार्ट खाली है। पहले कुछ आइटम जोड़ें।' : 'Cart is empty. Add some items first.');
      }
      return;
    }

    if (cleanTranscript.includes('about') || cleanTranscript.includes('हमारे बारे')) {
      console.log('Going to about');
      navigate('/about');
      return;
    }

    if (cleanTranscript.includes('our aim') || cleanTranscript.includes('हमारा लक्ष्य')) {
      console.log('Going to our aim');
      navigate('/our-aim');
      return;
    }

    // Product addition commands -more flexible matching
    products.forEach((product, index) => {
      const productNumber = index + 1;
      const isProductMatch = 
        cleanTranscript.includes(`product ${productNumber}`) ||
        cleanTranscript.includes(`item ${productNumber}`) ||
        cleanTranscript.includes(`${productNumber}`) ||
        cleanTranscript.includes(product.title.toLowerCase()) ||
        (isHindi && (
          cleanTranscript.includes(`उत्पाद ${productNumber}`) ||
          cleanTranscript.includes(`आइटम ${productNumber}`) ||
          cleanTranscript.includes(`प्रोडक्ट ${productNumber}`)
        ));
      
      const isAddCommand = 
        cleanTranscript.includes('add') ||
        cleanTranscript.includes('cart') ||
        (isHindi && (
          cleanTranscript.includes('जोड़') ||
          cleanTranscript.includes('एड') ||
          cleanTranscript.includes('कार्ट में')
        ));
      
      if (isProductMatch && isAddCommand) {
        console.log(`Adding product ${productNumber} to cart`);
        addToCart(product);
        
        const addedText = isHindi 
          ? `${product.title} कार्ट में जोड़ा गया।`
          : `${product.title} added to cart.`;
        
        toast.success(addedText, {
          duration: 2000,
          position: 'bottom-center'
        });
        
        speak(addedText);
        return;
      }
    });

    // Help command
    if (cleanTranscript.includes('help') || cleanTranscript.includes('मदद') || cleanTranscript.includes('हेल्प')) {
      const helpText = isHindi
        ? 'आप कह सकते हैं: कार्ट, चेकआउट, अबाउट, या किसी उत्पाद को जोड़ने के लिए "प्रोडक्ट नंबर जोड़ें"।'
        : 'You can say: cart, checkout, about, our aim, or "add product number" to add products to cart.';
      speak(helpText);
    }
  };

  const { isListening, currentTranscript, speak } = useVoiceRecognition({
    voiceMode,
    currentStep: 1,
    onVoiceCommand: handleVoiceCommand
  });

  // Welcome message
  useEffect(() => {
    if (!voiceMode) return;
    
    const timer = setTimeout(() => {
      const welcomeText = language === 'hi' 
        ? 'VoicePay में आपका स्वागत है! आप कह सकते हैं - कार्ट, चेकआउट, अबाउट, या किसी उत्पाद को जोड़ने के लिए "प्रोडक्ट नंबर जोड़ें"।'
        : 'Welcome to VoicePay! You can say - cart, checkout, about, our aim, or "add product number" to add items to your cart.';
      speak(welcomeText);
    }, 2000);

    return () => clearTimeout(timer);
  }, [language, speak, voiceMode]);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Voice Mode Status */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {language === 'hi' ? 'वॉयसपे शॉपिंग' : 'VoicePay Shopping'}
            </h1>
            <p className="text-gray-600 mt-2">
              {language === 'hi' 
                ? 'आवाज़ से खरीदारी करें - भारत का सबसे सुलभ प्लेटफॉर्म'
                : 'Shop with your voice - India\'s most accessible platform'
              }
            </p>
          </div>
          
          <Button
            onClick={() => setVoiceMode(!voiceMode)}
            variant={voiceMode ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            {voiceMode ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            {language === 'hi' 
              ? (voiceMode ? 'वॉयस चालू' : 'वॉयस बंद')
              : (voiceMode ? 'Voice ON' : 'Voice OFF')
            }
          </Button>
        </div>

        {/* Voice Status with Transcript */}
        {voiceMode && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}></div>
              <span className="text-blue-700 font-medium">
                {language === 'hi' 
                  ? (isListening ? 'सुन रहा है...' : 'वॉयस मोड सक्रिय')
                  : (isListening ? 'Listening...' : 'Voice Mode Active')
                }
              </span>
            </div>
            
            {currentTranscript && (
              <div className="bg-white p-2 rounded border mb-2">
                <span className="text-sm text-gray-600">
                  {language === 'hi' ? 'आपने कहा:' : 'You said:'} 
                </span>
                <p className="font-medium">{currentTranscript}</p>
              </div>
            )}
            
            <p className="text-sm text-blue-600">
              {language === 'hi'
                ? 'कहें: "कार्ट", "चेकआउट", "अबाउट", या "प्रोडक्ट 1 जोड़ें"'
                : 'Say: "cart", "checkout", "about", "our aim", or "add product 1"'
              }
            </p>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <div key={product.id} className="relative">
              <div className="absolute top-2 left-2 bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm z-10">
                {index + 1}
              </div>
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        {cartItems.length > 0 && (
          <div className="fixed bottom-4 right-4 bg-orange-500 text-white p-4 rounded-full shadow-lg">
            <Button
              onClick={() => navigate('/cart')}
              className="bg-transparent hover:bg-orange-600 p-2"
            >
              <ShoppingCart className="h-6 w-6" />
              <span className="ml-2 font-bold">{cartItems.length}</span>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
