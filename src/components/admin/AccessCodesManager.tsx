import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Key, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getPlanBadgeClass, getPlanDisplayName } from '@/utils/subscriptionPlans';

interface AccessCodeRecord {
  id: string;
  user_id: string;
  accounting_code: string;
  management_code: string;
  last_modified_at: string;
  email?: string;
  subscription_tier?: string;
  subscription_status?: string;
}

const AccessCodesManager: React.FC = () => {
  const [codes, setCodes] = useState<AccessCodeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAccessCodes();
  }, []);

  const fetchAccessCodes = async () => {
    setLoading(true);
    try {
      // Vérifier si l'utilisateur est admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roleData) {
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les permissions pour voir cette page",
          variant: "destructive"
        });
        return;
      }

      // Récupérer tous les codes d'accès avec les infos des abonnements
      const { data, error } = await supabase
        .from('user_access_codes')
        .select(`
          *,
          profiles:user_id(email),
          subscribers:user_id(subscription_tier, subscription_status)
        `)
        .order('last_modified_at', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        accounting_code: item.accounting_code,
        management_code: item.management_code,
        last_modified_at: item.last_modified_at,
        email: item.profiles?.email,
        subscription_tier: item.subscribers?.subscription_tier,
        subscription_status: item.subscribers?.subscription_status
      })) || [];

      setCodes(formattedData);
    } catch (error: any) {
      console.error('Error fetching access codes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les codes d'accès",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTierBadgeColor = (tier?: string) => {
    return getPlanBadgeClass(tier);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Codes d'accès des clients</h2>
          <p className="text-muted-foreground">
            Historique des modifications de codes d'accès
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {codes.length} client{codes.length > 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid gap-4">
        {codes.map((record) => (
          <Card key={record.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg">{record.email || 'Email non disponible'}</h3>
                  {record.subscription_tier && (
                    <Badge className={getTierBadgeColor(record.subscription_tier)}>
                      {getPlanDisplayName(record.subscription_tier)}
                    </Badge>
                  )}
                  {record.subscription_status && (
                    <Badge variant={record.subscription_status === 'active' ? 'default' : 'secondary'}>
                      {record.subscription_status}
                    </Badge>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Key className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-blue-600 font-medium">Comptabilité/Stats/Inventaire</p>
                      <p className="font-mono font-bold text-blue-900">{record.accounting_code}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <Key className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-xs text-green-600 font-medium">Menus/Paramètres/Équipe</p>
                      <p className="font-mono font-bold text-green-900">{record.management_code}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Dernière modification : {formatDate(record.last_modified_at)}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {codes.length === 0 && (
          <Card className="p-12 text-center">
            <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Aucun code d'accès</h3>
            <p className="text-muted-foreground">
              Les modifications de codes d'accès apparaîtront ici
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AccessCodesManager;
