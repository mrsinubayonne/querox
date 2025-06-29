
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMenuData } from './useMenuData';
import { useMenuFilter } from './useMenuFilter';
import { useShoppingCart } from './useShoppingCart';
import { useToast } from '@/hooks/use-toast';

export const usePublicMenu = () => {
  const location = useLocation();
  const { toast } = useToast();
  
  const [menuId, setMenuId] = useState<string | null>(null);
  const [menuError, setMenuError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('menu_id');
    
    console.log("🔥 Menu ID extrait de l'URL:", id);
    
    if (id) {
      setMenuId(id);
      setMenuError(null);
    } else {
      console.error("🔥 Aucun menu_id dans l'URL");
      const errorMsg = "Aucun menu n'est spécifié dans l'URL";
      setMenuError(errorMsg);
      
      toast({
        title: "Menu non spécifié",
        description: "L'URL doit contenir un paramètre menu_id valide",
        variant: "destructive",
      });
    }
  }, [location.search, toast]);

  const { menuItems, loading, error: dataError, restaurantUserId, menuData } = useMenuData(menuId);
  
  const {
    filteredItems,
    activeCategory,
    setActiveCategory,
    searchTerm,
    setSearchTerm,
    categories,
    groupedItems,
  } = useMenuFilter(menuItems);
  
  const cartHook = useShoppingCart();

  // Utiliser l'erreur de données si elle existe
  const finalError = dataError || menuError;

  console.log("🔥 État final du menu public:", {
    menuId,
    loading,
    menuItemsCount: menuItems.length,
    filteredItemsCount: filteredItems.length,
    categoriesCount: categories.length,
    error: finalError,
    restaurantUserId,
    menuData
  });
  
  return {
    loading,
    menuItems,
    ...cartHook,
    filteredItems,
    activeCategory,
    setActiveCategory,
    searchTerm,
    setSearchTerm,
    categories,
    groupedItems,
    menuError: finalError,
    restaurantUserId,
    menuData,
  };
};
