
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface SavedAddressListProps {
  addresses: string[];
  selectedIndex: number;
  language: string;
  onAddressSelect: (index: number) => void;
  onContinue?: () => void;
  showContinueButton?: boolean;
}

const SavedAddressList: React.FC<SavedAddressListProps> = ({
  addresses,
  selectedIndex,
  language,
  onAddressSelect,
  onContinue,
  showContinueButton = false
}) => {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-700">
        {language === 'hi' ? 'सेव किए गए पतों में से चुनें:' : 'Choose from saved addresses:'}
      </h3>
      {addresses.map((addr, index) => (
        <div 
          key={index}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            selectedIndex === index 
              ? 'bg-orange-50 border-orange-300 ring-2 ring-orange-200' 
              : 'bg-gray-50 border-gray-200 hover:bg-orange-50'
          }`}
          onClick={() => onAddressSelect(index)}
        >
          <div className="flex items-start gap-3">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
              selectedIndex === index 
                ? 'bg-orange-500 border-orange-500' 
                : 'border-gray-300'
            }`}>
              {selectedIndex === index && (
                <Check className="w-3 h-3 text-white" />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-800">
                {language === 'hi' ? `पता ${index + 1}` : `Address ${index + 1}`}
              </p>
              <p className="text-sm text-gray-600 mt-1">{addr}</p>
            </div>
          </div>
        </div>
      ))}

      {showContinueButton && selectedIndex >= 0 && onContinue && (
        <Button
          onClick={onContinue}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white transition-colors"
        >
          {language === 'hi' ? 'भुगतान विधि पर जाएं' : 'Continue to Payment Method'}
        </Button>
      )}
    </div>
  );
};

export default SavedAddressList;
