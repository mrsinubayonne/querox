
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Crown, RefreshCw, Shield } from 'lucide-react';
import { useTeamPermissions } from '@/hooks/useTeamPermissions';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  feature?: string;
}

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ 
  children, 
  feature = "cette fonctionnalité" 
}) => {
  const { isSubscriptionActive, loading, refetch, isAdmin, subscription, hasCachedData } = useSubscription();
  const navigate = useNavigate();
  const { isTeamMember } = useTeamPermissions();

  const handleRefresh = async () => {
    console.log('🔄 Rafraîchissement manuel de l\'abonnement');
    await refetch();
  };

  // Si admin, pas besoin de vérifier l'abonnement
  if (isAdmin) {
    return (
      <div className="relative">
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 shadow-lg">
            <Shield className="w-3 h-3" />
            <span>Mode Admin</span>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // Allow team members to bypass subscription checks (after admin check)
  if (isTeamMember()) {
    return <>{children}</>;
  }

  // Déterminer si on a des données connues (cache ou subscription existante)
  const hasKnownSubscription = !!subscription || hasCachedData;
  
  // Ne bloquer que lors du tout premier chargement sans aucune donnée
  const isInitialLoading = loading && !hasKnownSubscription && !isAdmin;
  
  if (isInitialLoading) {
    console.log('⏳ Chargement initial de l\'abonnement...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Vérification de l'abonnement...</p>
        </div>
      </div>
    );
  }

  // Si on est en train de refetch mais qu'on a déjà des données, on laisse passer
  if (loading && hasKnownSubscription) {
    console.log('🔄 Refetch en cours, utilisation des données existantes');
  }

  // Vérifier l'abonnement
  const isActive = isSubscriptionActive ||
    (subscription?.subscription_status === 'active') ||
    (subscription?.subscribed && (!subscription?.subscription_end || new Date(subscription.subscription_end) > new Date()));

  console.log('🔐 SubscriptionGuard check:', {
    isActive,
    tier: subscription?.subscription_tier,
    status: subscription?.subscription_status,
    hasSubscription: !!subscription,
    hasCachedData,
    loading
  });

  if (isActive) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">
            Abonnement requis
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Pour accéder à {feature}, vous devez avoir un abonnement QUEROX actif.
          </p>
          
          <div className="space-y-2">
            <Button 
              onClick={handleRefresh}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser le statut
            </Button>
            <Button 
              onClick={() => navigate('/abonnement')}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Crown className="w-4 h-4 mr-2" />
              Choisir un abonnement
            </Button>
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full"
            >
              Retour à l'accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionGuard;
