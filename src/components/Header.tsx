
import React from 'react';
import { ShoppingCart, Mic, Menu } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Header = () => {
  const { getTotalItems } = useCart();

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      {/* Main Header */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
            <Mic className="h-8 w-8 text-orange-400" />
            <div>
              <h1 className="text-2xl font-bold">VoicePay</h1>
              <p className="text-xs text-orange-300">India's Inclusive Platform</p>
            </div>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="hover:text-orange-400 transition-colors font-medium">
              Home
            </Link>
            <Link to="/our-aim" className="hover:text-orange-400 transition-colors font-medium">
              Our Aim
            </Link>
            <Link to="/about" className="hover:text-orange-400 transition-colors font-medium">
              About
            </Link>
            <Link to="/cart" className="hover:text-orange-400 transition-colors font-medium">
              Cart
            </Link>
          </nav>

          {/* Mobile Menu & Cart */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="md:hidden hover:bg-slate-800">
              <Menu className="h-6 w-6" />
            </Button>
            
            {/* Cart Button */}
            <Link to="/cart">
              <Button variant="ghost" size="sm" className="relative hover:bg-slate-800 transition-colors">
                <ShoppingCart className="h-6 w-6" />
                {getTotalItems() > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-orange-500 hover:bg-orange-600 border-0"
                  >
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Secondary Header (Amazon-style) */}
      <div className="bg-slate-800 border-t border-slate-700">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center space-x-6 text-sm">
            <span className="text-orange-300 font-medium">🎙️ Voice-Powered Shopping</span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-300">Free Voice Assistance</span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-300">Accessible for Everyone</span>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-slate-800 border-t border-slate-700">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex flex-col space-y-2">
            <Link to="/" className="hover:text-orange-400 transition-colors py-1">
              Home
            </Link>
            <Link to="/our-aim" className="hover:text-orange-400 transition-colors py-1">
              Our Aim
            </Link>
            <Link to="/about" className="hover:text-orange-400 transition-colors py-1">
              About
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
