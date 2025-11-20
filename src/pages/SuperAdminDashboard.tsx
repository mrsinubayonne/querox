import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import UnauthorizedAccess from '@/components/admin/UnauthorizedAccess';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  BarChart3, 
  Users, 
  DollarSign, 
  HeadphonesIcon,
  FileText,
  Globe,
  Activity,
  Settings as SettingsIcon,
  UserCog
} from 'lucide-react';
import GlobalControlPanel from '@/components/super-admin/GlobalControlPanel';
import BusinessMetricsPanel from '@/components/super-admin/BusinessMetricsPanel';
import LiveActivityPanel from '@/components/super-admin/LiveActivityPanel';
import RestaurantsManagementPanel from '@/components/super-admin/RestaurantsManagementPanel';
import RevenueSubscriptionsPanel from '@/components/super-admin/RevenueSubscriptionsPanel';
import SupportPanel from '@/components/super-admin/SupportPanel';
import AuditSecurityPanel from '@/components/super-admin/AuditSecurityPanel';
import TechnicalPerformancePanel from '@/components/super-admin/TechnicalPerformancePanel';
import GlobalAlertsPanel from '@/components/super-admin/GlobalAlertsPanel';
import MultiCountryPanel from '@/components/super-admin/MultiCountryPanel';

const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, loading: authLoading } = useSubscription();
  const [activeMode, setActiveMode] = useState<'super-admin' | 'support' | 'finance' | 'audit' | 'developer'>('super-admin');

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Vérification des droits d'accès...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <UnauthorizedAccess userEmail={user?.email} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Global Control Panel - Always visible at top */}
      <GlobalControlPanel activeMode={activeMode} setActiveMode={setActiveMode} userEmail={user?.email || ''} />

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-5 lg:grid-cols-10 gap-2 h-auto p-2 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Vue d'ensemble</span>
            </TabsTrigger>
            <TabsTrigger value="live" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Live</span>
            </TabsTrigger>
            <TabsTrigger value="restaurants" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Restaurants</span>
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Revenus</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <HeadphonesIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Support</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Audit</span>
            </TabsTrigger>
            <TabsTrigger value="technical" className="flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Technique</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Alertes</span>
            </TabsTrigger>
            <TabsTrigger value="multi-country" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Multi-Pays</span>
            </TabsTrigger>
            <TabsTrigger value="impersonate" className="flex items-center gap-2">
              <UserCog className="w-4 h-4" />
              <span className="hidden sm:inline">Se connecter</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <BusinessMetricsPanel />
          </TabsContent>

          <TabsContent value="live" className="mt-6">
            <LiveActivityPanel />
          </TabsContent>

          <TabsContent value="restaurants" className="mt-6">
            <RestaurantsManagementPanel />
          </TabsContent>

          <TabsContent value="revenue" className="mt-6">
            <RevenueSubscriptionsPanel />
          </TabsContent>

          <TabsContent value="support" className="mt-6">
            <SupportPanel />
          </TabsContent>

          <TabsContent value="audit" className="mt-6">
            <AuditSecurityPanel />
          </TabsContent>

          <TabsContent value="technical" className="mt-6">
            <TechnicalPerformancePanel />
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <GlobalAlertsPanel />
          </TabsContent>

          <TabsContent value="multi-country" className="mt-6">
            <MultiCountryPanel />
          </TabsContent>

          <TabsContent value="impersonate" className="mt-6">
            <div className="bg-card rounded-xl p-8 shadow-lg border border-border">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <UserCog className="w-6 h-6 text-primary" />
                Connexion en tant que restaurant
              </h2>
              <p className="text-muted-foreground mb-6">
                Cette fonctionnalité vous permet de vous connecter à un compte restaurant pour le support ou le débogage.
              </p>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                  ⚠️ Fonctionnalité en cours de développement
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
