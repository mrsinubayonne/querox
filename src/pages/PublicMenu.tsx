
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category_name: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

const PublicMenu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPublicMenu();
  }, []);

  const fetchPublicMenu = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          id,
          name,
          description,
          price,
          image_url,
          menu_categories!inner(name)
        `)
        .eq('is_available', true)
        .order('name');

      if (error) {
        console.error('Error fetching public menu:', error);
        return;
      }

      const transformedItems = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: Number(item.price),
        image_url: item.image_url,
        category_name: item.menu_categories?.name || 'Autres'
      }));

      setMenuItems(transformedItems);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
    
    toast({
      title: "Ajouté au panier",
      description: `${item.name} a été ajouté à votre panier`,
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      return prevCart.reduce((acc, cartItem) => {
        if (cartItem.id === itemId) {
          if (cartItem.quantity > 1) {
            acc.push({ ...cartItem, quantity: cartItem.quantity - 1 });
          }
        } else {
          acc.push(cartItem);
        }
        return acc;
      }, [] as CartItem[]);
    });
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category_name]) {
      acc[item.category_name] = [];
    }
    acc[item.category_name].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notre Menu</h1>
              <p className="text-gray-600">Découvrez nos délicieux plats</p>
            </div>
            <Button
              onClick={() => setShowCart(!showCart)}
              className="relative"
              variant={showCart ? "default" : "outline"}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Panier
              {getTotalItems() > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  {getTotalItems()}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Menu Items */}
          <div className="flex-1">
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                  {category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                        {item.description && (
                          <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-green-600">
                            {item.price.toLocaleString('fr-FR')} FCFA
                          </span>
                          <Button
                            onClick={() => addToCart(item)}
                            size="sm"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Ajouter
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Cart Sidebar */}
          {showCart && (
            <div className="w-80 bg-white rounded-lg shadow-lg p-6 h-fit sticky top-8">
              <h3 className="text-lg font-semibold mb-4">Votre Panier</h3>
              
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Votre panier est vide</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between border-b pb-3">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-600">
                            {item.price.toLocaleString('fr-FR')} FCFA
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addToCart(item)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-semibold mb-4">
                      <span>Total:</span>
                      <span>{getTotalPrice().toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <Button className="w-full" size="lg">
                      Commander
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicMenu;
