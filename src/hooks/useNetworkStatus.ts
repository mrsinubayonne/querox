import { useState, useEffect, useCallback } from 'react';
import { localStore } from '@/lib/localStore';

type NetworkStatus = 'online' | 'offline' | 'unstable';

// Key is shared with AuthContext.tsx — keep it un-prefixed via localStore.raw
const FORCE_OFFLINE_MODE_KEY = 'querox_force_offline_mode';

const isForcedOfflineModeEnabled = (): boolean => {
  return localStore.raw.getString(FORCE_OFFLINE_MODE_KEY) === '1';
};

interface UseNetworkStatusReturn {
  status: NetworkStatus;
  isOnline: boolean;
  isUnstable: boolean;
  isOffline: boolean;
  retryConnection: () => void;
}

// Track failed requests to detect unstable connections
let failedRequestCount = 0;
let lastFailTime = 0;
const UNSTABLE_THRESHOLD = 2; // Number of failures to consider unstable
const RESET_TIME = 30000; // Reset counter after 30s of no failures

export const markRequestFailed = () => {
  const now = Date.now();
  if (now - lastFailTime > RESET_TIME) {
    failedRequestCount = 0;
  }
  failedRequestCount++;
  lastFailTime = now;
  
  // Dispatch custom event to notify hook
  window.dispatchEvent(new CustomEvent('network-request-failed'));
};

export const markRequestSuccess = () => {
  failedRequestCount = Math.max(0, failedRequestCount - 1);
  window.dispatchEvent(new CustomEvent('network-request-success'));
};

export const useNetworkStatus = (): UseNetworkStatusReturn => {
  const [status, setStatus] = useState<NetworkStatus>(() => {
    if (isForcedOfflineModeEnabled()) {
      return 'offline';
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return 'offline';
    }

    return 'online';
  });

  const updateStatus = useCallback(() => {
    if (isForcedOfflineModeEnabled() || !navigator.onLine) {
      setStatus('offline');
    } else if (failedRequestCount >= UNSTABLE_THRESHOLD) {
      setStatus('unstable');
    } else {
      setStatus('online');
    }
  }, []);

  const retryConnection = useCallback(() => {
    failedRequestCount = 0;
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      localStore.raw.remove(FORCE_OFFLINE_MODE_KEY);
      window.dispatchEvent(new CustomEvent('querox-force-offline-mode-changed'));
    }
    updateStatus();
  }, [updateStatus]);

  useEffect(() => {
    const handleOnline = () => {
      localStore.raw.remove(FORCE_OFFLINE_MODE_KEY);
      window.dispatchEvent(new CustomEvent('querox-force-offline-mode-changed'));
      failedRequestCount = 0;
      setStatus('online');
    };

    const handleOffline = () => {
      setStatus('offline');
    };

    const handleRequestFailed = () => {
      updateStatus();
    };

    const handleRequestSuccess = () => {
      updateStatus();
    };

    const handleForcedOfflineModeChange = () => {
      updateStatus();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('network-request-failed', handleRequestFailed);
    window.addEventListener('network-request-success', handleRequestSuccess);
    window.addEventListener('querox-force-offline-mode-changed', handleForcedOfflineModeChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('network-request-failed', handleRequestFailed);
      window.removeEventListener('network-request-success', handleRequestSuccess);
      window.removeEventListener('querox-force-offline-mode-changed', handleForcedOfflineModeChange);
    };
  }, [updateStatus]);

  return {
    status,
    isOnline: status === 'online',
    isUnstable: status === 'unstable',
    isOffline: status === 'offline',
    retryConnection,
  };
};
