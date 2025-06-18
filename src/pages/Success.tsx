
import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Package, Home, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state;

  useEffect(() => {
    if (!orderData) {
      navigate('/');
      return;
    }

    // Cancel any ongoing speech first
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const speak = (text: string) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-IN';
        utterance.rate = 2.2;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
      }
    };

    const timer = setTimeout(() => {
      const { isCOD, total } = orderData;
      if (isCOD) {
        speak(`Order placed successfully for ${(total * 80).toFixed(0)} rupees! Your items will be delivered and you can pay cash on delivery. Happy shopping with VoicePay!`);
      } else {
        speak(`Payment successful for ${(total * 80).toFixed(0)} rupees! Your order has been placed successfully. Thank you for shopping with VoicePay! Happy shopping!`);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      // Cancel speech when component unmounts
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [orderData, navigate]);

  if (!orderData) {
    return null;
  }

  const { orderData: checkout, total, items, isCOD } = orderData;
  const orderId = `VP${Date.now().toString().slice(-6)}`;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isCOD ? 'Order Placed Successfully!' : 'Payment Successful!'}
          </h1>
          <p className="text-gray-600">
            {isCOD ? 'Your order has been placed with Cash on Delivery' : 'Your order has been placed successfully'}
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-6 w-6 text-orange-500" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-600">Order ID:</span>
                <p className="font-mono text-lg">{orderId}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-600">Total Amount:</span>
                <p className="text-xl font-bold text-green-600">₹{(total * 80).toFixed(0)}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-600">Payment Method:</span>
                <p>{checkout.paymentMethod}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-600">Estimated Delivery:</span>
                <p>3-5 business days</p>
              </div>
            </div>
            
            <div>
              <span className="font-semibold text-gray-600">Delivery Address:</span>
              <p className="mt-1 p-3 bg-gray-50 rounded-lg">{checkout.address}</p>
            </div>

            {isCOD && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800 font-semibold">Cash on Delivery</p>
                <p className="text-sm text-blue-700 mt-1">
                  Please keep ₹{(total * 80).toFixed(0)} ready for payment when your order arrives.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3 pb-3 border-b last:border-b-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{item.title}</h4>
                    <p className="text-gray-600 text-xs">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{(item.price * item.quantity * 80).toFixed(0)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <p className="text-gray-600">
            Thank you for using VoicePay! We'll send you an email confirmation shortly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-orange-500 hover:bg-orange-600">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg text-center">
          <p className="text-blue-800 text-sm">
            🎉 <strong>Accessibility Achievement Unlocked!</strong><br />
            You've successfully completed a voice-powered checkout experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Success;
