
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { CartItem } from '@/types/menu';
import CheckoutOrderModal from './CheckoutOrderModal';
import { useRestaurant } from '@/contexts/RestaurantContext';

interface ShoppingCartSidebarProps {
  cart: CartItem[];
  onAddToCart: (item: any) => void;
  onRemoveFromCart: (itemId: string) => void;
  onClearCart: () => void;
  totalPrice: number;
  className?: string;
}

const ShoppingCartSidebar: React.FC<ShoppingCartSidebarProps> = ({
  cart,
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
  totalPrice,
  className = "",
}) => {
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const { restaurantUserId } = useRestaurant();

  console.log("🔥 ShoppingCartSidebar - restaurantUserId:", restaurantUserId);

  const handleQuantityChange = (item: CartItem, newQuantity: number) => {
    if (newQuantity <= 0) {
      onRemoveFromCart(item.id);
    } else if (newQuantity > item.quantity) {
      onAddToCart(item);
    } else {
      // Réduire la quantité
      onRemoveFromCart(item.id);
    }
  };

  return (
    <>
      <div className={`bg-white rounded-xl shadow-lg p-6 h-fit sticky top-6 ${className}`}>
        <div className="flex items-center gap-3 mb-6">
          <ShoppingCart className="w-6 h-6 text-emerald-600" />
          <h2 className="text-xl font-bold text-gray-800">Mon Panier</h2>
          <span className="bg-emerald-100 text-emerald-700 text-sm font-medium px-2.5 py-1 rounded-full">
            {cart.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        </div>
        
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg mb-2">Votre panier est vide</p>
            <p className="text-gray-400 text-sm">Ajoutez des plats pour commencer</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0 mr-3">
                    <h4 className="font-medium text-gray-800 truncate">{item.name}</h4>
                    <p className="text-emerald-600 font-semibold">
                      {item.price.toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 rounded-full"
                        onClick={() => handleQuantityChange(item, item.quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 rounded-full"
                        onClick={() => handleQuantityChange(item, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-500 hover:bg-red-50"
                      onClick={() => onRemoveFromCart(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span className="text-emerald-600">
                  {totalPrice.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={() => setShowCheckoutModal(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3"
                  size="lg"
                >
                  Passer Commande
                </Button>
                
                <Button
                  onClick={onClearCart}
                  variant="outline"
                  className="w-full text-gray-600 hover:text-red-600 hover:border-red-300"
                >
                  Vider le panier
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
      
      <CheckoutOrderModal
        open={showCheckoutModal}
        onOpenChange={setShowCheckoutModal}
        cart={cart}
        totalPrice={totalPrice}
        onClearCart={onClearCart}
        restaurantUserId={restaurantUserId}
      />
    </>
  );
};

export default ShoppingCartSidebar;
