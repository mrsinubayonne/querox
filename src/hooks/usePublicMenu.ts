
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
    
    if (id) {
      console.log("🔥 Menu ID trouvé dans l'URL:", id);
      setMenuId(id);
      setMenuError(null);
    } else {
      setMenuId(null);
      console.error("No menu_id found in URL for PublicMenu");
      const errorMsg = "Aucun menu n'est spécifié. Veuillez vous assurer que l'URL contient un `menu_id`.";
      setMenuError(errorMsg);
      
      toast({
        title: "Menu non spécifié",
        description: "Aucun menu n'a été sélectionné pour être affiché.",
        variant: "destructive",
      });
    }
  }, [location.search, toast]);

  const { menuItems, loading: dataLoading, error: dataError, restaurantUserId } = useMenuData(menuId);
  
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

  // Gérer les erreurs de données
  useEffect(() => {
    if (dataError) {
      console.error("🔥 Erreur de données:", dataError);
      setMenuError(dataError);
    }
  }, [dataError]);

  const loading = dataLoading;
  
  // Log pour debug
  useEffect(() => {
    console.log("🔥 État du menu public:", {
      menuId,
      loading,
      menuItemsCount: menuItems.length,
      filteredItemsCount: filteredItems.length,
      categoriesCount: categories.length,
      menuError,
      dataError
    });
  }, [menuId, loading, menuItems.length, filteredItems.length, categories.length, menuError, dataError]);
  
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
    menuError,
    restaurantUserId,
  };
};
