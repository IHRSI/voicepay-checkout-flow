
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag } from 'lucide-react';
import { CartItem } from '@/types/product';
import VoiceStatusIndicator from './VoiceStatusIndicator';

interface ProductOverviewProps {
  cartItems: CartItem[];
  getTotalPrice: () => number;
  voiceMode: boolean;
  isListening: boolean;
  isProcessing: boolean;
  onSwitchToManual: () => void;
}

const ProductOverview: React.FC<ProductOverviewProps> = ({
  cartItems,
  getTotalPrice,
  voiceMode,
  isListening,
  isProcessing,
  onSwitchToManual
}) => {
  return (
    <Card className="mb-6 shadow-lg border-gray-200 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <CardTitle className="flex items-center gap-2 text-xl">
          <ShoppingBag className="h-6 w-6" />
          Your Order Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {voiceMode ? (
          <div className="space-y-4">
            <VoiceStatusIndicator 
              isListening={isListening} 
              isProcessing={isProcessing} 
              currentStep={1}
            />
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">🛍️ Order Summary</h3>
              {cartItems.map((item, index) => (
                <div key={item.id} className="text-sm text-green-700 mb-1">
                  {index + 1}. {item.title} - Quantity: {item.quantity} - ${(item.price * item.quantity).toFixed(2)}
                </div>
              ))}
              <div className="mt-3 pt-3 border-t border-green-300">
                <p className="font-bold text-green-800">Total Amount: ${getTotalPrice().toFixed(2)}</p>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                onClick={onSwitchToManual}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                Switch to Manual Mode
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Order Summary</h3>
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm py-1">
                  <span>{item.title} x {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="mt-2 pt-2 border-t border-blue-200">
                <div className="flex justify-between font-bold">
                  <span>Total: ${getTotalPrice().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductOverview;
