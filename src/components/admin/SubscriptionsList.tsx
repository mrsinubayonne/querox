
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar } from 'lucide-react';

interface Subscription {
  id: string;
  user_id: string;
  email: string;
  subscribed: boolean;
  subscription_tier: string;
  subscription_end: string | null;
  created_at: string;
  updated_at: string;
}

interface SubscriptionsListProps {
  subscriptions: Subscription[];
  onSubscriptionUpdated: () => void;
}

const SubscriptionsList: React.FC<SubscriptionsListProps> = ({ 
  subscriptions, 
  onSubscriptionUpdated 
}) => {
  const { toast } = useToast();

  const toggleSubscriptionStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('subscribers')
        .update({ 
          subscribed: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Abonnement ${!currentStatus ? 'activé' : 'désactivé'}`,
      });

      onSubscriptionUpdated();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive",
      });
    }
  };

  const extendSubscription = async (id: string, days: number) => {
    try {
      const subscription = subscriptions.find(sub => sub.id === id);
      if (!subscription) return;

      const currentEnd = subscription.subscription_end 
        ? new Date(subscription.subscription_end)
        : new Date();
      
      currentEnd.setDate(currentEnd.getDate() + days);

      const { error } = await supabase
        .from('subscribers')
        .update({ 
          subscription_end: currentEnd.toISOString(),
          subscribed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Abonnement prolongé de ${days} jours`,
      });

      onSubscriptionUpdated();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de prolonger l'abonnement",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (subscription: Subscription) => {
    if (!subscription.subscribed) {
      return <Badge variant="destructive">Inactif</Badge>;
    }

    if (subscription.subscription_end) {
      const endDate = new Date(subscription.subscription_end);
      const now = new Date();
      
      if (endDate < now) {
        return <Badge variant="destructive">Expiré</Badge>;
      }
      
      const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysLeft <= 7) {
        return <Badge variant="secondary">Expire dans {daysLeft} jour(s)</Badge>;
      }
      
      return <Badge variant="default">Actif ({daysLeft} jours)</Badge>;
    }

    return <Badge variant="default">Actif (permanent)</Badge>;
  };

  const getTierBadge = (tier: string) => {
    const colors = {
      starter: 'bg-green-100 text-green-800',
      premium: 'bg-blue-100 text-blue-800',
      pro: 'bg-purple-100 text-purple-800'
    };

    return (
      <Badge className={colors[tier as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {tier?.toUpperCase() || 'AUCUN'}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Abonnements Existants ({subscriptions.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {subscriptions.map((subscription) => (
            <div key={subscription.id} className="border rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium">{subscription.email}</h4>
                    {getStatusBadge(subscription)}
                    {getTierBadge(subscription.subscription_tier)}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Créé le: {new Date(subscription.created_at).toLocaleDateString('fr-FR')}</p>
                    {subscription.subscription_end && (
                      <p>Expire le: {new Date(subscription.subscription_end).toLocaleDateString('fr-FR')}</p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleSubscriptionStatus(subscription.id, subscription.subscribed)}
                  >
                    {subscription.subscribed ? 'Désactiver' : 'Activer'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => extendSubscription(subscription.id, 30)}
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    +30 jours
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {subscriptions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucun abonnement trouvé
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionsList;
