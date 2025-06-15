
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MenuItem, CartItem } from '@/types/menu';

import PublicMenuHeader from '@/components/public-menu/PublicMenuHeader';
import MenuSearchAndFilter from '@/components/public-menu/MenuSearchAndFilter';
import MenuItemList from '@/components/public-menu/MenuItemList';
import ShoppingCartSidebar from '@/components/public-menu/ShoppingCartSidebar';
import PublicMenuLoader from '@/components/public-menu/PublicMenuLoader';

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
      console.log("🔥 Début récupération menu public (nouvelle méthode)");

      // Étape 1: Récupérer toutes les catégories de menu
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('menu_categories')
        .select('id, name');

      if (categoriesError) {
        console.error('Erreur récupération catégories:', categoriesError);
        throw categoriesError;
      }
      console.log("🔥 Catégories reçues:", categoriesData);

      if (!categoriesData) {
        console.warn("🔥 Aucune catégorie trouvée.");
        setMenuItems([]);
        setLoading(false);
        return;
      }
      
      const categoryMap = new Map(categoriesData.map((c: any) => [c.id, c.name]));
      
      // Étape 2: Récupérer tous les plats disponibles
      const { data: menuItemsData, error: itemsError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .order('name');

      if (itemsError) {
        console.error('Erreur récupération plats:', itemsError);
        throw itemsError;
      }
      console.log("🔥 Plats reçus:", menuItemsData);

      if (!menuItemsData || menuItemsData.length === 0) {
        console.warn("🔥 Aucun plat disponible trouvé");
        setMenuItems([]);
        setLoading(false);
        return;
      }

      // Étape 3: Combiner les données en JavaScript
      const transformedItems: MenuItem[] = menuItemsData.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: Number(item.price),
        image_url: item.image_url || undefined,
        category_name: categoryMap.get(item.category_id) || 'Autres',
        is_available: item.is_available,
      }));

      console.log("🔥 Plats transformés :", transformedItems);
      setMenuItems(transformedItems);
    } catch (error) {
      console.error('🔥 Erreur complète:', error);
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
    return <PublicMenuLoader />;
  }

  console.log("🔥 Rendu final - menuItems:", menuItems.length, "filteredItems:", filteredItems.length, "groupedItems:", Object.keys(groupedItems).length);

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicMenuHeader totalItems={getTotalItems()} onCartToggle={() => setShowCart(!showCart)} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <MenuSearchAndFilter
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        <div className="flex gap-8">
          <div className="flex-1">
            <MenuItemList
              groupedItems={groupedItems}
              onAddToCart={addToCart}
              menuItemsCount={menuItems.length}
              filteredItemsCount={filteredItems.length}
            />
          </div>

          {showCart && (
            <ShoppingCartSidebar
              cart={cart}
              onAddToCart={addToCart}
              onRemoveFromCart={removeFromCart}
              onClearCart={clearCart}
              totalPrice={getTotalPrice()}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicMenu;
