
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Crown, RefreshCw, Shield } from 'lucide-react';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  feature?: string;
}

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ 
  children, 
  feature = "cette fonctionnalité" 
}) => {
  const { user } = useAuth();
  const { isSubscriptionActive, loading, subscription, refetch, isAdmin } = useSubscription();
  const navigate = useNavigate();

  // Forcer un rafraîchissement au montage du composant et périodiquement
  useEffect(() => {
    if (user) {
      console.log('🔄 SubscriptionGuard: Rafraîchissement des données d\'abonnement au montage');
      refetch();
      
      // Rafraîchir toutes les 10 secondes pendant les 2 premières minutes
      const aggressiveRefresh = setInterval(() => {
        console.log('🔄 SubscriptionGuard: Rafraîchissement agressif');
        refetch();
      }, 10000);
      
      // Arrêter le rafraîchissement agressif après 2 minutes
      setTimeout(() => {
        clearInterval(aggressiveRefresh);
        console.log('⏹️ Arrêt du rafraîchissement agressif');
      }, 120000);
      
      return () => clearInterval(aggressiveRefresh);
    }
  }, [user, refetch]);

  const handleRefresh = async () => {
    console.log('🔄 Rafraîchissement manuel des données d\'abonnement');
    await refetch();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Vérification de l'abonnement...</p>
        </div>
      </div>
    );
  }

  // Informations de débogage dans la console
  console.log('🔍 SubscriptionGuard - État actuel:', {
    user: user?.email,
    userId: user?.id,
    subscription,
    isSubscriptionActive,
    isAdmin,
    loading
  });

  // Si l'utilisateur est admin, afficher directement le contenu avec un indicateur
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

  if (!isSubscriptionActive) {
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
            
            {/* Informations de débogage détaillées pour l'utilisateur */}
            <div className="bg-gray-100 p-3 rounded-lg text-xs text-left space-y-2">
              <p><strong>🔍 Informations de diagnostic :</strong></p>
              <p><strong>Email:</strong> {user?.email || 'Non défini'}</p>
              <p><strong>User ID:</strong> {user?.id || 'Non défini'}</p>
              {subscription ? (
                <>
                  <p><strong>Abonnement trouvé:</strong> ✅</p>
                  <p><strong>Email abonnement:</strong> {subscription.email}</p>
                  <p><strong>Abonné:</strong> {subscription.subscribed ? '✅ Oui' : '❌ Non'}</p>
                  <p><strong>Tier:</strong> {subscription.subscription_tier || 'Aucun'}</p>
                  <p><strong>Fin:</strong> {subscription.subscription_end ? new Date(subscription.subscription_end).toLocaleDateString('fr-FR') : 'Permanent'}</p>
                  <p><strong>Dernière MAJ:</strong> {new Date(subscription.updated_at).toLocaleString('fr-FR')}</p>
                </>
              ) : (
                <p><strong>Abonnement trouvé:</strong> ❌ Aucun</p>
              )}
            </div>
            
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
  }

  return <>{children}</>;
};

export default SubscriptionGuard;
