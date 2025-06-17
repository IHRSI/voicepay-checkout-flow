
import React, { useEffect } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, Star, Shield, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice } = useCart();
  const navigate = useNavigate();

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
      if (cartItems.length > 0) {
        speak(`Your shopping cart. You have ${cartItems.length} items worth ${getTotalPrice().toFixed(2)} dollars. Review your items and proceed to voice checkout when ready.`);
      } else {
        speak("Your shopping cart is empty. Browse our products to add items and experience India's most accessible checkout process.");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [cartItems.length]);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your VoicePay Cart is empty</h2>
            <p className="text-gray-600 mb-8">Shop today's deals and discover great products</p>
            <Button 
              onClick={() => navigate('/')}
              className="bg-orange-500 hover:bg-orange-600 px-8 py-3"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const originalTotal = getTotalPrice() * 1.25; // Simulate original price
  const savings = originalTotal - getTotalPrice();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
          <p className="text-gray-600">{totalItems} items in your cart</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-3">
            {/* Delivery Info */}
            <Card className="mb-6 bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Truck className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">FREE delivery</p>
                    <p className="text-sm text-green-700">Your order qualifies for FREE delivery. Select this option at checkout.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Select All */}
            <div className="flex items-center justify-between mb-4 p-4 bg-white rounded-lg border">
              <div className="flex items-center gap-3">
                <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                <span className="font-medium">Select all items</span>
              </div>
              <span className="text-sm text-gray-600">Price</span>
            </div>

            {/* Cart Items List */}
            <div className="space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="bg-white">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Checkbox */}
                      <div className="flex-shrink-0">
                        <input type="checkbox" className="rounded border-gray-300 mt-2" defaultChecked />
                      </div>

                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                          {item.title}
                        </h3>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(item.rating?.rate || 4)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                            ({item.rating?.count || 100})
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-3">
                          Category: {item.category}
                        </p>

                        <div className="flex items-center gap-4 mb-4">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            In Stock
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Shield className="h-4 w-4" />
                            <span>Eligible for Return, Refund or Replacement within 30 days</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-4">
                          {/* Quantity Selector */}
                          <div className="flex items-center border rounded-lg">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-10 w-10 p-0 hover:bg-gray-100"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="px-4 py-2 font-semibold min-w-[60px] text-center">
                              Qty: {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-10 w-10 p-0 hover:bg-gray-100"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="h-6 w-px bg-gray-300" />

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>

                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            Save for later
                          </Button>

                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            Compare with similar items
                          </Button>
                        </div>
                      </div>
                      
                      {/* Price */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-bold text-gray-900">
                          ₹{(item.price * item.quantity * 80).toFixed(0)}
                        </div>
                        <div className="text-sm text-gray-500 line-through">
                          ₹{(item.price * item.quantity * 100).toFixed(0)}
                        </div>
                        <div className="text-sm text-red-600 font-medium">
                          (20% off)
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          ₹{(item.price * 80).toFixed(0)} each
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Frequently bought together */}
            <Card className="mt-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Frequently bought together</h3>
                <div className="flex items-center gap-4 overflow-x-auto">
                  <div className="flex items-center gap-2 min-w-max">
                    <img src={cartItems[0]?.image} alt="" className="w-20 h-20 object-cover rounded border" />
                    <span className="text-2xl">+</span>
                    <img src="https://images.unsplash.com/photo-1586201375761-83865001e31c?w=100" alt="" className="w-20 h-20 object-cover rounded border" />
                    <span className="text-2xl">+</span>
                    <img src="https://images.unsplash.com/photo-1594631661960-598c76bcc7c1?w=100" alt="" className="w-20 h-20 object-cover rounded border" />
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold">Total price: ₹2,499</p>
                    <Button size="sm" className="mt-2 bg-orange-500 hover:bg-orange-600">
                      Add all three to Cart
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <Truck className="h-5 w-5" />
                    <span className="font-semibold">FREE Delivery</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Your order qualifies for FREE Delivery. Choose this option at checkout.
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({totalItems} items):</span>
                    <span className="font-semibold">₹{(getTotalPrice() * 80).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Savings:</span>
                    <span className="font-semibold">-₹{(savings * 80).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping:</span>
                    <span className="font-semibold text-green-600">FREE</span>
                  </div>
                  <hr className="my-3" />
                  <div className="flex justify-between text-lg font-bold text-red-600">
                    <span>Order Total:</span>
                    <span>₹{(getTotalPrice() * 80).toFixed(0)}</span>
                  </div>
                </div>

                <Button 
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-lg py-3 mb-4"
                >
                  Proceed to Buy ({totalItems} items)
                </Button>

                <div className="text-xs text-gray-600 mb-4">
                  <p>By placing your order, you agree to VoicePay's privacy notice and conditions of use.</p>
                </div>
                
                <Button 
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="w-full"
                >
                  Continue Shopping
                </Button>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold mb-3">EMI Available</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Your order qualifies for EMI with valid credit cards
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Learn more
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
