
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Database, AlertCircle } from 'lucide-react';
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

  console.log('📋 SubscriptionsList - Rendu avec', subscriptions.length, 'abonnements');

  const toggleSubscriptionStatus = async (id: string, currentStatus: boolean) => {
    console.log('🔄 Modification du statut de l\'abonnement:', { id, currentStatus });
    
    try {
      const { error } = await supabase
        .from('subscribers')
        .update({ 
          subscribed: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('❌ Erreur lors de la modification du statut:', error);
        throw error;
      }

      console.log('✅ Statut modifié avec succès');
      toast({
        title: "Succès",
        description: `Abonnement ${!currentStatus ? 'activé' : 'désactivé'}`,
      });

      onSubscriptionUpdated();
    } catch (error: any) {
      console.error('💥 Erreur dans toggleSubscriptionStatus:', error);
      toast({
        title: "Erreur",
        description: `Impossible de modifier le statut: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const extendSubscription = async (id: string, days: number) => {
    console.log('📅 Extension de l\'abonnement:', { id, days });
    
    try {
      const subscription = subscriptions.find(sub => sub.id === id);
      if (!subscription) {
        console.error('❌ Abonnement non trouvé:', id);
        return;
      }

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

      if (error) {
        console.error('❌ Erreur lors de l\'extension:', error);
        throw error;
      }

      console.log('✅ Abonnement étendu avec succès');
      toast({
        title: "Succès",
        description: `Abonnement prolongé de ${days} jours`,
      });

      onSubscriptionUpdated();
    } catch (error: any) {
      console.error('💥 Erreur dans extendSubscription:', error);
      toast({
        title: "Erreur",
        description: `Impossible de prolonger l'abonnement: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const changeTier = async (id: string, newTier: string) => {
    console.log('🏷️ Changement de tier:', { id, newTier });
    
    try {
      const { error } = await supabase
        .from('subscribers')
        .update({ 
          subscription_tier: newTier,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('❌ Erreur lors du changement de tier:', error);
        throw error;
      }

      console.log('✅ Tier modifié avec succès');
      toast({
        title: "Succès",
        description: `Tier modifié vers ${newTier}`,
      });

      onSubscriptionUpdated();
    } catch (error: any) {
      console.error('💥 Erreur dans changeTier:', error);
      toast({
        title: "Erreur",
        description: `Impossible de modifier le tier: ${error.message}`,
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
        
        {/* Informations de débogage pour l'admin */}
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <div className="flex items-center space-x-2">
            <Database className="w-3 h-3" />
            <span>État de la base de données: {subscriptions.length} enregistrement(s) trouvé(s)</span>
          </div>
          {subscriptions.length > 0 && (
            <div className="mt-1">
              <span>Dernière mise à jour: {new Date(Math.max(...subscriptions.map(s => new Date(s.updated_at).getTime()))).toLocaleString('fr-FR')}</span>
            </div>
          )}
        </div>
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
