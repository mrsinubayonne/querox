
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { refetch, subscription, isSubscriptionActive } = useSubscription();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    // Force refresh subscription after payment
    const verify = async () => {
      setVerifying(true);
      try {
        // Wait a moment for webhook to process
        await new Promise(r => setTimeout(r, 2000));
        await refetch(true); // force refresh
      } catch {
        // ignore
      } finally {
        setVerifying(false);
      }
    };
    verify();
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 bg-success/10 rounded-full flex items-center justify-center">
            {verifying ? (
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            ) : (
              <Check className="h-8 w-8 text-success" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-success">
            {verifying ? 'Vérification en cours...' : 'Paiement réussi !'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {verifying ? (
            <p className="text-muted-foreground">
              Nous vérifions votre paiement et activons votre abonnement...
            </p>
          ) : (
            <>
              <p className="text-muted-foreground">
                Votre abonnement QUEROX{' '}
                {subscription?.subscription_tier && (
                  <span className="font-semibold text-foreground capitalize">
                    {subscription.subscription_tier}
                  </span>
                )}{' '}
                a été activé avec succès.
              </p>
              {subscription?.subscription_end && (
                <p className="text-sm text-muted-foreground">
                  Valide jusqu'au{' '}
                  <span className="font-medium">
                    {new Date(subscription.subscription_end).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </p>
              )}
            </>
          )}
          <div className="space-y-2 pt-2">
            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full"
              disabled={verifying}
            >
              Accéder au tableau de bord
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

export default PaymentSuccess;
