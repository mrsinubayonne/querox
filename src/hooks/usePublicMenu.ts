
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useMenuData } from './useMenuData';
import { useMenuFilter } from './useMenuFilter';
import { useShoppingCart } from './useShoppingCart';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const usePublicMenu = () => {
  const location = useLocation();
  const { toast } = useToast();
  const { user, signIn } = useAuth();
  
  const [menuId, setMenuId] = useState<string | null>(null);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [autoLoginProcessed, setAutoLoginProcessed] = useState(false);

  useEffect(() => {
    const processUrl = async () => {
      const params = new URLSearchParams(location.search);
      const id = params.get('menu_id');
      const autoToken = params.get('auto_token');
      
      console.log("🔥 Menu ID extrait de l'URL:", id);
      console.log("🔥 Token auto-connexion:", autoToken ? "Présent" : "Absent");
      
      // Traitement du token d'auto-connexion
      if (autoToken && !autoLoginProcessed && !user) {
        try {
          const tokenData = JSON.parse(atob(autoToken));
          console.log("🔥 Données du token:", tokenData);
          
          // Vérifier la validité du token
          const expiresAt = new Date(tokenData.expires_at);
          const now = new Date();
          
          if (expiresAt > now) {
            // Le token est valide, effectuer une connexion temporaire
            console.log("🔥 Token valide, connexion automatique...");
            
            // Ici on pourrait implémenter une connexion temporaire
            // Pour l'instant, on affiche juste un message
            toast({
              title: "Connexion automatique",
              description: "Accès autorisé via QR Code",
              variant: "default",
            });
            
            setAutoLoginProcessed(true);
          } else {
            console.log("🔥 Token expiré");
            toast({
              title: "Token expiré",
              description: "Le QR Code a expiré, veuillez en générer un nouveau",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("🔥 Erreur décodage token:", error);
          toast({
            title: "Token invalide",
            description: "Le QR Code est invalide",
            variant: "destructive",
          });
        }
      }
      
      if (id) {
        setMenuId(id);
        setMenuError(null);
      } else {
        console.error("🔥 Aucun menu_id dans l'URL");
        const errorMsg = "Aucun menu n'est spécifié dans l'URL";
        setMenuError(errorMsg);
        
        if (!autoToken) {
          toast({
            title: "Menu non spécifié",
            description: "L'URL doit contenir un paramètre menu_id valide",
            variant: "destructive",
          });
        }
      }
    };

    processUrl();
  }, [location.search, toast, autoLoginProcessed, user]);

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
    menuData,
    autoLoginProcessed
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
    autoLoginProcessed,
  };
};
