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
      staleTime: 60 * 1000, // 1 minute - keep data fresh longer
      gcTime: 24 * 60 * 60 * 1000, // 24 hours - keep cache for offline
      retry: (failureCount, error) => {
        // Don't retry on network errors when offline
        if (!navigator.onLine) return false;
        // Retry more times for network errors with exponential backoff
        if (isNetworkError(error)) {
          markRequestFailed();
          return failureCount < 3;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
      // Keep showing stale data while refetching
      placeholderData: (previousData: unknown) => previousData,
      // Network mode: always try to fetch, but don't fail if offline
      networkMode: 'offlineFirst',
    },
    mutations: {
      retry: (failureCount, error) => {
        if (!navigator.onLine) {
          // Will be paused and retried when online
          return true;
        }
        if (isNetworkError(error)) {
          markRequestFailed();
          return failureCount < 3;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Pause mutations when offline
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

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        buster: 'v1',
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
