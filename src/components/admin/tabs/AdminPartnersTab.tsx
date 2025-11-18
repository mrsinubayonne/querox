import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Handshake, TrendingUp, DollarSign, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const AdminPartnersTab: React.FC = () => {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalReferrals: 0,
    totalCommissions: 0
  });
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const total = data?.length || 0;
      const active = data?.filter(p => p.status === 'active').length || 0;
      const totalReferrals = data?.reduce((sum, p) => sum + (p.total_referrals || 0), 0) || 0;
      const totalCommissions = data?.reduce((sum, p) => sum + (Number(p.total_commissions) || 0), 0) || 0;

      setStats({ total, active, totalReferrals, totalCommissions });
      setPartners(data || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des partenaires');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="space-y-4">
      {[1, 2, 3].map(i => <Card key={i} className="animate-pulse"><CardContent className="h-32" /></Card>)}
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardDescription>Partenaires Totaux</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Handshake className="w-4 h-4 mr-2" />
              Tous statuts
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardDescription>Partenaires Actifs</CardDescription>
            <CardTitle className="text-3xl">{stats.active}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4 mr-2" />
              En activité
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardDescription>Parrainages</CardDescription>
            <CardTitle className="text-3xl">{stats.totalReferrals}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="w-4 h-4 mr-2" />
              Total références
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardDescription>Commissions</CardDescription>
            <CardTitle className="text-3xl">{stats.totalCommissions.toFixed(2)}€</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4 mr-2" />
              Total versé
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Partenaires</CardTitle>
          <CardDescription>Tous les partenaires de la plateforme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {partners.map(partner => (
              <div key={partner.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <p className="font-semibold">{partner.company_name}</p>
                  <p className="text-sm text-muted-foreground">{partner.company_type}</p>
                  <div className="flex gap-4 mt-2">
                    <p className="text-xs text-muted-foreground">
                      Code: {partner.referral_code}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Parrainages: {partner.total_referrals}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Commission: {(Number(partner.commission_rate) * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{Number(partner.total_commissions).toFixed(2)}€</p>
                  <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                    partner.status === 'active' ? 'bg-green-100 text-green-800' :
                    partner.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {partner.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
