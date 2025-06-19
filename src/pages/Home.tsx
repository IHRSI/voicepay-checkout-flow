import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, MapPin, ChevronRight, Star, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { products, categories } from '@/data/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentBanner, setCurrentBanner] = useState(0);
  const [hasSpokenWelcome, setHasSpokenWelcome] = useState(false);

  const banners = [
    {
      title: "Great Indian Festival Sale",
      subtitle: "Up to 80% off on Electronics & Fashion",
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200",
      color: "from-orange-500 to-red-600"
    },
    {
      title: "Festive Season Special",
      subtitle: "Traditional wear & Home decor starting ₹199",
      image: "https://images.unsplash.com/photo-1605538883669-825200433431?w=1200",
      color: "from-purple-500 to-pink-600"
    },
    {
      title: "Kitchen & Grocery Deals",
      subtitle: "Essential items for every Indian household",
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1200",
      color: "from-green-500 to-emerald-600"
    }
  ];

  const deals = [
    { title: "Electronics", discount: "Up to 70% off", count: "2000+ items" },
    { title: "Fashion", discount: "Min 50% off", count: "5000+ styles" },
    { title: "Home & Kitchen", discount: "Up to 60% off", count: "1000+ products" },
    { title: "Beauty", discount: "Min 40% off", count: "500+ brands" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (hasSpokenWelcome) return;
    
    const speak = (text: string) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-IN';
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
      }
    };

    const timer = setTimeout(() => {
      speak("Welcome to VoicePay Shopping! India's most accessible e-commerce platform. Browse thousands of products and experience our revolutionary voice-powered checkout. Start shopping now!");
      setHasSpokenWelcome(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [hasSpokenWelcome]);

  // Voice navigation
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      console.log('Navigation transcript:', transcript);
      
      if (transcript.includes('cart') || transcript.includes('shopping cart')) {
        navigate('/cart');
      } else if (transcript.includes('checkout')) {
        navigate('/checkout');
      } else if (transcript.includes('about')) {
        navigate('/about');
      } else if (transcript.includes('our aim')) {
        navigate('/our-aim');
      }
    };

    recognition.start();

    return () => {
      recognition.abort();
    };
  }, [navigate]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Toast notification when adding to cart
  const handleAddToCart = (product: any) => {
    addToCart(product);
    
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
    toast.innerHTML = `
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      Added to cart: ${product.title.substring(0, 30)}${product.title.length > 30 ? '...' : ''}
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Amazon-style Header */}
      <header className="bg-gray-900 text-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-orange-400">VoicePay</h1>
              <div className="hidden md:flex items-center gap-1 text-sm">
                <MapPin className="h-4 w-4" />
                <span className="text-gray-300">Deliver to</span>
                <span className="font-semibold">India</span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-4">
              <div className="flex rounded-md overflow-hidden">
                <select className="bg-gray-200 text-gray-900 px-3 py-2 text-sm border-r">
                  <option>All</option>
                  {categories.slice(1).map(cat => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search VoicePay.in"
                  className="flex-1 rounded-none border-0 bg-white"
                />
                <Button className="rounded-none bg-orange-400 hover:bg-orange-500 px-4">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <div className="text-gray-300">Hello, Sign in</div>
                <div className="font-semibold">Account & Lists</div>
              </div>
              <div className="text-sm">
                <div className="text-gray-300">Returns</div>
                <div className="font-semibold">& Orders</div>
              </div>
              <Button
                onClick={() => navigate('/cart')}
                variant="ghost"
                className="relative text-white hover:bg-gray-800"
              >
                <ShoppingCart className="h-6 w-6" />
                {getCartItemCount() > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white">
                    {getCartItemCount()}
                  </Badge>
                )}
                <span className="ml-1">Cart</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="bg-gray-800 border-t border-gray-700">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center gap-6 text-sm">
              <Button variant="ghost" className="text-white hover:bg-gray-700 p-2">
                All Categories
              </Button>
              {categories.slice(1, 6).map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`hover:text-orange-400 transition-colors ${
                    selectedCategory === category ? 'text-orange-400' : 'text-white'
                  }`}
                >
                  {category}
                </button>
              ))}
              <span className="text-orange-400 font-semibold">Today's Deals</span>
              <span className="text-white">Customer Service</span>
              <span className="text-white">Gift Cards</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="relative h-96 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r ${banners[currentBanner].color} opacity-90`} />
        <img
          src={banners[currentBanner].image}
          alt="Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center text-center text-white">
          <div>
            <h2 className="text-5xl font-bold mb-4">{banners[currentBanner].title}</h2>
            <p className="text-xl mb-6">{banners[currentBanner].subtitle}</p>
            <Button className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-3">
              Shop Now
            </Button>
          </div>
        </div>
        
        {/* Banner indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBanner(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentBanner ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Today's Deals */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Today's Deals</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {deals.map((deal, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold text-lg">{deal.title}</h3>
                <p className="text-red-600 font-bold">{deal.discount}</p>
                <p className="text-sm text-gray-600">{deal.count}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? "bg-orange-500 hover:bg-orange-600" : ""}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredProducts.map(product => (
            <Card key={product.id} className="hover:shadow-lg transition-all duration-200 group">
              <CardContent className="p-4">
                <div className="relative mb-3">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                
                <h3 className="font-semibold text-sm mb-2 line-clamp-2 h-10">
                  {product.title}
                </h3>
                
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(product.rating?.rate || 4)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">({product.rating?.count || 100})</span>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg font-bold text-gray-900">₹{(product.price * 80).toFixed(0)}</span>
                  <span className="text-sm text-gray-500 line-through">₹{(product.price * 100).toFixed(0)}</span>
                  <span className="text-xs text-red-600">(20% off)</span>
                </div>
                
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </p>
                
                <Button
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white transition-colors"
                  size="sm"
                >
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products found matching your search.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Get to Know Us</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>About VoicePay</li>
                <li>Careers</li>
                <li>Press Releases</li>
                <li>VoicePay Science</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect with Us</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Facebook</li>
                <li>Twitter</li>
                <li>Instagram</li>
                <li>YouTube</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Make Money with Us</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Sell on VoicePay</li>
                <li>Become an Affiliate</li>
                <li>Advertise Your Products</li>
                <li>VoicePay Pay on Merchants</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Let Us Help You</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Your Account</li>
                <li>Returns Centre</li>
                <li>100% Purchase Protection</li>
                <li>VoicePay Assistant</li>
                <li>Help</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 VoicePay.com, Inc. or its affiliates. Built for accessibility and innovation.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
