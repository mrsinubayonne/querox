
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { CartItem, MenuItem } from '@/types/menu';

interface ShoppingCartProps {
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
  onRemoveFromCart: (itemId: string) => void;
  onClearCart: () => void;
  totalPrice: number;
}

const ShoppingCartSidebar: React.FC<ShoppingCartProps> = ({ 
  cart, 
  onAddToCart, 
  onRemoveFromCart, 
  onClearCart, 
  totalPrice 
}) => {
  return (
    <div className="w-96 bg-white rounded-2xl shadow-xl p-6 h-fit sticky top-8 border-0">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Votre Panier</h3>
        {cart.length > 0 && (
          <Button variant="ghost" onClick={onClearCart} className="text-red-500 hover:text-red-700">
            Vider
          </Button>
        )}
      </div>
      
      {cart.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-4">Votre panier est vide</p>
          <p className="text-sm text-gray-400">Ajoutez des plats pour commencer</p>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <img
                  src={item.image_url || "/lovable-uploads/eedf6dca-ced1-4275-a5ca-db24eefce183.png"}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                  <p className="text-sm text-gray-600">
                    {item.price.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRemoveFromCart(item.id)}
                    className="h-8 w-8 p-0 border-gray-300"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAddToCart(item)}
                    className="h-8 w-8 p-0 border-gray-300"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-6">
            <div className="flex justify-between items-center text-lg font-bold mb-6">
              <span>Total:</span>
              <span className="text-2xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {totalPrice.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
            <Button 
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300" 
              size="lg"
            >
              Commander Maintenant
            </Button>
            <p className="text-xs text-gray-500 text-center mt-3">
              Livraison gratuite pour les commandes de plus de 15 000 FCFA
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ShoppingCartSidebar;
