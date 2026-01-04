import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';

export const NetworkStatusBanner = () => {
  const { status, isOffline, isUnstable, retryConnection } = useNetworkStatus();
  const [wasOffline, setWasOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // Show toast when connection is restored
  useEffect(() => {
    if (wasOffline && status === 'online') {
      toast({
        title: 'Connexion rétablie',
        description: 'Votre connexion internet est de nouveau stable.',
      });
    }
    setWasOffline(isOffline || isUnstable);
  }, [status, wasOffline, isOffline, isUnstable]);

  const handleRetry = async () => {
    setIsRetrying(true);
    retryConnection();
    // Small delay to show loading state
    setTimeout(() => setIsRetrying(false), 1000);
  };

  if (status === 'online') {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] px-4 py-3 flex items-center justify-center gap-3 text-sm font-medium ${
        isOffline
          ? 'bg-destructive text-destructive-foreground'
          : 'bg-orange-500 text-white'
      }`}
    >
      {isOffline ? (
        <WifiOff className="h-4 w-4 flex-shrink-0" />
      ) : (
        <Wifi className="h-4 w-4 flex-shrink-0" />
      )}
      
      <span className="text-center">
        {isOffline
          ? 'Vous êtes hors ligne. Vérifiez votre connexion internet.'
          : 'Connexion internet instable. Certaines fonctionnalités peuvent ne pas fonctionner.'}
      </span>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleRetry}
        disabled={isRetrying}
        className="h-7 px-2 text-current hover:bg-white/20"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
        <span className="ml-1.5 hidden sm:inline">Réessayer</span>
      </Button>
    </div>
  );
};
