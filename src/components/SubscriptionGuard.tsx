
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Crown, RefreshCw, Shield, AlertTriangle } from 'lucide-react';

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

  // État de débogage consolidé
  const debugInfo = {
    user: user?.email,
    userId: user?.id,
    subscription,
    isSubscriptionActive,
    isAdmin,
    loading
  };

  console.log('🔍 SubscriptionGuard - État consolidé:', debugInfo);

  const handleRefresh = async () => {
    console.log('🔄 Rafraîchissement manuel des données d\'abonnement');
    await refetch();
  };

  // Loading state
  if (loading) {
    console.log('⏳ SubscriptionGuard - Affichage du loading');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Vérification de l'abonnement...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est admin, afficher directement le contenu avec un indicateur
  if (isAdmin) {
    console.log('✅ SubscriptionGuard - Affichage du contenu pour admin');
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

  // Si l'abonnement est actif, afficher le contenu
  if (isSubscriptionActive) {
    console.log('✅ SubscriptionGuard - Affichage du contenu pour utilisateur avec abonnement actif');
    return <>{children}</>;
  }

  // Afficher la page de demande d'abonnement
  console.log('❌ SubscriptionGuard - Affichage de la demande d\'abonnement');
  
  const hasSubscriptionInDB = subscription !== null;
  const subscriptionDetails = subscription ? {
    email: subscription.email,
    subscribed: subscription.subscribed,
    tier: subscription.subscription_tier,
    endDate: subscription.subscription_end ? new Date(subscription.subscription_end).toLocaleDateString('fr-FR') : 'Permanent',
    lastUpdate: new Date(subscription.updated_at).toLocaleString('fr-FR')
  } : null;

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
          
          {/* Alerte si abonnement trouvé mais inactif */}
          {hasSubscriptionInDB && !isSubscriptionActive && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-left">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="font-medium text-yellow-800">Abonnement trouvé mais inactif</span>
              </div>
              <p className="text-sm text-yellow-700">
                Un abonnement existe dans notre système mais il n'est pas actif ou a expiré.
              </p>
            </div>
          )}
          
          {/* Informations de débogage détaillées pour l'utilisateur */}
          <div className="bg-gray-100 p-3 rounded-lg text-xs text-left space-y-2">
            <p><strong>🔍 Informations de diagnostic :</strong></p>
            <p><strong>Email:</strong> {user?.email || 'Non défini'}</p>
            <p><strong>User ID:</strong> {user?.id || 'Non défini'}</p>
            <p><strong>Est Admin:</strong> {isAdmin ? '✅ Oui' : '❌ Non'}</p>
            <p><strong>Abonnement Actif:</strong> {isSubscriptionActive ? '✅ Oui' : '❌ Non'}</p>
            
            {subscriptionDetails ? (
              <>
                <p><strong>Abonnement trouvé:</strong> ✅</p>
                <p><strong>Email abonnement:</strong> {subscriptionDetails.email}</p>
                <p><strong>Abonné:</strong> {subscription?.subscribed ? '✅ Oui' : '❌ Non'}</p>
                <p><strong>Tier:</strong> {subscriptionDetails.tier || 'Aucun'}</p>
                <p><strong>Fin:</strong> {subscriptionDetails.endDate}</p>
                <p><strong>Dernière MAJ:</strong> {subscriptionDetails.lastUpdate}</p>
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
};

export default SubscriptionGuard;
