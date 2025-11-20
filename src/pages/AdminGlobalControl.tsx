import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import ModernSidebar from '@/components/ModernSidebar';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';
import { Shield, Eye, Headphones, DollarSign, FileText, Code, Activity } from 'lucide-react';

const AdminGlobalControl: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, loading: authLoading } = useSubscription();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMode, setActiveMode] = useState<string>('super-admin');

  const modes = [
    { id: 'super-admin', label: 'Super Admin', icon: Shield, color: 'from-red-500 to-red-600' },
    { id: 'support', label: 'Support', icon: Headphones, color: 'from-blue-500 to-blue-600' },
    { id: 'finance', label: 'Finance', icon: DollarSign, color: 'from-green-500 to-green-600' },
    { id: 'audit', label: 'Audit', icon: FileText, color: 'from-purple-500 to-purple-600' },
    { id: 'developer', label: 'Développeur', icon: Code, color: 'from-orange-500 to-orange-600' },
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
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Contrôle Global - Vue 360°</h1>
              <p className="text-sm text-muted-foreground">Surveillance complète de Querox en temps réel</p>
            </div>
          </div>

          {/* Mode Switcher */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Mode de Contrôle
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {modes.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = activeMode === mode.id;
                  
                  return (
                    <Button
                      key={mode.id}
                      variant={isActive ? 'default' : 'outline'}
                      className={`h-auto py-4 flex-col gap-2 ${
                        isActive ? `bg-gradient-to-br ${mode.color} text-white hover:opacity-90` : ''
                      }`}
                      onClick={() => setActiveMode(mode.id)}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-xs font-medium">{mode.label}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Real-time Monitoring */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Commandes Live</span>
                  <Badge variant="secondary" className="bg-blue-600 text-white">
                    En direct
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">0</div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">commandes en cours</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">Nouveaux Restaurants</span>
                  <Badge variant="secondary" className="bg-green-600 text-white">
                    24h
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-green-700 dark:text-green-300">0</div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">inscriptions récentes</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Incidents Techniques</span>
                  <Badge variant="secondary" className="bg-orange-600 text-white">
                    Actif
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">0</div>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">erreurs détectées</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">Erreurs API</span>
                  <Badge variant="secondary" className="bg-red-600 text-white">
                    Critique
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-red-700 dark:text-red-300">0</div>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">échecs API récents</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Logs de Sécurité</span>
                  <Badge variant="secondary" className="bg-purple-600 text-white">
                    Surveillé
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">0</div>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">événements de sécurité</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-teal-700 dark:text-teal-300">Pics de Trafic</span>
                  <Badge variant="secondary" className="bg-teal-600 text-white">
                    Normal
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-teal-700 dark:text-teal-300">0%</div>
                <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">charge serveur</p>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">État du Système</h3>
              <div className="space-y-3">
                {[
                  { service: 'API Principale', status: 'operational', uptime: '99.9%' },
                  { service: 'Base de données', status: 'operational', uptime: '99.99%' },
                  { service: 'Service de paiement', status: 'operational', uptime: '99.8%' },
                  { service: 'Service de notification', status: 'operational', uptime: '99.5%' },
                ].map((item) => (
                  <div key={item.service} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="font-medium">{item.service}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">Uptime: {item.uptime}</span>
                      <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                        Opérationnel
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminGlobalControl;
