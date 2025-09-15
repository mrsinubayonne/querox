import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Euro, TrendingUp, Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

const PartnerDashboard: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Données simulées pour l'exemple
  const partnerData = {
    status: 'active', // pending, active, suspended
    totalCommissions: 1247.50,
    pendingCommissions: 324.80,
    totalReferrals: 8,
    activeReferrals: 6,
    referralLink: 'https://querox.com/ref/PART123',
    commissionRate: 10
  };

  const recentReferrals = [
    { id: 1, customerName: 'Restaurant Le Soleil', date: '2024-01-15', status: 'active', commission: 159.90 },
    { id: 2, customerName: 'Bistro Central', date: '2024-01-10', status: 'active', commission: 129.90 },
    { id: 3, customerName: 'Café des Arts', date: '2024-01-05', status: 'pending', commission: 89.90 },
  ];

  const copyReferralLink = () => {
    navigator.clipboard.writeText(partnerData.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Lien copié !",
      description: "Votre lien de parrainage a été copié dans le presse-papier.",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard Partenaire</h1>
            <p className="text-muted-foreground">Gérez vos parrainages et suivez vos commissions</p>
          </div>
          {getStatusBadge(partnerData.status)}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commissions totales</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{partnerData.totalCommissions.toFixed(2)}€</div>
              <p className="text-xs text-muted-foreground">
                +12% par rapport au mois dernier
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commissions en attente</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{partnerData.pendingCommissions.toFixed(2)}€</div>
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
              <div className="text-2xl font-bold">{partnerData.totalReferrals}</div>
              <p className="text-xs text-muted-foreground">
                {partnerData.activeReferrals} actifs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de commission</CardTitle>
              <Share2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{partnerData.commissionRate}%</div>
              <p className="text-xs text-muted-foreground">
                Sur chaque abonnement
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link */}
        <Card>
          <CardHeader>
            <CardTitle>Votre lien de parrainage</CardTitle>
            <CardDescription>
              Partagez ce lien pour gagner des commissions sur chaque nouveau client
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="p-3 bg-muted rounded-lg border font-mono text-sm">
                  {partnerData.referralLink}
                </div>
              </div>
              <Button onClick={copyReferralLink} className="w-full sm:w-auto">
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
              {recentReferrals.map((referral) => (
                <div key={referral.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold">{referral.customerName}</h4>
                    <p className="text-sm text-muted-foreground">
                      Inscrit le {new Date(referral.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(referral.status)}
                    <div className="text-right">
                      <div className="font-semibold">{referral.commission.toFixed(2)}€</div>
                      <div className="text-xs text-muted-foreground">Commission</div>
                    </div>
                  </div>
                </div>
              ))}
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
                  Partagez votre lien de parrainage avec vos contacts
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">2. Ils s'inscrivent</h3>
                <p className="text-sm text-muted-foreground">
                  Vos contacts utilisent votre lien pour s'abonner
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