
import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useMenuData } from './useMenuData';
import { useMenuFilter } from './useMenuFilter';
import { useShoppingCart } from './useShoppingCart';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const usePublicMenu = () => {
  const location = useLocation();
  const { menuId: routeMenuId } = useParams();
  const { toast } = useToast();
  const { user, signIn } = useAuth();
  
  const [menuId, setMenuId] = useState<string | null>(null);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [autoLoginProcessed, setAutoLoginProcessed] = useState(false);

  useEffect(() => {
    const processUrl = async () => {
      const params = new URLSearchParams(location.search);
      const idFromQuery = params.get('menu_id');
      const idFromRoute = (routeMenuId as string | undefined) || null;
      const resolvedId = idFromRoute || idFromQuery;
      const autoToken = params.get('auto_token');
      
      // Traitement du token d'auto-connexion
      if (autoToken && !autoLoginProcessed && !user) {
        try {
          const tokenData = JSON.parse(atob(autoToken));
          
          // Vérifier la validité du token
          const expiresAt = new Date(tokenData.expires_at);
          const now = new Date();
          
          if (expiresAt > now) {
            toast({
              title: "Accès autorisé",
              description: "Menu accessible via QR Code",
              variant: "default",
            });
            setAutoLoginProcessed(true);
          } else {
            toast({
              title: "QR Code expiré",
              description: "Veuillez scanner un nouveau QR Code",
              variant: "destructive",
            });
          }
        } catch (error) {
          toast({
            title: "QR Code invalide",
            description: "Le QR Code semble corrompu",
            variant: "destructive",
          });
        }
      }
      
      if (resolvedId) {
        setMenuId(resolvedId);
        setMenuError(null);
      } else {
        const errorMsg = "Aucun menu n'est spécifié dans l'URL";
        setMenuError(errorMsg);
        
        if (!autoToken) {
          toast({
            title: "Menu non spécifié",
            description: "Utilisez le chemin /menu/:menuId ou le paramètre ?menu_id=...",
            variant: "destructive",
          });
        }
      }
    };

    processUrl();
  }, [location.search, routeMenuId, toast, autoLoginProcessed, user]);

  const { menuItems, loading, error: dataError, restaurantUserId, menuData, outletId } = useMenuData(menuId);
  
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
    outletId,
  };
};
