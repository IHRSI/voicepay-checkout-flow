
import React, { useState, useEffect } from 'react';
import Home from '@/pages/Home';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/context/LanguageContext';

const Index = () => {
  const [languageSelected, setLanguageSelected] = useState(false);
  const { language } = useLanguage();

  // Check if language was previously selected
  useEffect(() => {
    const savedLanguage = localStorage.getItem('voicepay-language');
    if (savedLanguage) {
      setLanguageSelected(true);
    }
  }, []);

  // Reset language selection when component mounts (for fresh start)
  useEffect(() => {
    // Clear saved language to always show selector on fresh page load
    localStorage.removeItem('voicepay-language');
    setLanguageSelected(false);
  }, []);

  if (!languageSelected) {
    return <LanguageSelector onLanguageSelected={() => setLanguageSelected(true)} />;
  }

  return <Home />;
};

export default Index;
