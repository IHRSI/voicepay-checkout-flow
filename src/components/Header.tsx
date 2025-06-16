
import React from 'react';
import { ShoppingCart, Mic } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Header = () => {
  const { getTotalItems } = useCart();

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Mic className="h-8 w-8 text-orange-400" />
            <h1 className="text-2xl font-bold">VoicePay</h1>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-orange-400 transition-colors">
              Home
            </Link>
            <Link to="/cart" className="hover:text-orange-400 transition-colors">
              Cart
            </Link>
          </nav>

          <Link to="/cart">
            <Button variant="ghost" size="sm" className="relative hover:bg-slate-800">
              <ShoppingCart className="h-6 w-6" />
              {getTotalItems() > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-orange-500"
                >
                  {getTotalItems()}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
