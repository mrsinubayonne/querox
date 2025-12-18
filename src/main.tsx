import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ErrorBoundary from '@/components/ErrorBoundary'
import { registerSW } from 'virtual:pwa-register'
import { toast } from '@/hooks/use-toast'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 secondes - données fraîches pour 1000+ users
      gcTime: 5 * 60 * 1000, // 5 minutes de cache
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
})

// ✅ PWA hardening: éviter les écrans blancs après mise à jour / cache obsolète
const reloadOnce = (reason: string) => {
  try {
    const key = 'querox_reload_once'
    if (sessionStorage.getItem(key) === '1') return
    sessionStorage.setItem(key, '1')
    // eslint-disable-next-line no-console
    console.warn(`[PWA] Force reload (${reason})`)
  } catch {
    // ignore
  }
  window.location.reload()
}

window.addEventListener('vite:preloadError', () => reloadOnce('vite:preloadError'))
window.addEventListener('error', (event) => {
  const message = (event as ErrorEvent).message || ''
  if (
    message.includes('Loading chunk') ||
    message.includes('ChunkLoadError') ||
    message.includes('Failed to fetch dynamically imported module')
  ) {
    reloadOnce('chunk-load-error')
  }
})
window.addEventListener('unhandledrejection', (event) => {
  const msg = String((event as PromiseRejectionEvent).reason ?? '')
  if (msg.includes('Failed to fetch dynamically imported module')) {
    reloadOnce('dynamic-import-rejection')
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
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);
