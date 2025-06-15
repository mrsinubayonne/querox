
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MenuItem, CartItem } from '@/types/menu';

export const usePublicMenu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Tous');
  const { toast } = useToast();
  const location = useLocation();

  const fetchPublicMenu = useCallback(async (menuId: string) => {
    try {
      setLoading(true);
      console.log(`🔥 Début récupération menu public pour menu_id: ${menuId}`);

      // Étape 1: Récupérer les catégories pour ce menu
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('menu_categories')
        .select('id, name')
        .eq('menu_id', menuId);

      if (categoriesError) {
        console.error('Erreur récupération catégories:', categoriesError);
        throw categoriesError;
      }
      console.log("🔥 Catégories reçues:", categoriesData);

      if (!categoriesData || categoriesData.length === 0) {
        console.warn("🔥 Aucune catégorie trouvée pour ce menu.");
        setMenuItems([]);
        setLoading(false);
        return;
      }
      
      const categoryMap = new Map(categoriesData.map((c: any) => [c.id, c.name]));
      const categoryIds = categoriesData.map((c: any) => c.id);
      
      // Étape 2: Récupérer tous les plats disponibles pour ces catégories
      const { data: menuItemsData, error: itemsError } = await supabase
        .from('menu_items')
        .select('*')
        .in('category_id', categoryIds)
        .eq('is_available', true)
        .order('name');

      if (itemsError) {
        console.error('Erreur récupération plats:', itemsError);
        throw itemsError;
      }
      console.log("🔥 Plats reçus:", menuItemsData);

      if (!menuItemsData || menuItemsData.length === 0) {
        console.warn("🔥 Aucun plat disponible trouvé pour ce menu");
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
  }, [toast]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const menuId = params.get('menu_id');

    if (menuId) {
      fetchPublicMenu(menuId);
    } else {
      console.error("No menu_id found in URL for PublicMenu");
      toast({
        title: "Menu non spécifié",
        description: "Aucun menu n'a été sélectionné pour être affiché.",
        variant: "destructive",
      });
      setLoading(false);
    }
  }, [location.search, fetchPublicMenu, toast]);

  const filterItems = useCallback(() => {
    let filtered = menuItems;

    // Filter by category only
    if (activeCategory !== 'Tous') {
      filtered = filtered.filter(item => item.category_name === activeCategory);
    }

    setFilteredItems(filtered);
  }, [menuItems, activeCategory]);
  
  useEffect(() => {
    filterItems();
  }, [filterItems]);

  const addToCart = useCallback((item: MenuItem) => {
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
  }, [toast]);

  const removeFromCart = useCallback((itemId: string) => {
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
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getTotalPrice = useCallback(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  const getTotalItems = useCallback(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const categories = ['Tous', ...Array.from(new Set(menuItems.map(item => item.category_name)))];

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category_name]) {
      acc[item.category_name] = [];
    }
    acc[item.category_name].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return {
    loading,
    cart,
    menuItems,
    filteredItems,
    activeCategory,
    setActiveCategory,
    categories,
    groupedItems,
    addToCart,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getTotalItems,
  };
};

