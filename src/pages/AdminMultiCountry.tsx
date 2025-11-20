import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import ModernSidebar from '@/components/ModernSidebar';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';
import { Globe, MapPin, DollarSign, Users } from 'lucide-react';

const AdminMultiCountry: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, loading: authLoading } = useSubscription();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const countries = [
    { 
      id: 'BJ', 
      name: 'Bénin', 
      flag: '🇧🇯', 
      active: true, 
      currency: 'FCFA', 
      tax: 18,
      restaurants: 0,
      revenue: 0
    },
    { 
      id: 'CI', 
      name: 'Côte d\'Ivoire', 
      flag: '🇨🇮', 
      active: false, 
      currency: 'FCFA', 
      tax: 18,
      restaurants: 0,
      revenue: 0
    },
    { 
      id: 'SN', 
      name: 'Sénégal', 
      flag: '🇸🇳', 
      active: false, 
      currency: 'FCFA', 
      tax: 18,
      restaurants: 0,
      revenue: 0
    },
    { 
      id: 'TG', 
      name: 'Togo', 
      flag: '🇹🇬', 
      active: false, 
      currency: 'FCFA', 
      tax: 18,
      restaurants: 0,
      revenue: 0
    },
  ];

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
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Mode Multi-Pays</h1>
              <p className="text-sm text-muted-foreground">Expansion et gestion internationale</p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Pays actifs</span>
                  <Globe className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-3xl font-bold">
                  {countries.filter(c => c.active).length} / {countries.length}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Restaurants total</span>
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-3xl font-bold">
                  {countries.reduce((sum, c) => sum + c.restaurants, 0)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Revenu global</span>
                  <DollarSign className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-3xl font-bold">
                  {countries.reduce((sum, c) => sum + c.revenue, 0).toLocaleString('fr-FR')} FCFA
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Countries List */}
          <div className="space-y-4">
            {countries.map((country) => (
              <Card key={country.id} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{country.flag}</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-semibold">{country.name}</h3>
                          {country.active && (
                            <Badge variant="default" className="bg-green-500">
                              Actif
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {country.currency}
                          </span>
                          <span>TVA: {country.tax}%</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {country.restaurants} restaurants
                          </span>
                        </div>
                        <div className="mt-2">
                          <span className="text-sm font-semibold">
                            Revenu: {country.revenue.toLocaleString('fr-FR')} {country.currency}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Switch checked={country.active} />
                      <span className="text-xs text-muted-foreground">
                        {country.active ? 'Désactiver' : 'Activer'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Future Expansion */}
          <Card className="border-0 shadow-lg border-dashed border-2">
            <CardContent className="p-8 text-center">
              <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Expansion Future</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Prêt à étendre Querox dans d'autres pays africains
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="outline">🇬🇭 Ghana</Badge>
                <Badge variant="outline">🇳🇬 Nigeria</Badge>
                <Badge variant="outline">🇰🇪 Kenya</Badge>
                <Badge variant="outline">🇿🇦 Afrique du Sud</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminMultiCountry;
