
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Crown, RefreshCw } from 'lucide-react';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  feature?: string;
}

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ 
  children, 
  feature = "cette fonctionnalité" 
}) => {
  const { user } = useAuth();
  const { isSubscriptionActive, loading, subscription, refetch } = useSubscription();
  const navigate = useNavigate();

  // Forcer un rafraîchissement au montage du composant
  useEffect(() => {
    if (user) {
      console.log('🔄 SubscriptionGuard: Rafraîchissement des données d\'abonnement');
      refetch();
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
    subscription,
    isSubscriptionActive,
    loading
  });

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
            
            {/* Informations de débogage pour l'utilisateur */}
            {subscription && (
              <div className="bg-gray-100 p-3 rounded-lg text-xs text-left">
                <p><strong>Email:</strong> {subscription.email}</p>
                <p><strong>Abonné:</strong> {subscription.subscribed ? 'Oui' : 'Non'}</p>
                <p><strong>Tier:</strong> {subscription.subscription_tier || 'Aucun'}</p>
                <p><strong>Fin:</strong> {subscription.subscription_end || 'Permanent'}</p>
                <p><strong>Dernière MAJ:</strong> {new Date(subscription.updated_at).toLocaleString('fr-FR')}</p>
              </div>
            )}
            
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
