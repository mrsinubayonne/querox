import { toast } from 'sonner';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  console.log('📋 SubscriptionsList - Rendu avec', subscriptions.length, 'abonnements');

  const toggleSubscriptionStatus = async (id: string, currentStatus: boolean) => {
    try {
      const nowIso = new Date().toISOString();
      const updates: Record<string, any> = {
        subscribed: !currentStatus,
        updated_at: nowIso,
      };
      if (currentStatus) {
        // Désactivation → expire immédiatement
        updates.subscription_end = nowIso;
        updates.subscription_status = 'cancelled';
      } else {
        updates.subscription_status = 'active';
      }

      const { error } = await supabase.from('subscribers').update(updates).eq('id', id);
      if (error) throw error;

      toast.success("Succès", { description: `Abonnement ${!currentStatus ? 'activé' : 'désactivé (expiré immédiatement)'}` });
      onSubscriptionUpdated();
    } catch (error: any) {
      toast.error("Erreur", { description: `Impossible de modifier le statut: ${error.message}` });
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

      const updates: Record<string, any> = {
        subscription_end: currentEnd.toISOString(),
        updated_at: new Date().toISOString(),
      };
      // Si on prolonge (days > 0), on réactive. Si on réduit et que la nouvelle date est passée, on désactive.
      if (days > 0) {
        updates.subscribed = true;
        updates.subscription_status = 'active';
      } else if (currentEnd.getTime() <= Date.now()) {
        updates.subscribed = false;
        updates.subscription_status = 'expired';
      }

      const { error } = await supabase.from('subscribers').update(updates).eq('id', id);
      if (error) throw error;

      toast.success("Succès", {
        description: days >= 0
          ? `Abonnement prolongé de ${days} jours`
          : `Abonnement réduit de ${Math.abs(days)} jours`,
      });
      onSubscriptionUpdated();
    } catch (error: any) {
      toast.error("Erreur", { description: `Impossible de modifier la durée: ${error.message}` });
    }
  };

  const setCustomEndDate = async (id: string, dateIso: string) => {
    try {
      const end = new Date(dateIso);
      if (isNaN(end.getTime())) {
        toast.error("Erreur", { description: "Date invalide" });
        return;
      }
      const isPast = end.getTime() <= Date.now();
      const { error } = await supabase
        .from('subscribers')
        .update({
          subscription_end: end.toISOString(),
          subscribed: !isPast,
          subscription_status: isPast ? 'expired' : 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;

      toast.success("Succès", { description: `Date d'expiration fixée au ${end.toLocaleDateString('fr-FR')}` });
      onSubscriptionUpdated();
    } catch (error: any) {
      toast.error("Erreur", { description: `Impossible de fixer la date: ${error.message}` });
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
      toast.success("Succès", { description: `Tier modifié vers ${newTier}` });

      onSubscriptionUpdated();
    } catch (error: any) {
      console.error('💥 Erreur dans changeTier:', error);
      toast.error("Erreur", { description: `Impossible de modifier le tier: ${error.message}` });
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
