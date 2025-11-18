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
        const { dataService } = await import('@/services/DataService');
        
        console.log('🚀 Initialisation du mode offline pour utilisateur authentifié...');
        await initDB();
        
        // Sync toutes les 5 minutes au lieu de 30 secondes
        syncService.startAutoSync(300);
        
        // Nettoyer les anciennes données en arrière-plan (non bloquant)
        setTimeout(() => {
          dataService.cleanupOldData(7).catch(console.error);
        }, 5000);
        
        console.log('✅ Mode offline initialisé');
        initializedRef.current = true;
      } catch (error) {
        console.error('❌ Erreur initialisation mode offline:', error);
      }
    };

    initOfflineMode();
  }, [user]);
};
