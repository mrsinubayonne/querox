import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import ModernSidebar from '@/components/ModernSidebar';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';
import { Settings, CreditCard, Percent, Save, Mail, Bell, Database, Shield, Globe, Zap } from 'lucide-react';
import { toast } from 'sonner';

const AdminSystemSettings: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, loading: authLoading } = useSubscription();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // États pour les paramètres
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

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
              <p className="text-sm text-muted-foreground">Configuration complète de la plateforme Querox</p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="plans" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 mb-6">
              <TabsTrigger value="plans">Plans</TabsTrigger>
              <TabsTrigger value="taxes">Taxes</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="security">Sécurité</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            {/* Plans d'Abonnement */}
            <TabsContent value="plans" className="space-y-6">
              {/* Starter Plan */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-500" />
                    Plan Starter
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="starter-features">Fonctionnalités incluses</Label>
                    <Textarea 
                      id="starter-features" 
                      placeholder="Listez les fonctionnalités..."
                      defaultValue="Menu digital, Gestion des commandes, Statistiques de base, Support email"
                    />
                  </div>
                  <Button onClick={handleSave} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder le plan Starter
                  </Button>
                </CardContent>
              </Card>

              {/* Premium Plan */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-purple-500" />
                    Plan Premium
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="premium-features">Fonctionnalités incluses</Label>
                    <Textarea 
                      id="premium-features" 
                      placeholder="Listez les fonctionnalités..."
                      defaultValue="Toutes les fonctionnalités Starter + Gestion des tables, Réservations, CRM, Reports avancés, Support prioritaire"
                    />
                  </div>
                  <Button onClick={handleSave} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder le plan Premium
                  </Button>
                </CardContent>
              </Card>

              {/* Pro/Entreprise Plan */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-amber-500" />
                    Plan Pro / Entreprise
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pro-features">Fonctionnalités incluses</Label>
                    <Textarea 
                      id="pro-features" 
                      placeholder="Listez les fonctionnalités..."
                      defaultValue="Toutes les fonctionnalités Premium + Multi-établissements, API access, White-label, Support dédié 24/7, Formation personnalisée"
                    />
                  </div>
                  <Button onClick={handleSave} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder le plan Pro
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Taxes & TVA */}
            <TabsContent value="taxes" className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Percent className="w-5 h-5" />
                    Configuration des Taxes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
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
                  
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-3">Frais de transaction</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="transaction-fee">Frais par transaction (FCFA)</Label>
                        <Input id="transaction-fee" type="number" defaultValue="0" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="payment-gateway-fee">Frais passerelle de paiement (%)</Label>
                        <Input id="payment-gateway-fee" type="number" defaultValue="2.5" step="0.01" />
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleSave} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder les paramètres fiscaux
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Configuration Email */}
            <TabsContent value="email" className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Serveur SMTP
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtp-host">Hôte SMTP</Label>
                      <Input id="smtp-host" placeholder="smtp.example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp-port">Port</Label>
                      <Input id="smtp-port" type="number" defaultValue="587" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp-user">Utilisateur</Label>
                      <Input id="smtp-user" type="email" placeholder="noreply@querox.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp-pass">Mot de passe</Label>
                      <Input id="smtp-pass" type="password" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-from">Email expéditeur</Label>
                    <Input id="email-from" type="email" defaultValue="support@querox.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-signature">Signature email</Label>
                    <Textarea 
                      id="email-signature" 
                      placeholder="Signature qui apparaîtra dans tous les emails..."
                      defaultValue="Cordialement,&#10;L'équipe Querox&#10;www.querox.com"
                    />
                  </div>
                  <Button onClick={handleSave} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder la configuration email
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Gestion des Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="notif-email">Notifications par email</Label>
                        <p className="text-sm text-muted-foreground">Envoyer des notifications par email aux utilisateurs</p>
                      </div>
                      <Switch 
                        id="notif-email" 
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="notif-orders">Alertes nouvelles commandes</Label>
                        <p className="text-sm text-muted-foreground">Notifier les restaurants des nouvelles commandes</p>
                      </div>
                      <Switch id="notif-orders" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="notif-payments">Alertes paiements</Label>
                        <p className="text-sm text-muted-foreground">Notifier des paiements reçus et échoués</p>
                      </div>
                      <Switch id="notif-payments" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="notif-expiry">Alertes expiration abonnement</Label>
                        <p className="text-sm text-muted-foreground">Prévenir les utilisateurs 7 jours avant l'expiration</p>
                      </div>
                      <Switch id="notif-expiry" defaultChecked />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notif-frequency">Fréquence des résumés</Label>
                    <Input id="notif-frequency" defaultValue="daily" />
                  </div>

                  <Button onClick={handleSave} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder les notifications
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sécurité */}
            <TabsContent value="security" className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Paramètres de Sécurité
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="maintenance-mode">Mode maintenance</Label>
                        <p className="text-sm text-muted-foreground">Désactiver temporairement l'accès à la plateforme</p>
                      </div>
                      <Switch 
                        id="maintenance-mode" 
                        checked={maintenanceMode}
                        onCheckedChange={setMaintenanceMode}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="two-factor">Authentification à deux facteurs</Label>
                        <p className="text-sm text-muted-foreground">Obliger la 2FA pour tous les administrateurs</p>
                      </div>
                      <Switch 
                        id="two-factor" 
                        checked={twoFactorAuth}
                        onCheckedChange={setTwoFactorAuth}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="auto-backup">Sauvegardes automatiques</Label>
                        <p className="text-sm text-muted-foreground">Backup quotidien de la base de données</p>
                      </div>
                      <Switch 
                        id="auto-backup" 
                        checked={autoBackup}
                        onCheckedChange={setAutoBackup}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="session-timeout">Timeout de session (minutes)</Label>
                      <Input id="session-timeout" type="number" defaultValue="60" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-login-attempts">Tentatives de connexion max</Label>
                      <Input id="max-login-attempts" type="number" defaultValue="5" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allowed-ips">IPs autorisées (admin)</Label>
                    <Textarea 
                      id="allowed-ips" 
                      placeholder="Une IP par ligne, laissez vide pour autoriser toutes les IPs"
                    />
                  </div>

                  <Button onClick={handleSave} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder les paramètres de sécurité
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance */}
            <TabsContent value="performance" className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Performance & Cache
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cache-duration">Durée du cache (secondes)</Label>
                      <Input id="cache-duration" type="number" defaultValue="300" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-requests">Requêtes max par minute</Label>
                      <Input id="max-requests" type="number" defaultValue="100" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label>Cache des images</Label>
                        <p className="text-sm text-muted-foreground">Activer le CDN pour les images</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label>Compression Gzip</Label>
                        <p className="text-sm text-muted-foreground">Compresser les réponses HTTP</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label>Lazy loading</Label>
                        <p className="text-sm text-muted-foreground">Chargement différé des ressources</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-upload">Taille max upload (MB)</Label>
                    <Input id="max-upload" type="number" defaultValue="10" />
                  </div>

                  <Button onClick={handleSave} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder les paramètres de performance
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Base de Données
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Actions de maintenance</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Button variant="outline" onClick={handleSave}>
                        Optimiser les tables
                      </Button>
                      <Button variant="outline" onClick={handleSave}>
                        Nettoyer les logs
                      </Button>
                      <Button variant="outline" onClick={handleSave}>
                        Vider le cache
                      </Button>
                      <Button variant="outline" onClick={handleSave}>
                        Backup manuel
                      </Button>
                    </div>
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

export default AdminSystemSettings;
