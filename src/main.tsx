import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ErrorBoundary from '@/components/ErrorBoundary'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

// Initialiser les services offline après le montage de React
(async () => {
  try {
    const { initDB } = await import('@/lib/offlineDB');
    const { syncService } = await import('@/services/SyncService');
    const { dataService } = await import('@/services/DataService');
    
    console.log('🚀 Initialisation du mode offline...');
    await initDB();
    syncService.startAutoSync(30); // Sync toutes les 30 secondes
    
    // Nettoyer les anciennes données au démarrage
    await dataService.cleanupOldData(7); // Garder 7 jours
    
    console.log('✅ Mode offline initialisé avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation du mode offline:', error);
  }
})();
