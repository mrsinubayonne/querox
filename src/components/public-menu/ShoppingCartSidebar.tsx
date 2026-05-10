import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import { CartItem, MenuItem } from '@/types/menu';
import { cn } from '@/lib/utils';
import CheckoutOrderModal from './CheckoutOrderModal';
import { useState } from "react";
import SafeImage from '@/components/SafeImage';
import { getCategoryDefaultImage } from '@/utils/categoryImages';

interface ShoppingCartProps {
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
  onRemoveFromCart: (itemId: string) => void;
  onClearCart: () => void;
  totalPrice: number;
  className?: string;
}
const ShoppingCartSidebar: React.FC<ShoppingCartProps> = ({
  cart,
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
  totalPrice,
  className
}) => {
  const [showCheckout, setShowCheckout] = useState(false);

  return <div className={cn("w-full bg-white rounded-2xl shadow-lg p-6 h-fit sticky top-28 border-0", className)}>
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <h3 className="text-xl font-bold text-gray-800 font-playfair">Votre Panier</h3>
        {cart.length > 0 && <Button variant="ghost" onClick={onClearCart} className="text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md">
            Vider
          </Button>}
      </div>
      
      {cart.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-500 font-semibold">Votre panier est vide</p>
          <p className="text-sm text-gray-400 mt-1">Ajoutez des plats pour commencer</p>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2 -mr-2">
            {cart.map(item => <div key={item.cartKey} className="flex items-center gap-4">
                <SafeImage src={item.image_url || getCategoryDefaultImage(item.category_name)} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800 truncate">{item.name}</h4>
                  {item.selected_options && item.selected_options.length > 0 && (
                    <p className="text-xs text-gray-500 truncate">
                      {item.selected_options.map(o => o.value_name).join(', ')}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    {item.unit_price.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" onClick={() => onRemoveFromCart(item.cartKey)} className="h-8 w-8 text-gray-500 hover:bg-gray-200 rounded-full">
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center font-semibold text-gray-800">{item.quantity}</span>
                  <Button size="icon" variant="ghost" onClick={() => onAddToCart(item)} className="h-8 w-8 text-gray-500 hover:bg-gray-200 rounded-full">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>)}
          </div>
          
          <div className="border-t pt-6">
            <div className="flex justify-between items-center text-lg font-bold mb-4">
              <span className="text-gray-800">Total:</span>
              <span className="text-2xl text-emerald-600">
                {totalPrice.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
              size="lg"
              onClick={() => setShowCheckout(true)}>
              Passer la commande
              <ArrowRight />
            </Button>
          </div>
          <CheckoutOrderModal
            open={showCheckout}
            onOpenChange={setShowCheckout}
            cart={cart}
            totalPrice={totalPrice}
            onClearCart={onClearCart}
          />
        </>
      )}
    </div>;
};
export default ShoppingCartSidebar;
