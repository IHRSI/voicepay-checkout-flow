
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, Globe, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const OurAim = () => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const storyTexts = [
    "In India, 70 million people face barriers to digital payments due to visual, motor, or cognitive disabilities.",
    "Traditional payment systems exclude those who need them most.",
    "Every person deserves financial freedom and independence.",
    "VoicePay breaks down these barriers with voice-powered commerce.",
    "We're building India's most inclusive payment platform."
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % storyTexts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Simulate Indian voice greeting
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
      speak("Welcome to VoicePay. India's most inclusive payment platform. Namaste!");
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-blue-600/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6">
              Our <span className="text-orange-600">Aim</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
              Breaking barriers, building bridges to financial inclusion
            </p>
          </div>
        </div>
      </section>

      {/* Animated Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="h-32 flex items-center justify-center">
              <p 
                key={currentTextIndex}
                className="text-2xl md:text-3xl text-center text-gray-700 font-medium animate-fade-in leading-relaxed"
              >
                {storyTexts[currentTextIndex]}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center p-8 hover:shadow-lg transition-shadow border-orange-200">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800">70M+</h3>
                <p className="text-gray-600">Indians with accessibility needs</p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow border-blue-200">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Globe className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800">1.4B</h3>
                <p className="text-gray-600">Population we aim to serve</p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow border-green-200">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800">100%</h3>
                <p className="text-gray-600">Commitment to inclusion</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">Our Mission</h2>
            <p className="text-xl md:text-2xl leading-relaxed mb-8">
              To create a world where every person, regardless of their abilities, 
              has equal access to digital commerce and financial services. 
              We believe technology should empower everyone, not exclude anyone.
            </p>
            <Link to="/about">
              <Button 
                size="lg" 
                className="bg-white text-orange-600 hover:bg-gray-100 transition-colors text-lg px-8 py-4"
              >
                Meet Our Team <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Join the Inclusive Commerce Revolution
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Experience shopping the way it should be - accessible, intuitive, and empowering for everyone.
            </p>
            <Link to="/">
              <Button 
                size="lg" 
                className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-4"
              >
                Start Shopping Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OurAim;
