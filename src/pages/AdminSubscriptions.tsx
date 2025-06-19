import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, UserPlus, Edit, Calendar, Crown, AlertTriangle } from 'lucide-react';
import ModernSidebar from '@/components/ModernSidebar';
import { useAuth } from '@/contexts/AuthContext';

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

// Remplacez cette adresse email par la vôtre
const ADMIN_EMAIL = 'bayonnecastadorkhloe@gmail.com';

const AdminSubscriptions: React.FC = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedTier, setSelectedTier] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('30');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkAuthorization();
  }, [user]);

  useEffect(() => {
    if (isAuthorized) {
      fetchSubscriptions();
    }
  }, [isAuthorized]);

  const checkAuthorization = () => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Vérifier si l'utilisateur connecté est l'administrateur autorisé
    if (user.email === ADMIN_EMAIL) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas l'autorisation d'accéder à cette interface",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des abonnements:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les abonnements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrUpdateSubscription = async () => {
    if (!searchEmail || !selectedTier) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir l'email et le tier",
        variant: "destructive",
      });
      return;
    }

    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + parseInt(selectedDuration));

      const { error } = await supabase
        .from('subscribers')
        .upsert({
          email: searchEmail,
          subscription_tier: selectedTier,
          subscribed: true,
          subscription_end: endDate.toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Abonnement ${selectedTier} accordé pour ${selectedDuration} jours`,
      });

      setSearchEmail('');
      setSelectedTier('');
      fetchSubscriptions();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer/modifier l'abonnement",
        variant: "destructive",
      });
    }
  };

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

      fetchSubscriptions();
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

      fetchSubscriptions();
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

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Vérification des autorisations...</p>
          </div>
        </div>
      </div>
    );
  }

  // Affichage pour les utilisateurs non autorisés
  if (!isAuthorized) {
    return (
      <div className="flex h-screen bg-gray-50">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Accès Restreint
                </h2>
                <p className="text-gray-600 mb-4">
                  Cette interface d'administration est réservée aux administrateurs autorisés uniquement.
                </p>
                <p className="text-sm text-gray-500">
                  Connecté en tant que: {user?.email || 'Non connecté'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-6">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Administration des Abonnements
            </h1>
            <p className="text-gray-600 mt-2">
              Gérez manuellement les abonnements et accès aux fonctionnalités premium
            </p>
            <div className="mt-2 text-sm text-green-600 font-medium">
              ✓ Connecté en tant qu'administrateur: {user?.email}
            </div>
          </div>

          {/* Formulaire d'ajout/modification */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="w-5 h-5 mr-2" />
                Accorder un Abonnement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email utilisateur</label>
                  <Input
                    placeholder="email@example.com"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tier d'abonnement</label>
                  <Select value={selectedTier} onValueChange={setSelectedTier}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Durée (jours)</label>
                  <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 jours</SelectItem>
                      <SelectItem value="30">30 jours</SelectItem>
                      <SelectItem value="90">90 jours</SelectItem>
                      <SelectItem value="365">365 jours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={createOrUpdateSubscription} className="w-full">
                    Accorder l'abonnement
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des abonnements */}
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
        </div>
      </div>
    </div>
  );
};

export default AdminSubscriptions;
