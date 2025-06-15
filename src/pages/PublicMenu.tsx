import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Minus, ShoppingCart, Search, Star, Clock, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CategoryFilter from '@/components/CategoryFilter';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category_name: string;
  is_available: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
}

const PublicMenu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tous');
  const { toast } = useToast();

  useEffect(() => {
    fetchPublicMenu();
  }, []);

  useEffect(() => {
    filterItems();
  }, [menuItems, searchTerm, activeCategory]);

  const fetchPublicMenu = async () => {
    try {
      setLoading(true);
      
      // First get all available menu items with their categories
      const { data: menuItemsData, error: itemsError } = await supabase
        .from('menu_items')
        .select(`
          id,
          name,
          description,
          price,
          image_url,
          is_available,
          menu_categories!inner(name)
        `)
        .eq('is_available', true)
        .order('name');

      if (itemsError) {
        console.error('Error fetching menu items:', itemsError);
        throw itemsError;
      }

      // Transform the data to match our interface
      const transformedItems: MenuItem[] = (menuItemsData || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: Number(item.price),
        image_url: item.image_url || undefined,
        category_name: (item.menu_categories as any)?.[0]?.name || 'Autres',
        is_available: item.is_available
      }));

      setMenuItems(transformedItems);
    } catch (error) {
      console.error('Error fetching menu:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le menu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = menuItems;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (activeCategory !== 'Tous') {
      filtered = filtered.filter(item => item.category_name === activeCategory);
    }

    setFilteredItems(filtered);
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

  const clearCart = () => {
    setCart([]);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Get unique categories for filtering
  const categories = ['Tous', ...Array.from(new Set(menuItems.map(item => item.category_name)))];

  // Group items by category for display
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category_name]) {
      acc[item.category_name] = [];
    }
    acc[item.category_name].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Chargement du menu...</h2>
            <p className="text-gray-500">Préparation de nos délicieux plats</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-lg border-b-2 border-orange-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">🍽️</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Notre Menu</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Ouvert maintenant
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Livraison disponible
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 max-w-md mx-auto lg:mx-0">
                Découvrez nos délicieux plats préparés avec passion et des ingrédients frais
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button
                onClick={() => setShowCart(!showCart)}
                className="relative bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
                size="lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Panier ({getTotalItems()})
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs animate-pulse">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Rechercher un plat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-lg border-gray-200 focus:border-orange-300 focus:ring-orange-200"
                />
              </div>
            </div>
            <div className="lg:w-auto">
              <CategoryFilter
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Menu Items */}
          <div className="flex-1">
            {Object.keys(groupedItems).length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun plat trouvé</h3>
                <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
              </div>
            ) : (
              Object.entries(groupedItems).map(([category, items]) => (
                <div key={category} className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{category}</h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-orange-200 to-transparent"></div>
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      {items.length} plat{items.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {items.map((item) => (
                      <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md group">
                        <div className="relative overflow-hidden">
                          <img
                            src={item.image_url || "/lovable-uploads/eedf6dca-ced1-4275-a5ca-db24eefce183.png"}
                            alt={item.name}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-green-500 text-white shadow-lg">
                              Disponible
                            </Badge>
                          </div>
                          <div className="absolute bottom-3 left-3">
                            <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-white text-xs font-medium">4.8</span>
                            </div>
                          </div>
                        </div>
                        
                        <CardContent className="p-6">
                          <h3 className="font-bold text-lg mb-2 text-gray-900">{item.name}</h3>
                          {item.description && (
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                              {item.price.toLocaleString('fr-FR')} FCFA
                            </div>
                            <Button
                              onClick={() => addToCart(item)}
                              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
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
              ))
            )}
          </div>

          {/* Enhanced Cart Sidebar */}
          {showCart && (
            <div className="w-96 bg-white rounded-2xl shadow-xl p-6 h-fit sticky top-8 border-0">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Votre Panier</h3>
                {cart.length > 0 && (
                  <Button variant="ghost" onClick={clearCart} className="text-red-500 hover:text-red-700">
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
                            onClick={() => removeFromCart(item.id)}
                            className="h-8 w-8 p-0 border-gray-300"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addToCart(item)}
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
                        {getTotalPrice().toLocaleString('fr-FR')} FCFA
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
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicMenu;
