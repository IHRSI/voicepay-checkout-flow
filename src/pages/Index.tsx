
import React, { useState } from 'react';
import Home from '@/pages/Home';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/context/LanguageContext';

const Index = () => {
  const [languageSelected, setLanguageSelected] = useState(false);
  const { language } = useLanguage();

  // Check if language was previously selected
  React.useEffect(() => {
    const savedLanguage = localStorage.getItem('voicepay-language');
    if (savedLanguage) {
      setLanguageSelected(true);
    }
  }, []);

  if (!languageSelected) {
    return <LanguageSelector onLanguageSelected={() => setLanguageSelected(true)} />;
  }

  return <Home />;
};

export default Index;
