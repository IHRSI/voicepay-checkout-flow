
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import { CartItem } from '@/types/product';
import VoiceStatusIndicator from './VoiceStatusIndicator';

interface ProductOverviewProps {
  cartItems: CartItem[];
  getTotalPrice: () => number;
  voiceMode?: boolean;
  isListening?: boolean;
  isProcessing?: boolean;
  onSwitchToManual?: () => void;
  onContinue: () => void;
}

const ProductOverview: React.FC<ProductOverviewProps> = ({
  cartItems,
  getTotalPrice,
  voiceMode = false,
  isListening = false,
  isProcessing = false,
  onSwitchToManual,
  onContinue
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
                  {index + 1}. {item.title} - Quantity: {item.quantity} - ₹{(item.price * item.quantity * 80).toFixed(0)}
                </div>
              ))}
              <div className="mt-3 pt-3 border-t border-green-300">
                <p className="font-bold text-green-800">Total Amount: ₹{(getTotalPrice() * 80).toFixed(0)}</p>
              </div>
            </div>
            {onSwitchToManual && (
              <Button
                onClick={onSwitchToManual}
                variant="outline"
                className="w-full hover:bg-orange-50 border-orange-200"
              >
                Switch to Manual Mode
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Order Summary</h3>
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm py-1">
                  <span>{item.title} x {item.quantity}</span>
                  <span>₹{(item.price * item.quantity * 80).toFixed(0)}</span>
                </div>
              ))}
              <div className="mt-2 pt-2 border-t border-blue-200">
                <div className="flex justify-between font-bold">
                  <span>Total: ₹{(getTotalPrice() * 80).toFixed(0)}</span>
                </div>
              </div>
            </div>
            <Button 
              onClick={onContinue}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white transition-colors"
            >
              Continue to Address
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductOverview;
