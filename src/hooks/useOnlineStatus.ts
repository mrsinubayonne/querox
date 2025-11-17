import { useState, useEffect } from 'react';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(
    navigator.onLine ? new Date() : null
  );

  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Connexion rétablie');
      setIsOnline(true);
      setLastOnlineAt(new Date());
    };

    const handleOffline = () => {
      console.log('📴 Connexion perdue - Mode hors ligne activé');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, lastOnlineAt };
};
