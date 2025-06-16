
export interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  description: string;
  category: string;
  rating: number;
  reviews: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CheckoutData {
  address: string;
  paymentMethod: 'UPI' | 'Card' | 'Cash on Delivery' | '';
  otp: string;
  voiceConfirmed: boolean;
}
