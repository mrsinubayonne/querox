
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Mail, UserCheck, UserX, Clock } from 'lucide-react';

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

  const getStatusBadge = (subscription: Subscription) => {
    if (!subscription.subscribed) {
      return <Badge variant="destructive" className="flex items-center gap-1"><UserX className="w-3 h-3" />Inactif</Badge>;
    }

    if (subscription.subscription_end) {
      const endDate = new Date(subscription.subscription_end);
      const now = new Date();
      
      if (endDate < now) {
        return <Badge variant="destructive" className="flex items-center gap-1"><Clock className="w-3 h-3" />Expiré</Badge>;
      }
      
      const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysLeft <= 7) {
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="w-3 h-3" />Expire dans {daysLeft} jour(s)</Badge>;
      }
      
      return <Badge variant="default" className="flex items-center gap-1"><UserCheck className="w-3 h-3" />Actif ({daysLeft} jours)</Badge>;
    }

    return <Badge variant="default" className="flex items-center gap-1"><UserCheck className="w-3 h-3" />Actif (permanent)</Badge>;
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
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Abonnements Existants ({subscriptions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {subscriptions.map((subscription) => (
            <div key={subscription.id} className="border rounded-lg p-6 bg-white shadow-sm">
              <div className="space-y-4">
                {/* En-tête avec email et statuts */}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <h4 className="font-semibold text-lg text-gray-900">{subscription.email}</h4>
                    </div>
                    <div className="flex items-center space-x-3 mb-3">
                      {getStatusBadge(subscription)}
                      {getTierBadge(subscription.subscription_tier)}
                    </div>
                  </div>
                </div>

                {/* Informations détaillées */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p><strong>Créé le:</strong> {new Date(subscription.created_at).toLocaleDateString('fr-FR')}</p>
                    <p><strong>Mis à jour:</strong> {new Date(subscription.updated_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div>
                    {subscription.subscription_end && (
                      <p><strong>Expire le:</strong> {new Date(subscription.subscription_end).toLocaleDateString('fr-FR')}</p>
                    )}
                    <p><strong>ID:</strong> {subscription.id.slice(0, 8)}...</p>
                  </div>
                </div>

                {/* Actions de gestion */}
                <div className="border-t pt-4">
                  <h5 className="font-medium text-gray-900 mb-3">Actions de gestion</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Changement de statut */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Statut</label>
                      <Button
                        size="sm"
                        variant={subscription.subscribed ? "destructive" : "default"}
                        onClick={() => toggleSubscriptionStatus(subscription.id, subscription.subscribed)}
                        className="w-full"
                      >
                        {subscription.subscribed ? (
                          <>
                            <UserX className="w-4 h-4 mr-1" />
                            Désactiver
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4 mr-1" />
                            Activer
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Changement de tier */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Modifier le tier</label>
                      <Select onValueChange={(value) => changeTier(subscription.id, value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Changer tier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="starter">Starter</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="pro">Pro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Extension de durée */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Prolonger</label>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => extendSubscription(subscription.id, 7)}
                          className="flex-1"
                        >
                          <Calendar className="w-3 h-3 mr-1" />
                          +7j
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => extendSubscription(subscription.id, 30)}
                          className="flex-1"
                        >
                          <Calendar className="w-3 h-3 mr-1" />
                          +30j
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => extendSubscription(subscription.id, 90)}
                          className="flex-1"
                        >
                          <Calendar className="w-3 h-3 mr-1" />
                          +90j
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {subscriptions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Aucun abonnement trouvé</h3>
              <p>Utilisez le formulaire ci-dessus pour créer le premier abonnement.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionsList;
