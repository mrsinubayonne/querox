
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { MenuItem, CartItem, SelectedOption } from '@/types/menu';

const buildCartKey = (itemId: string, selections?: SelectedOption[]) => {
  if (!selections || selections.length === 0) return itemId;
  const ids = selections.map(s => s.value_id).sort().join('|');
  return `${itemId}::${ids}`;
};

export const useShoppingCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();

  const addToCart = useCallback((item: MenuItem | CartItem, selections?: SelectedOption[]) => {
    const existingSelections = (item as CartItem).selected_options;
    const finalSelections = selections ?? existingSelections;
    const cartKey = buildCartKey(item.id, finalSelections);
    const extras = (finalSelections || []).reduce((s, o) => s + (Number(o.extra_price) || 0), 0);
    const unit_price = Number(item.price) + extras;

    setCart(prev => {
      const existing = prev.find(c => c.cartKey === cartKey);
      if (existing) {
        return prev.map(c => c.cartKey === cartKey ? { ...c, quantity: c.quantity + 1 } : c);
      }
      const newItem: CartItem = {
        ...(item as MenuItem),
        cartKey,
        quantity: 1,
        selected_options: finalSelections,
        unit_price,
      };
      return [...prev, newItem];
    });

    toast({
      title: "Ajouté au panier",
      description: `${item.name} a été ajouté à votre panier`,
    });
  }, [toast]);

  const removeFromCart = useCallback((cartKey: string) => {
    setCart(prev => prev.reduce((acc, c) => {
      if (c.cartKey === cartKey) {
        if (c.quantity > 1) acc.push({ ...c, quantity: c.quantity - 1 });
      } else {
        acc.push(c);
      }
      return acc;
    }, [] as CartItem[]));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const getTotalPrice = useCallback(() => {
    return cart.reduce((total, item) => total + (item.unit_price * item.quantity), 0);
  }, [cart]);

  const getTotalItems = useCallback(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  return {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getTotalItems,
  };
};
