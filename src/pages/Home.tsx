
import React, { useState, useEffect } from 'react';
import { products } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Mic, ShoppingCart, Shield, Users, Search, MapPin, User } from 'lucide-react';

const Home = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  const categories = [
    { name: 'Electronics', image: '/placeholder.svg', color: 'bg-blue-100' },
    { name: 'Fashion', image: '/placeholder.svg', color: 'bg-pink-100' },
    { name: 'Home & Kitchen', image: '/placeholder.svg', color: 'bg-green-100' },
    { name: 'Books', image: '/placeholder.svg', color: 'bg-yellow-100' },
    { name: 'Sports', image: '/placeholder.svg', color: 'bg-red-100' },
    { name: 'Beauty', image: '/placeholder.svg', color: 'bg-purple-100' },
  ];

  const deals = [
    { title: "Today's Deals", discount: "Up to 70% off", products: products.slice(0, 4) },
    { title: "Electronics Sale", discount: "Up to 50% off", products: products.slice(2, 6) },
    { title: "Fashion Week", discount: "Up to 60% off", products: products.slice(1, 5) },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Amazon-style Header */}
      <div className="bg-gray-900 text-white">
        {/* Top Bar */}
        <div className="bg-gray-800 py-2">
          <div className="container mx-auto px-4 flex justify-between items-center text-sm">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Deliver to India
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>Hello, Sign in</span>
              <span>Returns & Orders</span>
              <span className="flex items-center gap-1">
                <ShoppingCart className="h-4 w-4" />
                Cart
              </span>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="py-3">
          <div className="container mx-auto px-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Mic className="h-8 w-8 text-orange-400" />
              <h1 className="text-2xl font-bold">VoicePay</h1>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="flex">
                <select className="bg-gray-200 text-gray-800 px-3 py-2 rounded-l-md border-r">
                  <option>All</option>
                  <option>Electronics</option>
                  <option>Fashion</option>
                  <option>Books</option>
                </select>
                <Input
                  type="text"
                  placeholder="Search VoicePay"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 rounded-none border-0 focus:ring-0"
                />
                <Button className="rounded-l-none bg-orange-500 hover:bg-orange-600">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button 
              onClick={() => setShowOnboarding(true)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              🎙️ Voice Shopping
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-gray-700 py-2">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-6 text-sm">
              <span className="hover:text-orange-400 cursor-pointer">All</span>
              <span className="hover:text-orange-400 cursor-pointer">Today's Deals</span>
              <span className="hover:text-orange-400 cursor-pointer">Customer Service</span>
              <span className="hover:text-orange-400 cursor-pointer">Registry</span>
              <span className="hover:text-orange-400 cursor-pointer">Gift Cards</span>
              <span className="hover:text-orange-400 cursor-pointer">Sell</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Shop with Your Voice
          </h2>
          <p className="text-xl mb-6">
            India's first voice-powered shopping experience
          </p>
          <div className="flex justify-center gap-4 mb-6">
            <div className="bg-white/20 px-4 py-2 rounded-full flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span>Secure</span>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-full flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>Accessible</span>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-full flex items-center gap-2">
              <Mic className="h-5 w-5" />
              <span>Voice-First</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold mb-6">Shop by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <div key={category.name} className={`${category.color} p-6 rounded-lg text-center hover:shadow-lg transition-shadow cursor-pointer`}>
                <div className="w-16 h-16 mx-auto mb-3 bg-white rounded-full flex items-center justify-center">
                  <ShoppingCart className="h-8 w-8 text-gray-600" />
                </div>
                <h4 className="font-semibold text-gray-800">{category.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deals Sections */}
      {deals.map((deal, index) => (
        <section key={index} className="py-8">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{deal.title}</h3>
                  <p className="text-red-600 font-semibold">{deal.discount}</p>
                </div>
                <Button variant="outline">See all deals</Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {deal.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* All Products */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">All Products</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
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
