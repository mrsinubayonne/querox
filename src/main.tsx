import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { QueryClient, onlineManager } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import ErrorBoundary from '@/components/ErrorBoundary'
import { registerSW } from 'virtual:pwa-register'
import { toast } from '@/hooks/use-toast'
import { markRequestFailed, markRequestSuccess } from '@/hooks/useNetworkStatus'
import { NetworkStatusBanner } from '@/components/NetworkStatusBanner'
import { SyncStatusIndicator } from '@/components/SyncStatusIndicator'
import { cleanupQueue } from '@/lib/offlineQueue'
import { createIDBPersister } from '@/lib/idbPersister'

// Helper to detect network errors
const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('failed to fetch') ||
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('aborted') ||
      message.includes('net::err')
    );
  }
  return false;
};

// Configure online manager to use browser's online status
onlineManager.setEventListener((setOnline) => {
  const onlineHandler = () => setOnline(true);
  const offlineHandler = () => setOnline(false);
  
  window.addEventListener('online', onlineHandler);
  window.addEventListener('offline', offlineHandler);
  
  return () => {
    window.removeEventListener('online', onlineHandler);
    window.removeEventListener('offline', offlineHandler);
  };
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 7 * 24 * 60 * 60 * 1000, // 7 JOURS - indispensable pour offline
      retry: (failureCount, error) => {
        // Jamais de retry en offline → on utilise le cache
        if (!navigator.onLine) return false;
        if (isNetworkError(error)) {
          markRequestFailed();
          return failureCount < 2;
        }
        return failureCount < 1;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 15000),
      refetchOnWindowFocus: false,
      refetchOnMount: true,       // Toujours vérifier le serveur quand on navigue (offline protégé par networkMode)
      refetchOnReconnect: true,   // Refresh quand la connexion revient
      placeholderData: (previousData: unknown) => previousData,
      networkMode: 'offlineFirst', // CRITIQUE : utilise le cache si offline
    },
    mutations: {
      retry: (failureCount, error) => {
        if (!navigator.onLine) return false; // Les mutations offline sont gérées par SyncEngine
        if (isNetworkError(error)) {
          markRequestFailed();
          return failureCount < 2;
        }
        return failureCount < 1;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 15000),
      networkMode: 'offlineFirst',
    },
  },
});

// Create IDB persister for React Query cache
const persister = createIDBPersister();

// Track successful queries to mark connection as stable
queryClient.getQueryCache().subscribe((event) => {
  if (event.type === 'updated' && event.query.state.status === 'success') {
    markRequestSuccess();
  }
});

// Track mutation states
queryClient.getMutationCache().subscribe((event) => {
  if (event.type === 'updated') {
    if (event.mutation?.state.status === 'success') {
      markRequestSuccess();
    } else if (event.mutation?.state.status === 'error' && isNetworkError(event.mutation?.state.error)) {
      // Show toast for paused mutations
      toast({
        title: 'Action en attente',
        description: 'Votre action sera exécutée dès que la connexion sera rétablie.',
      });
    }
  }
});

// Clean up old queued mutations on startup
cleanupQueue();

// Retry paused mutations when coming back online
window.addEventListener('online', () => {
  // Resume paused mutations
  queryClient.resumePausedMutations().then(() => {
    // Refetch stale queries
    queryClient.invalidateQueries();
  });
});

// PWA hardening: avoid white screens after update / stale cache
const reloadOnce = (reason: string) => {
  try {
    const key = 'querox_reload_once'
    if (sessionStorage.getItem(key) === '1') return
    sessionStorage.setItem(key, '1')
    console.warn(`[PWA] Force reload (${reason})`)
  } catch {
    // ignore
  }
  window.location.reload()
}

window.addEventListener('vite:preloadError', () => reloadOnce('vite:preloadError'))
window.addEventListener('error', (event) => {
  const message = (event as ErrorEvent).message || ''
  // Only reload for chunk loading errors, not network errors
  if (
    (message.includes('Loading chunk') || message.includes('ChunkLoadError')) &&
    !message.includes('Failed to fetch')
  ) {
    reloadOnce('chunk-load-error')
  }
  // Mark network errors
  if (message.includes('Failed to fetch')) {
    markRequestFailed();
  }
})
window.addEventListener('unhandledrejection', (event) => {
  const msg = String((event as PromiseRejectionEvent).reason ?? '')
  if (msg.includes('Failed to fetch dynamically imported module')) {
    // Don't reload, just mark as network error
    markRequestFailed();
  }
})

// PWA registration - wrapped in try-catch for cross-browser compatibility
try {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      toast({
        title: 'Mise à jour disponible',
        description: "Rechargement automatique pour appliquer la dernière version.",
      })
      updateSW(true)
    },
  })
} catch (e) {
  console.warn('[PWA] Service worker registration failed:', e);
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 JOURS
        buster: 'v3-audit-fix', // Force reset complet du cache après audit
      }}
    >
      <AuthProvider>
        <NetworkStatusBanner />
        <SyncStatusIndicator />
        <App />
      </AuthProvider>
    </PersistQueryClientProvider>
  </ErrorBoundary>
);
