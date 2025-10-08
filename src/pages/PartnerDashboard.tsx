import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Euro, TrendingUp, Share2, Copy, Check, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { usePartnerData } from "@/hooks/usePartnerData";
import { usePartnerReferrals } from "@/hooks/usePartnerReferrals";

const PartnerDashboard: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const { data: partnerData, isLoading: isLoadingPartner } = usePartnerData();
  const { data: referralsData, isLoading: isLoadingReferrals } = usePartnerReferrals();

  const isLoading = isLoadingPartner || isLoadingReferrals;

  // Calculate stats from real data
  const stats = {
    status: partnerData?.status || 'pending',
    totalCommissions: Number(partnerData?.total_commissions || 0),
    pendingCommissions: referralsData
      ?.filter(r => r.status === 'pending')
      .reduce((sum, r) => sum + Number(r.commission_amount), 0) || 0,
    totalReferrals: partnerData?.total_referrals || 0,
    activeReferrals: referralsData?.filter(r => r.status === 'active').length || 0,
    promoCode: partnerData?.referral_code || '',
    commissionRate: Number(partnerData?.commission_rate || 0) * 100
  };

  const copyPromoCode = () => {
    navigator.clipboard.writeText(stats.promoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Code copié !",
      description: "Votre code promo a été copié dans le presse-papier.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspendu</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard Partenaire</h1>
            <p className="text-muted-foreground">Gérez vos parrainages et suivez vos commissions</p>
          </div>
          {getStatusBadge(stats.status)}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commissions totales</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCommissions.toFixed(2)}€</div>
              <p className="text-xs text-muted-foreground">
                Cumulées depuis le début
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commissions en attente</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingCommissions.toFixed(2)}€</div>
              <p className="text-xs text-muted-foreground">
                Paiement le 1er du mois
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total parrainages</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReferrals}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeReferrals} actifs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de commission</CardTitle>
              <Share2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.commissionRate}%</div>
              <p className="text-xs text-muted-foreground">
                Sur chaque abonnement
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Promo Code */}
        <Card>
          <CardHeader>
            <CardTitle>Votre code promo</CardTitle>
            <CardDescription>
              Partagez ce code promo pour gagner des commissions sur chaque nouveau client
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="p-4 bg-muted rounded-lg border font-mono text-2xl font-bold text-center tracking-wider">
                  {stats.promoCode}
                </div>
              </div>
              <Button onClick={copyPromoCode} className="w-full sm:w-auto">
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copier
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Referrals */}
        <Card>
          <CardHeader>
            <CardTitle>Parrainages récents</CardTitle>
            <CardDescription>
              Vos derniers clients parrainés et leurs statuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {referralsData && referralsData.length > 0 ? (
                referralsData.map((referral) => (
                  <div key={referral.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">Client #{referral.customer_id?.slice(0, 8)}</h4>
                      <p className="text-sm text-muted-foreground">
                        Inscrit le {new Date(referral.referred_at).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {referral.subscription_tier}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(referral.status)}
                      <div className="text-right">
                        <div className="font-semibold">{Number(referral.commission_amount).toFixed(2)}€</div>
                        <div className="text-xs text-muted-foreground">Commission</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Aucun parrainage pour le moment. Partagez votre lien pour commencer !
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card>
          <CardHeader>
            <CardTitle>Comment ça marche ?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Share2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">1. Partagez</h3>
                <p className="text-sm text-muted-foreground">
                  Partagez votre code promo avec vos contacts
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">2. Ils s'inscrivent</h3>
                <p className="text-sm text-muted-foreground">
                  Vos contacts utilisent votre code promo lors de l'inscription
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Euro className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">3. Vous gagnez</h3>
                <p className="text-sm text-muted-foreground">
                  Recevez 10% de commission chaque mois
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PartnerDashboard;