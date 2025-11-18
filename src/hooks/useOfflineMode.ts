import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useOfflineMode = () => {
  const { user } = useAuth();
  const initializedRef = useRef(false);

  useEffect(() => {
    // N'initialiser que pour les utilisateurs authentifiés et une seule fois
    if (!user || initializedRef.current) return;

    const initOfflineMode = async () => {
      try {
        const { initDB } = await import('@/lib/offlineDB');
        const { syncService } = await import('@/services/SyncService');
        
        await initDB();
        
        // Sync toutes les 5 minutes
        syncService.startAutoSync(300);
        
        initializedRef.current = true;
      } catch (error) {
        console.error('❌ Erreur initialisation mode offline:', error);
      }
    };

    // Initialiser avec un délai pour ne pas bloquer le rendu
    const timeoutId = setTimeout(initOfflineMode, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [user]);
};
