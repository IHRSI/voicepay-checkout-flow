
import React, { useState, useEffect } from 'react';
import { products } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Mic, ShoppingCart, Shield, Users } from 'lucide-react';

const Home = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('voicepay-onboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('voicepay-onboarding', 'true');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <Mic className="h-16 w-16 text-orange-400" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to VoicePay
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-300">
            Shop hands-free with voice-powered checkout
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <Shield className="h-5 w-5 text-orange-400" />
              <span>Secure Voice Payments</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <Users className="h-5 w-5 text-orange-400" />
              <span>Accessibility First</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <ShoppingCart className="h-5 w-5 text-orange-400" />
              <span>Easy Shopping</span>
            </div>
          </div>
          <Button 
            onClick={() => setShowOnboarding(true)}
            size="lg"
            className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-3"
          >
            Learn About Voice Checkout
          </Button>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Onboarding Modal */}
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Mic className="h-8 w-8 text-orange-500" />
              Welcome to Voice-Powered Shopping!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              VoicePay is designed to make online shopping accessible for everyone, 
              especially users with visual, motor, or cognitive disabilities.
            </p>
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">How Voice Checkout Works:</h3>
              <div className="grid gap-3">
                <div className="flex items-start gap-3">
                  <div className="bg-orange-100 text-orange-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">1</div>
                  <div>
                    <strong>Address:</strong> Speak your delivery address when prompted
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-orange-100 text-orange-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">2</div>
                  <div>
                    <strong>Payment:</strong> Choose your payment method by voice (UPI, Card, or Cash on Delivery)
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-orange-100 text-orange-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">3</div>
                  <div>
                    <strong>Security:</strong> Confirm with voice verification and OTP (if needed)
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Look for the 🎙️ "Speak" button during checkout. 
                You can always type manually if voice isn't available.
              </p>
            </div>
            <Button 
              onClick={handleCloseOnboarding}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              Got it! Let's Shop
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
