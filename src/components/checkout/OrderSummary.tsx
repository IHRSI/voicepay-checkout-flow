
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { CartItem } from '@/types/product';

interface OrderSummaryProps {
  cartItems: CartItem[];
  getTotalPrice: () => number;
  currentStep: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ cartItems, getTotalPrice, currentStep }) => {
  return (
    <Card className="sticky top-24 shadow-lg border-gray-200">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100">
        <CardTitle className="text-lg font-semibold text-gray-800">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="space-y-3">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between text-sm py-2 border-b border-gray-100">
              <span className="font-medium text-gray-700">{item.title} x {item.quantity}</span>
              <span className="font-semibold text-gray-900">₹{(item.price * item.quantity * 80).toFixed(0)}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-4">
          <div className="flex justify-between font-bold text-lg">
            <span className="text-gray-800">Total</span>
            <span className="text-orange-600">₹{(getTotalPrice() * 80).toFixed(0)}</span>
          </div>
        </div>
        
        <div className="space-y-3 pt-4 border-t">
          <div className={`flex items-center gap-2 transition-colors ${currentStep >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Product Overview {currentStep > 1 ? '✓' : ''}</span>
          </div>
          <div className={`flex items-center gap-2 transition-colors ${currentStep >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Address {currentStep > 2 ? '✓' : ''}</span>
          </div>
          <div className={`flex items-center gap-2 transition-colors ${currentStep >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Payment Method {currentStep > 3 ? '✓' : ''}</span>
          </div>
          <div className={`flex items-center gap-2 transition-colors ${currentStep >= 4 ? 'text-green-600' : 'text-gray-400'}`}>
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Payment Details {currentStep > 4 ? '✓' : ''}</span>
          </div>
          <div className={`flex items-center gap-2 transition-colors ${currentStep >= 5 ? 'text-green-600' : 'text-gray-400'}`}>
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">OTP Verification</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
