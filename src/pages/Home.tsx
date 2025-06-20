
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
    console.log('Home voice command:', transcript);
    
    // Navigation commands
    if (transcript.includes('cart') || transcript.includes('कार्ट')) {
      speak(isHindi ? 'कार्ट पेज पर जा रहे हैं।' : 'Going to cart page.');
      setTimeout(() => navigate('/cart'), 1000);
      return;
    }
    
    if (transcript.includes('checkout') || transcript.includes('चेकआउट')) {
      if (cartItems.length > 0) {
        speak(isHindi ? 'चेकआउट पेज पर जा रहे हैं।' : 'Going to checkout page.');
        setTimeout(() => navigate('/checkout'), 1000);
      } else {
        speak(isHindi ? 'कार्ट खाली है। पहले कुछ आइटम जोड़ें।' : 'Cart is empty. Add some items first.');
      }
      return;
    }

    if (transcript.includes('about') || transcript.includes('हमारे बारे')) {
      speak(isHindi ? 'अबाउट पेज पर जा रहे हैं।' : 'Going to about page.');
      setTimeout(() => navigate('/about'), 1000);
      return;
    }

    if (transcript.includes('our aim') || transcript.includes('हमारा लक्ष्य')) {
      speak(isHindi ? 'हमारा लक्ष्य पेज पर जा रहे हैं।' : 'Going to our aim page.');
      setTimeout(() => navigate('/our-aim'), 1000);
      return;
    }

    // Product addition commands - Enhanced pattern matching
    products.forEach((product, index) => {
      const productNames = [
        product.title.toLowerCase(),
        `product ${index + 1}`,
        `item ${index + 1}`,
        `${index + 1}`
      ];
      
      if (isHindi) {
        productNames.push(`उत्पाद ${index + 1}`, `आइटम ${index + 1}`, `प्रोडक्ट ${index + 1}`);
      }
      
      const addCommands = isHindi ? ['add', 'जोड़', 'एड', 'कार्ट में'] : ['add', 'cart'];
      
      const matchFound = productNames.some(name => 
        transcript.includes(name)
      ) && addCommands.some(cmd => transcript.includes(cmd));
      
      if (matchFound) {
        addToCart(product);
        
        const addedText = isHindi 
          ? `${product.title} कार्ट में जोड़ा गया।`
          : `${product.title} added to cart.`;
        
        speak(addedText);
        
        toast.success(addedText, {
          duration: 2000,
          position: 'bottom-center'
        });
        return;
      }
    });

    // Help command
    if (transcript.includes('help') || transcript.includes('मदद') || transcript.includes('हेल्प')) {
      const helpText = isHindi
        ? 'आप कह सकते हैं: कार्ट, चेकआउट, अबाउट, या किसी उत्पाद को जोड़ने के लिए "प्रोडक्ट नंबर जोड़ें" या "आइटम नंबर एड करें"।'
        : 'You can say: cart, checkout, about, our aim, or "add product number" or "add item number" to add products to cart.';
      speak(helpText);
    }
  };

  const { isListening, speak } = useVoiceRecognition({
    voiceMode,
    currentStep: 1,
    onVoiceCommand: handleVoiceCommand
  });

  // Welcome message
  useEffect(() => {
    if (!voiceMode) return;
    
    const timer = setTimeout(() => {
      const welcomeText = language === 'hi' 
        ? 'VoicePay में आपका स्वागत है! भारत का सबसे सुलभ शॉपिंग प्लेटफॉर्म। वॉयस मोड चालू है। आप कह सकते हैं - कार्ट, चेकआउट, अबाउट, या किसी उत्पाद को जोड़ने के लिए "प्रोडक्ट नंबर जोड़ें"।'
        : 'Welcome to VoicePay! India\'s most accessible shopping platform. Voice mode is active. You can say - cart, checkout, about, our aim, or "add product number" to add items to your cart.';
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

        {/* Voice Status */}
        {voiceMode && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Mic className={`h-5 w-5 ${isListening ? 'text-red-500 animate-pulse' : 'text-blue-500'}`} />
              <span className="text-blue-700 font-medium">
                {language === 'hi' 
                  ? (isListening ? 'सुन रहा है...' : 'वॉयस मोड सक्रिय')
                  : (isListening ? 'Listening...' : 'Voice Mode Active')
                }
              </span>
            </div>
            <p className="text-sm text-blue-600 mt-1">
              {language === 'hi'
                ? 'कहें: "कार्ट", "चेकआउट", "अबाउट", या "प्रोडक्ट 1 जोड़ें", "आइटम 2 एड करें"'
                : 'Say: "cart", "checkout", "about", "our aim", or "add product 1", "add item 2"'
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
