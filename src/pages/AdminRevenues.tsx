import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import ModernSidebar from '@/components/ModernSidebar';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';
import { DollarSign, TrendingUp, Globe, MapPin, ChefHat, PiggyBank, CreditCard } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminRevenues: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, loading: authLoading } = useSubscription();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (authLoading) {
    return (
      <div className="flex h-screen bg-background">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen bg-background">
        <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <UnauthorizedAccess userEmail={user?.email} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <ModernSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Revenus & Finances</h1>
              <p className="text-sm text-muted-foreground">Vue détaillée des revenus Querox</p>
            </div>
          </div>

          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium opacity-90">Revenu Net Querox</span>
                  <PiggyBank className="w-5 h-5 opacity-90" />
                </div>
                <div className="text-3xl font-bold">0 FCFA</div>
                <p className="text-xs opacity-80 mt-1">Revenu après déductions</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Commissions</span>
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div className="text-3xl font-bold">0 FCFA</div>
                <p className="text-xs text-muted-foreground mt-1">Frais de plateforme</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Taxes</span>
                  <DollarSign className="w-5 h-5 text-orange-500" />
                </div>
                <div className="text-3xl font-bold">0 FCFA</div>
                <p className="text-xs text-muted-foreground mt-1">TVA et autres taxes</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Croissance</span>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-3xl font-bold">+0%</div>
                <p className="text-xs text-muted-foreground mt-1">vs mois dernier</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="countries" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="countries">Par Pays</TabsTrigger>
              <TabsTrigger value="cities">Par Ville</TabsTrigger>
              <TabsTrigger value="types">Par Type de Restaurant</TabsTrigger>
            </TabsList>

            <TabsContent value="countries" className="space-y-4">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Répartition par Pays
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { country: 'Bénin', revenue: 0, restaurants: 0, flag: '🇧🇯' },
                      { country: 'Côte d\'Ivoire', revenue: 0, restaurants: 0, flag: '🇨🇮' },
                      { country: 'Sénégal', revenue: 0, restaurants: 0, flag: '🇸🇳' },
                    ].map((item) => (
                      <div key={item.country} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{item.flag}</span>
                          <div>
                            <p className="font-semibold">{item.country}</p>
                            <p className="text-sm text-muted-foreground">{item.restaurants} restaurants</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">{item.revenue.toLocaleString('fr-FR')} FCFA</p>
                          <p className="text-sm text-muted-foreground">revenu mensuel</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cities" className="space-y-4">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Répartition par Ville
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { city: 'Cotonou', country: 'Bénin', revenue: 0, restaurants: 0 },
                      { city: 'Abidjan', country: 'Côte d\'Ivoire', revenue: 0, restaurants: 0 },
                      { city: 'Dakar', country: 'Sénégal', revenue: 0, restaurants: 0 },
                    ].map((item) => (
                      <div key={item.city} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-semibold">{item.city}</p>
                          <p className="text-sm text-muted-foreground">{item.country} • {item.restaurants} restaurants</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">{item.revenue.toLocaleString('fr-FR')} FCFA</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="types" className="space-y-4">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChefHat className="w-5 h-5" />
                    Répartition par Type de Restaurant
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { type: 'Restaurant traditionnel', revenue: 0, count: 0, icon: '🍽️' },
                      { type: 'Fast-food', revenue: 0, count: 0, icon: '🍔' },
                      { type: 'Bar/Café', revenue: 0, count: 0, icon: '☕' },
                      { type: 'Hôtel Restaurant', revenue: 0, count: 0, icon: '🏨' },
                    ].map((item) => (
                      <div key={item.type} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <p className="font-semibold">{item.type}</p>
                            <p className="text-sm text-muted-foreground">{item.count} établissements</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">{item.revenue.toLocaleString('fr-FR')} FCFA</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminRevenues;
