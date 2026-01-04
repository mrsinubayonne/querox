import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ErrorBoundary from '@/components/ErrorBoundary'
import { registerSW } from 'virtual:pwa-register'
import { toast } from '@/hooks/use-toast'
import { markRequestFailed, markRequestSuccess } from '@/hooks/useNetworkStatus'
import { NetworkStatusBanner } from '@/components/NetworkStatusBanner'

// Helper to detect network errors
const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('failed to fetch') ||
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('aborted')
    );
  }
  return false;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: (failureCount, error) => {
        // Don't retry on network errors when offline
        if (!navigator.onLine) return false;
        // Limit retries for network errors
        if (isNetworkError(error)) {
          markRequestFailed();
          return failureCount < 1;
        }
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: (failureCount, error) => {
        if (!navigator.onLine) return false;
        if (isNetworkError(error)) {
          markRequestFailed();
          return false;
        }
        return failureCount < 1;
      },
      onError: (error) => {
        if (isNetworkError(error)) {
          markRequestFailed();
        }
      },
    },
  },
});

// Track successful queries to mark connection as stable
queryClient.getQueryCache().subscribe((event) => {
  if (event.type === 'updated' && event.query.state.status === 'success') {
    markRequestSuccess();
  }
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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NetworkStatusBanner />
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);
