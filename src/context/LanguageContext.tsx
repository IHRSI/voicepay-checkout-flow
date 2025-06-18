
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Common
    'common.continue': 'Continue',
    'common.back': 'Back',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.total': 'Total',
    'common.quantity': 'Quantity',
    'common.price': 'Price',
    
    // Navigation
    'nav.home': 'Home',
    'nav.cart': 'Cart',
    'nav.checkout': 'Checkout',
    
    // Cart
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.continueShopping': 'Continue Shopping',
    'cart.proceedToBuy': 'Proceed to Buy',
    
    // Checkout
    'checkout.title': 'Voice Checkout',
    'checkout.productOverview': 'Product Overview',
    'checkout.deliveryAddress': 'Delivery Address',
    'checkout.paymentMethod': 'Payment Method',
    'checkout.orderSummary': 'Order Summary',
    
    // Address
    'address.chooseAddress': 'Choose from saved addresses:',
    'address.address1': 'Address 1',
    'address.address2': 'Address 2', 
    'address.address3': 'Address 3',
    'address.selectedAddress': 'Selected Address:',
    'address.continueToPayment': 'Continue to Payment Method',
    
    // Payment
    'payment.selectMethod': 'Select Payment Method',
    'payment.upi': 'UPI',
    'payment.card': 'Credit/Debit Card',
    'payment.cod': 'Cash on Delivery',
    
    // Success
    'success.orderPlaced': 'Order Placed Successfully!',
    'success.paymentSuccessful': 'Payment Successful!',
    'success.thankYou': 'Thank you for using VoicePay!',
    
    // Voice Instructions
    'voice.welcome': 'Welcome to VoicePay! Choose your language - say English or Hindi',
    'voice.cartWelcome': 'Your shopping cart. You have {count} items.',
    'voice.addressInstructions': 'Choose your delivery address. Say address 1, address 2, or address 3.',
    'voice.paymentInstructions': 'Choose your payment method. Say UPI, Card, or Cash on Delivery.',
    'voice.otpInstructions': 'Please speak your OTP digits one by one.',
  },
  hi: {
    // Common
    'common.continue': 'आगे बढ़ें',
    'common.back': 'वापस',
    'common.cancel': 'रद्द करें',
    'common.save': 'सेव करें',
    'common.total': 'कुल',
    'common.quantity': 'मात्रा',
    'common.price': 'कीमत',
    
    // Navigation
    'nav.home': 'होम',
    'nav.cart': 'कार्ट',
    'nav.checkout': 'चेकआउट',
    
    // Cart
    'cart.title': 'शॉपिंग कार्ट',
    'cart.empty': 'आपका कार्ट खाली है',
    'cart.continueShopping': 'खरीदारी जारी रखें',
    'cart.proceedToBuy': 'खरीदने के लिए आगे बढ़ें',
    
    // Checkout
    'checkout.title': 'वॉयस चेकआउट',
    'checkout.productOverview': 'उत्पाद विवरण',
    'checkout.deliveryAddress': 'डिलीवरी पता',
    'checkout.paymentMethod': 'भुगतान विधि',
    'checkout.orderSummary': 'ऑर्डर सारांश',
    
    // Address
    'address.chooseAddress': 'सेव किए गए पतों में से चुनें:',
    'address.address1': 'पता 1',
    'address.address2': 'पता 2',
    'address.address3': 'पता 3',
    'address.selectedAddress': 'चुना गया पता:',
    'address.continueToPayment': 'भुगतान विधि पर जाएं',
    
    // Payment
    'payment.selectMethod': 'भुगतान विधि चुनें',
    'payment.upi': 'यूपीआई',
    'payment.card': 'क्रेडिट/डेबिट कार्ड',
    'payment.cod': 'कैश ऑन डिलीवरी',
    
    // Success
    'success.orderPlaced': 'ऑर्डर सफलतापूर्वक दिया गया!',
    'success.paymentSuccessful': 'भुगतान सफल!',
    'success.thankYou': 'VoicePay का उपयोग करने के लिए धन्यवाद!',
    
    // Voice Instructions
    'voice.welcome': 'VoicePay में आपका स्वागत है! अपनी भाषा चुनें - English या Hindi कहें',
    'voice.cartWelcome': 'आपका शॉपिंग कार्ट। आपके पास {count} आइटम हैं।',
    'voice.addressInstructions': 'अपना डिलीवरी पता चुनें। पता 1, पता 2, या पता 3 कहें।',
    'voice.paymentInstructions': 'अपनी भुगतान विधि चुनें। UPI, Card, या Cash on Delivery कहें।',
    'voice.otpInstructions': 'कृपया अपने OTP के अंक एक-एक करके बोलें।',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('voicepay-language') as Language;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('voicepay-language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
