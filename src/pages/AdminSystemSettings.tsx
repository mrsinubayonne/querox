import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import ModernSidebar from '@/components/ModernSidebar';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';
import { Settings, CreditCard, Percent, Save } from 'lucide-react';
import { toast } from 'sonner';

const AdminSystemSettings: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, loading: authLoading } = useSubscription();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSave = () => {
    toast.success('Paramètres sauvegardés avec succès');
  };

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
            <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center shadow-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Paramètres Système</h1>
              <p className="text-sm text-muted-foreground">Contrôle total de la plateforme</p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="plans" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="plans">Plans d'Abonnement</TabsTrigger>
              <TabsTrigger value="taxes">Taxes & TVA</TabsTrigger>
            </TabsList>

            <TabsContent value="plans" className="space-y-6">
              {/* Starter Plan */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Plan Starter
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="starter-price">Prix mensuel (FCFA)</Label>
                      <Input id="starter-price" type="number" defaultValue="35000" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="starter-outlets">Nombre de PDV</Label>
                      <Input id="starter-outlets" type="number" defaultValue="1" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="starter-profiles">Nombre de profils</Label>
                      <Input id="starter-profiles" type="number" defaultValue="3" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="starter-features">Fonctionnalités</Label>
                      <Input id="starter-features" defaultValue="Base" />
                    </div>
                  </div>
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </CardContent>
              </Card>

              {/* Premium Plan */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Plan Premium
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="premium-price">Prix mensuel (FCFA)</Label>
                      <Input id="premium-price" type="number" defaultValue="65000" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="premium-outlets">Nombre de PDV</Label>
                      <Input id="premium-outlets" type="number" defaultValue="2" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="premium-profiles">Nombre de profils</Label>
                      <Input id="premium-profiles" type="number" defaultValue="5" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="premium-features">Fonctionnalités</Label>
                      <Input id="premium-features" defaultValue="Avancé" />
                    </div>
                  </div>
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </CardContent>
              </Card>

              {/* Pro/Entreprise Plan */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Plan Pro / Entreprise
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pro-price">Prix mensuel (FCFA)</Label>
                      <Input id="pro-price" type="number" defaultValue="91000" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pro-outlets">Nombre de PDV</Label>
                      <Input id="pro-outlets" type="number" defaultValue="3" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pro-profiles">Nombre de profils</Label>
                      <Input id="pro-profiles" type="number" defaultValue="10" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pro-features">Fonctionnalités</Label>
                      <Input id="pro-features" defaultValue="Complet" />
                    </div>
                  </div>
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="taxes" className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Percent className="w-5 h-5" />
                    Configuration des Taxes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vat-benin">TVA Bénin (%)</Label>
                      <Input id="vat-benin" type="number" defaultValue="18" step="0.01" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vat-ci">TVA Côte d'Ivoire (%)</Label>
                      <Input id="vat-ci" type="number" defaultValue="18" step="0.01" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vat-senegal">TVA Sénégal (%)</Label>
                      <Input id="vat-senegal" type="number" defaultValue="18" step="0.01" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="commission-rate">Taux de commission Querox (%)</Label>
                      <Input id="commission-rate" type="number" defaultValue="5" step="0.01" />
                    </div>
                  </div>
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminSystemSettings;
