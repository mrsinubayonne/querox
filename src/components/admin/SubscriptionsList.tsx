
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail } from 'lucide-react';
import SubscriptionCard from './subscriptions/SubscriptionCard';
import EmptySubscriptionsState from './subscriptions/EmptySubscriptionsState';

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

  const changeTier = async (id: string, newTier: string) => {
    try {
      const { error } = await supabase
        .from('subscribers')
        .update({ 
          subscription_tier: newTier,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Tier modifié vers ${newTier}`,
      });

      onSubscriptionUpdated();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le tier",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Abonnements Existants ({subscriptions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {subscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              onToggleStatus={toggleSubscriptionStatus}
              onChangeTier={changeTier}
              onExtendSubscription={extendSubscription}
            />
          ))}
          
          {subscriptions.length === 0 && <EmptySubscriptionsState />}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionsList;
