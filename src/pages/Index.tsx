import React, { useState, useEffect } from 'react';
import Home from '@/pages/Home';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Voice introduction for home page
  useEffect(() => {
    const speak = (text: string) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-IN';
        utterance.rate = 0.8;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
      }
    };

    const timer = setTimeout(() => {
      speak("Welcome to VoicePay marketplace! India's most inclusive shopping experience. Browse products, add to cart, and checkout completely with your voice. Namaste and happy shopping!");
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return <Home />;
};

export default Index;
