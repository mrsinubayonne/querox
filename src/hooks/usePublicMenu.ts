
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
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('menu_id');
    
    console.log("🔥 Extraction menu_id de l'URL:", id);
    console.log("🔥 URL complète:", location.search);
    
    if (id) {
      console.log("🔥 Menu ID trouvé dans l'URL:", id);
      setMenuId(id);
      setUrlError(null);
    } else {
      console.error("🔥 Aucun menu_id trouvé dans l'URL");
      const errorMsg = "Aucun menu n'est spécifié. Veuillez vous assurer que l'URL contient un `menu_id`.";
      setUrlError(errorMsg);
      
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

  const loading = dataLoading;
  
  // L'erreur finale est soit l'erreur d'URL soit l'erreur de données
  const finalError = urlError || dataError;
  
  // Log pour debug
  useEffect(() => {
    console.log("🔥 État du menu public:", {
      menuId,
      loading,
      menuItemsCount: menuItems.length,
      filteredItemsCount: filteredItems.length,
      categoriesCount: categories.length,
      urlError,
      dataError,
      finalError
    });
  }, [menuId, loading, menuItems.length, filteredItems.length, categories.length, urlError, dataError, finalError]);
  
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
  };
};
